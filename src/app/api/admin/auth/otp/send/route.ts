import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { checkLoginRateLimit } from '@/lib/auth/session';
import {
  getAllowedAdminAccounts,
  hashAdminOtp,
  loadAdminOtpTokens,
  saveAdminOtpTokens,
} from '@/lib/auth/admin-otp';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

async function sendOtpEmail(toEmail: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  const subject = `Your Ahammed Fertilizer Admin OTP: ${otp}`;
  const html = `
    <div style="font-family:sans-serif;max-width:460px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#0B3D2E;margin:0 0 8px;">Ahammed Fertilizer Admin Login</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 16px;">Use the 6-digit verification code below to sign in to your Admin Dashboard. This code expires in <strong>5 minutes</strong>.</p>
      <div style="background:#f0fdf4;border:1px dashed #16a34a;border-radius:10px;padding:16px;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;color:#0B3D2E;">
        ${otp}
      </div>
      <p style="color:#6b7280;font-size:12px;margin:16px 0 0;">If you did not request this login, you can safely ignore this email.</p>
    </div>
  `;

  if (resendKey) {
    const from = process.env.OTP_FROM_EMAIL || 'Ahammed Fertilizer <onboarding@resend.dev>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [toEmail], subject, html }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `Resend error: ${errBody}` };
    }
    return { ok: true };
  }

  if (brevoKey) {
    const senderEmail = process.env.OTP_FROM_EMAIL || 'abmasud128@gmail.com';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Ahammed Fertilizer', email: senderEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `Brevo error: ${errBody}` };
    }
    return { ok: true };
  }

  return {
    ok: false,
    error: 'Email OTP is not configured yet. Add RESEND_API_KEY or BREVO_API_KEY in environment variables.',
  };
}

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
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid admin email.' }, { status: 400 });
    }

    const allowed = getAllowedAdminAccounts();
    const matchedAdmin = allowed.find((a) => a.email === cleanEmail);
    if (!matchedAdmin) {
      return NextResponse.json(
        { success: false, error: 'This email is not authorized for Admin OTP login.' },
        { status: 403 }
      );
    }

    const tokens = await loadAdminOtpTokens();
    const existing = tokens[cleanEmail];
    if (existing && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
      return NextResponse.json(
        { success: false, error: `Please wait ${waitSec}s before requesting another OTP.` },
        { status: 429 }
      );
    }

    const otp = String(randomInt(100000, 1000000));
    const emailResult = await sendOtpEmail(cleanEmail, otp);
    if (!emailResult.ok) {
      return NextResponse.json({ success: false, error: emailResult.error }, { status: 500 });
    }

    tokens[cleanEmail] = {
      otpHash: hashAdminOtp(cleanEmail, otp),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      sentAt: Date.now(),
    };

    for (const key of Object.keys(tokens)) {
      if (tokens[key].expiresAt < Date.now()) delete tokens[key];
    }

    await saveAdminOtpTokens(tokens);

    return NextResponse.json({
      success: true,
      message: `6-digit OTP sent to ${cleanEmail}. Valid for 5 minutes.`,
    });
  } catch (err) {
    console.error('Admin OTP send error:', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP.' }, { status: 500 });
  }
}
