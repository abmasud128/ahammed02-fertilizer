import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId') || undefined;

    const records = await aquaDb.listInterventions({ farmerId });
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
      problemReportId,
      treatmentDate,
      prescribedBy,
      medicineOrChemicalName,
      dosage,
      applicationMethod,
      targetCondition,
      notes,
    } = body;

    if (!farmerId || !treatmentDate || !medicineOrChemicalName || !dosage) {
      return NextResponse.json(
        { success: false, error: 'Farmer, date, medicine name, and dosage are required' },
        { status: 400 }
      );
    }

    const record = await aquaDb.addIntervention({
      farmerId,
      pondId: pondId || '',
      productionCycleId: productionCycleId || `cycle-${farmerId}`,
      problemReportId,
      prescribedBy: prescribedBy || 'Ahammed Fertilizer Aquaculture Specialist',
      treatmentDate,
      medicineOrChemicalName,
      dosage,
      applicationMethod: applicationMethod || 'Dissolved in water and broadcast evenly over pond',
      targetCondition: targetCondition || 'Water conditioning & health management',
      notes: notes || '',
      verificationStatus: 'verified',
      createdById: userId,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
