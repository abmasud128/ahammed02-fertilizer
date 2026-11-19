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

    const records = await aquaDb.listStocking({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
    });

    return NextResponse.json({ success: true, records });
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
      speciesId,
      stockingDate,
      fryCount,
      avgWeightGrams,
      seedStage,
      supplierName,
      totalCost,
      isEstimated,
      notes,
    } = body;

    if (!productionCycleId || !speciesId || !stockingDate) {
      return NextResponse.json(
        { success: false, error: 'Cycle, species, and stocking date are required' },
        { status: 400 }
      );
    }

    const count = Number(fryCount);
    if (isNaN(count) || count <= 0) {
      return NextResponse.json({ success: false, error: 'Valid fry/fingerling count (> 0) is required' }, { status: 400 });
    }

    const avgWeight = Number(avgWeightGrams);
    if (isNaN(avgWeight) || avgWeight < 0) {
      return NextResponse.json({ success: false, error: 'Valid average weight in grams is required' }, { status: 400 });
    }

    const record = await aquaDb.addStocking({
      productionCycleId,
      speciesId,
      stockingDate,
      fryCount: count,
      avgWeightGrams: avgWeight,
      seedStage: seedStage || 'fingerling',
      supplierName: supplierName || '',
      totalCost: Number(totalCost) || 0,
      isEstimated: !!isEstimated,
      notes: notes || '',
      createdById: session.farmerId,
      farmerId: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Stocking record saved successfully', record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
