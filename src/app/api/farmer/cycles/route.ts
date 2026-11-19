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
    const pondId = searchParams.get('pondId') || undefined;

    const cycles = await aquaDb.listCycles({
      farmerId: session.farmerId,
      pondId,
    });

    return NextResponse.json({ success: true, cycles });
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
    const { pondId, cycleName, startDate, targetHarvestDate, isAuthorizedOverlap, notes } = body;

    if (!pondId) {
      return NextResponse.json({ success: false, error: 'Pond selection is required' }, { status: 400 });
    }
    if (!cycleName || !cycleName.trim()) {
      return NextResponse.json({ success: false, error: 'Cycle name is required' }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ success: false, error: 'Cycle start date is required' }, { status: 400 });
    }

    const cycle = await aquaDb.createCycle({
      farmerId: session.farmerId,
      pondId,
      cycleName: cycleName.trim(),
      startDate,
      targetHarvestDate: targetHarvestDate || undefined,
      isAuthorizedOverlap: !!isAuthorizedOverlap,
      notes: notes || '',
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Production cycle started successfully', cycle });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
