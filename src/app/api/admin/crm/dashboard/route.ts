import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await crmDb.getDashboardMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    console.error('CRM Dashboard GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CRM dashboard metrics' },
      { status: 500 }
    );
  }
}
