import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from '@/lib/auth/session';
import {
  getAllowedAdminAccounts,
  hashAdminOtp,
  loadAdminOtpTokens,
  saveAdminOtpTokens,
} from '@/lib/auth/admin-otp';
import { db } from '@/lib/db';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    if (!isLocalhost) {
      const rateCheck = checkLoginRateLimit(ip);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { success: false, error: `Too many attempts. Wait ${rateCheck.remainingWaitSec}s.` },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const cleanEmail = String(body?.email || '').trim().toLowerCase();
    const cleanOtp = String(body?.otp || '').trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email and 6-digit OTP.' },
        { status: 400 }
      );
    }

    const allowed = getAllowedAdminAccounts();
    const adminUser = allowed.find((a) => a.email === cleanEmail);
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized email.' }, { status: 403 });
    }

    const tokens = await loadAdminOtpTokens();
    const record = tokens[cleanEmail];

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'No active OTP found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt) {
      delete tokens[cleanEmail];
      await saveAdminOtpTokens(tokens);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      delete tokens[cleanEmail];
      await saveAdminOtpTokens(tokens);
      return NextResponse.json(
        { success: false, error: 'Too many wrong attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    const candidateHash = Buffer.from(hashAdminOtp(cleanEmail, cleanOtp), 'hex');
    const storedHash = Buffer.from(record.otpHash, 'hex');
    const isMatch =
      candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);

    if (!isMatch) {
      record.attempts += 1;
      tokens[cleanEmail] = record;
      await saveAdminOtpTokens(tokens);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid OTP. ${Math.max(0, MAX_ATTEMPTS - record.attempts)} attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // Valid OTP — consume token (one-time use)
    delete tokens[cleanEmail];
    await saveAdminOtpTokens(tokens);
    resetLoginRateLimit(ip);

    const token = signSessionToken({
      userId: adminUser.userId,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    await db.recordAudit({
      userEmail: adminUser.email,
      action: 'login_otp',
      entityType: 'auth',
      details: { role: adminUser.role, ip, timestamp: new Date().toISOString() },
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });

    const isHttps =
      req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 3600,
    });

    return res;
  } catch (err) {
    console.error('Admin OTP verify error:', err);
    return NextResponse.json({ success: false, error: 'Failed to verify OTP.' }, { status: 500 });
  }
}
