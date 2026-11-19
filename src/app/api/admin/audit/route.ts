import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only store owners can view security audit logs' },
        { status: 403 }
      );
    }

    const logs = await db.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error('Audit GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
