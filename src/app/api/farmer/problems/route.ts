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

    const records = await aquaDb.listProblems({
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
  return NextResponse.json(
    {
      success: false,
      error: 'Problem & disease diagnoses are strictly conducted and managed by Admin at the Aquaculture Hub. Farmers have read-only viewing access.',
    },
    { status: 403 }
  );
}
