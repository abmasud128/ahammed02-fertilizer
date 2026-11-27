import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from '@/lib/auth/session';
import { loadAdminCredentials } from '@/lib/auth/admin-otp';
import { db } from '@/lib/db';

const ownerEmail = (process.env.ADMIN_LOGIN_EMAIL || 'abmasud128@gmail.com').trim().toLowerCase();
const ownerPassword = process.env.ADMIN_LOGIN_PASSWORD || 'Masud123@...';

function matchesSecret(input: string, expected: string): boolean {
  const inputHash = createHash('sha256').update(input).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting Check (bypass for local development to prevent accidental lockouts)
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    if (!isLocalhost) {
      const rateCheck = checkLoginRateLimit(ip);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Too many login attempts. Please wait ${rateCheck.remainingWaitSec} seconds before trying again.`,
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const storedCreds = await loadAdminCredentials();
    const customCred = storedCreds[cleanEmail];

    let isOwner = false;
    if (cleanEmail === ownerEmail) {
      if (customCred?.passwordHash) {
        isOwner = await bcrypt.compare(cleanPass, customCred.passwordHash);
      } else {
        isOwner = matchesSecret(cleanPass, ownerPassword);
      }
    }

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    resetLoginRateLimit(ip);

    const role = 'owner';
    const fullName = 'Ahammed Masud (Owner)';
    const finalEmail = cleanEmail;

    // Sign JWT Token
    const token = signSessionToken({
      userId: 'user-owner-1',
      email: finalEmail,
      name: fullName,
      role,
    });

    // Record audit log
    await db.recordAudit({
      userEmail: finalEmail,
      action: 'login',
      entityType: 'auth',
      details: { role, ip, timestamp: new Date().toISOString() },
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: 'user-owner-1',
        email: finalEmail,
        name: fullName,
        role,
      },
    });

    // Set HTTP-Only Cookie (12 hours) - only secure if HTTPS
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 3600,
    });

    return res;
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
