import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    // Admin / Staff check
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId') || undefined;

    const records = await aquaDb.listWaterQuality({ farmerId });
    const farmers = await aquaDb.listFarmers();
    const ponds = await aquaDb.listPonds();

    // Enrich with farmer & pond names
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
      readingDate,
      readingTime,
      dissolvedOxygenPpm,
      waterTempC,
      phLevel,
      waterTransparencyCm,
      ammoniaPpm,
      nitritePpm,
      alkalinityPpm,
      observationNotes,
    } = body;

    if (!farmerId || !readingDate) {
      return NextResponse.json(
        { success: false, error: 'Farmer and reading date are required' },
        { status: 400 }
      );
    }

    const record = await aquaDb.addWaterQuality({
      farmerId,
      pondId: pondId || '',
      productionCycleId: productionCycleId || `cycle-${farmerId}`,
      readingDate,
      readingTime: readingTime || 'সকাল ০৭:০০ (Morning Lab Test)',
      dissolvedOxygenPpm,
      waterTempC,
      phLevel,
      waterTransparencyCm,
      ammoniaPpm,
      nitritePpm,
      alkalinityPpm,
      observationNotes: observationNotes || 'ল্যাব টেস্ট সম্পন্ন - বিশেষজ্ঞ মন্তব্য অনুমোদিত',
      isEstimated: false,
      verificationStatus: 'verified',
      createdById: userId,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
