import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;
    const blockId = searchParams.get('blockId') || undefined;
    const villageId = searchParams.get('villageId') || undefined;

    const farmers = await aquaDb.listFarmers({ search, blockId, villageId });
    return NextResponse.json({ success: true, farmers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      mobileNumber,
      pin,
      districtId,
      blockId,
      villageId,
      address,
      experienceYears,
      pondCount,
      totalWaterAreaDecimal,
      consentDataCollection,
      consentDataSharing,
      consentPhotoUse,
    } = body;

    if (!fullName || !mobileNumber || !districtId || !blockId || !villageId) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile number, district, block, and village are required' },
        { status: 400 }
      );
    }

    const result = await aquaDb.registerFarmer({
      fullName,
      mobileNumber,
      pin: pin || '1234',
      districtId,
      blockId,
      villageId,
      address,
      experienceYears: Number(experienceYears) || 1,
      pondCount: Number(pondCount) || 1,
      totalWaterAreaDecimal: Number(totalWaterAreaDecimal) || 0,
      consentDataCollection: !!consentDataCollection,
      consentDataSharing: !!consentDataSharing,
      consentPhotoUse: !!consentPhotoUse,
      createdByRole: session.role === 'owner' ? 'super_admin' : 'shop_operator',
      createdById: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Farmer registered successfully by shop staff',
      farmer: result.farmer,
      duplicateWarning: result.duplicateWarning,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
