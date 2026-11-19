import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await db.getDashboardMetrics();

    // If role is cashier, redact owner-only profit metrics
    if (session.role === 'cashier') {
      return NextResponse.json({
        success: true,
        metrics: {
          ...metrics,
          todayProfit: 0,
          salesTrend7Days: metrics.salesTrend7Days.map((d) => ({ ...d, profit: 0 })),
        },
      });
    }

    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    console.error('Dashboard metrics error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard metrics' },
      { status: 500 }
    );
  }
}
