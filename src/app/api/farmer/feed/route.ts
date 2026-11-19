import { NextRequest, NextResponse } from 'next/server';
import { getFarmerSession } from '@/lib/aqua/auth';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized (401)' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productionCycleId = searchParams.get('cycleId') || undefined;
    const pondId = searchParams.get('pondId') || undefined;

    const records = await aquaDb.listFeedEvents({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
    });
    const brands = await aquaDb.getFeedBrands();

    return NextResponse.json({ success: true, records, brands });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized (401)' }, { status: 401 });
    }

    const body = await req.json();
    const {
      productionCycleId,
      pondId,
      feedBrandId,
      feedDate,
      feedingTime,
      quantityKg,
      feedingMethod,
      weatherCondition,
      isEstimated,
    } = body;

    if (!productionCycleId || !feedDate || !quantityKg) {
      return NextResponse.json(
        { success: false, error: 'Cycle, feed date, and quantity are required' },
        { status: 400 }
      );
    }

    const qty = Number(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ success: false, error: 'Valid feed quantity (> 0 kg) is required' }, { status: 400 });
    }

    const record = await aquaDb.addFeedEvent({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
      feedBrandId: feedBrandId || undefined,
      feedDate,
      feedingTime: feedingTime || 'সকাল',
      quantityKg: qty,
      feedingMethod: feedingMethod || 'হাতে ছিটানো (Broadcast)',
      weatherCondition: weatherCondition || 'রৌদ্রোজ্জ্বল (Sunny)',
      isEstimated: !!isEstimated,
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Feed event logged successfully', record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
