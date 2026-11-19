import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    // Allow admin staff desk access
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get('districtId') || undefined;
    const blockId = searchParams.get('blockId') || undefined;
    const villageId = searchParams.get('villageId') || undefined;
    const verificationStatus = (searchParams.get('verificationStatus') as any) || undefined;

    const [metrics, farmers, ponds, cycles, stocking, duplicates] = await Promise.all([
      aquaDb.getDashboardMetrics(),
      aquaDb.listFarmers({ districtId, blockId, villageId, verificationStatus }),
      aquaDb.listPonds(),
      aquaDb.listCycles(),
      aquaDb.listStocking(),
      aquaDb.getDuplicateAlerts(),
    ]);

    return NextResponse.json({
      success: true,
      metrics,
      farmers,
      ponds,
      cycles,
      stocking,
      duplicates,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
