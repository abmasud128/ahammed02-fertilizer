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
    return NextResponse.json({
      success: true,
      lowStockCount: metrics.lowStockCount,
      expiringCount: metrics.expiringCount,
      lowStockProducts: metrics.lowStockProducts,
      expiringBatches: metrics.expiringBatches,
    });
  } catch (err: any) {
    console.error('Stock alerts error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
