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

    const records = await aquaDb.listMortality({
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
      eventDate,
      deadCount,
      suspectedCause,
      isEstimated,
    } = body;

    if (!productionCycleId || !eventDate || !deadCount) {
      return NextResponse.json(
        { success: false, error: 'Cycle, event date, and dead count are required' },
        { status: 400 }
      );
    }

    const count = Number(deadCount);
    if (isNaN(count) || count <= 0) {
      return NextResponse.json({ success: false, error: 'Valid dead count (> 0) is required' }, { status: 400 });
    }

    const record = await aquaDb.addMortality({
      farmerId: session.farmerId,
      productionCycleId,
      pondId,
      speciesId: speciesId || undefined,
      eventDate,
      deadCount: count,
      suspectedCause: suspectedCause || '',
      isEstimated: !!isEstimated,
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Mortality event logged successfully', record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
