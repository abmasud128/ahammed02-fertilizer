import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId') || undefined;

    const records = await aquaDb.listProblems({ farmerId });
    const farmers = await aquaDb.listFarmers();
    const ponds = await aquaDb.listPonds();

    const enriched = records.map((r) => {
      const f = farmers.find((farm) => farm.id === r.farmerId);
      const p = ponds.find((pond) => pond.id === r.pondId);
      return {
        ...r,
        farmerName: f?.fullName || 'Unknown Farmer',
        farmerPhone: f?.mobileNumber || '',
        pondName: p?.name || 'Main Pond',
      };
    });

    return NextResponse.json({ success: true, records: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'user-owner-1';

    const body = await req.json();
    const {
      farmerId,
      pondId,
      productionCycleId,
      reportDate,
      problemCategory,
      symptomDescription,
      affectedSpeciesId,
      severity,
      photoUrls,
    } = body;

    if (!farmerId || !reportDate || !symptomDescription) {
      return NextResponse.json(
        { success: false, error: 'Farmer, date, and symptom description are required' },
        { status: 400 }
      );
    }

    const record = await aquaDb.addProblem({
      farmerId,
      pondId: pondId || '',
      productionCycleId: productionCycleId || `cycle-${farmerId}`,
      reportDate,
      problemCategory: problemCategory || 'water_quality',
      symptomDescription,
      affectedSpeciesId: affectedSpeciesId || 'spec-rohu',
      severity: severity || 'moderate',
      photoUrls: photoUrls || [],
      verificationStatus: 'verified',
      createdById: userId,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
