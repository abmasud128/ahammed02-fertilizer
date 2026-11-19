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

    const records = await aquaDb.listGrowthSamples({
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
      sampleDate,
      sampleCount,
      avgWeightGrams,
      avgLengthCm,
      calculatedAdgGrams,
      isEstimated,
    } = body;

    if (!productionCycleId || !speciesId || !sampleDate || !avgWeightGrams) {
      return NextResponse.json(
        { success: false, error: 'Cycle, species, sample date, and average weight are required' },
        { status: 400 }
      );
    }

    const weight = Number(avgWeightGrams);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json({ success: false, error: 'Valid average weight (> 0g) is required' }, { status: 400 });
    }

    const record = await aquaDb.addGrowthSample({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
      speciesId,
      sampleDate,
      sampleCount: Number(sampleCount) || 10,
      avgWeightGrams: weight,
      avgLengthCm: avgLengthCm ? Number(avgLengthCm) : undefined,
      calculatedAdgGrams: calculatedAdgGrams ? Number(calculatedAdgGrams) : undefined,
      isEstimated: !!isEstimated,
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Growth sample recorded successfully', record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
