import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const efficacy = await crmDb.getProductEfficacy();
    const metrics = await crmDb.getDashboardMetrics();

    return NextResponse.json({
      success: true,
      efficacy,
      casesByCategory: metrics.casesByCategory,
      disclaimer:
        'Statistical Note: Outcomes reflect observed farmer reports ("associated with") and are calculated only for sample sizes of 5 or more cases (N >= 5). Not intended as formal clinical causality.',
    });
  } catch (err: any) {
    console.error('CRM Analytics GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CRM analytics' },
      { status: 500 }
    );
  }
}
