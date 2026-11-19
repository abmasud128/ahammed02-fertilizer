import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      await db.recordAudit({
        userEmail: session.email,
        action: 'logout',
        entityType: 'auth',
        details: { role: session.role },
      });
    }

    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });

    res.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
