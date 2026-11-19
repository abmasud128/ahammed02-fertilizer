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

    const records = await aquaDb.listHarvests({
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
      pondId,
      speciesId,
      harvestDate,
      harvestType,
      totalWeightKg,
      pieceCount,
      avgWeightGrams,
      buyerName,
      pricePerKg,
      totalRevenue,
      isEstimated,
    } = body;

    if (!productionCycleId || !speciesId || !harvestDate || !totalWeightKg) {
      return NextResponse.json(
        { success: false, error: 'Cycle, species, harvest date, and total weight are required' },
        { status: 400 }
      );
    }

    const weight = Number(totalWeightKg);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json({ success: false, error: 'Valid total weight (> 0 kg) is required' }, { status: 400 });
    }

    const record = await aquaDb.addHarvest({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
      speciesId,
      harvestDate,
      harvestType: harvestType || 'partial',
      totalWeightKg: weight,
      pieceCount: pieceCount ? Number(pieceCount) : undefined,
      avgWeightGrams: avgWeightGrams ? Number(avgWeightGrams) : undefined,
      buyerName: buyerName || '',
      pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
      totalRevenue: totalRevenue ? Number(totalRevenue) : undefined,
      isEstimated: !!isEstimated,
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Harvest record saved successfully', record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
