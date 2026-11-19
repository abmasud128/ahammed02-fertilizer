import { NextRequest, NextResponse } from 'next/server';
import { aquaDb } from '@/lib/aqua/db';
import { signFarmerSessionToken, FARMER_SESSION_COOKIE_NAME } from '@/lib/aqua/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      fatherName,
      mobileNumber,
      pin,
      districtId,
      blockId,
      villageId,
      address,
      pinCode,
      experienceYears,
      pondCount,
      totalWaterAreaDecimal,
      primarySpecies,
      consentDataCollection,
      consentDataSharing,
      consentPhotoUse,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    const cleanMobile = (mobileNumber || '').replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    if (!districtId || !blockId || !villageId) {
      return NextResponse.json(
        { success: false, error: 'District, Block, and Village must be selected' },
        { status: 400 }
      );
    }

    // Mandatory consent check
    if (!consentDataCollection) {
      return NextResponse.json(
        { success: false, error: 'Consent for data collection and verification is required' },
        { status: 400 }
      );
    }

    const { farmer, duplicateWarning } = await aquaDb.registerFarmer({
      fullName: fullName.trim(),
      fatherName: fatherName ? fatherName.trim() : undefined,
      mobileNumber: cleanMobile,
      pin: pin ? pin.trim() : cleanMobile.slice(0, 6),
      districtId,
      blockId,
      villageId,
      address: address || '',
      pinCode: pinCode || '733124',
      experienceYears: Number(experienceYears) || 1,
      pondCount: Number(pondCount) || 1,
      totalWaterAreaDecimal: Number(totalWaterAreaDecimal) || 0,
      primarySpecies: Array.isArray(primarySpecies) ? primarySpecies : [],
      consentDataCollection: !!consentDataCollection,
      consentDataSharing: !!consentDataSharing,
      consentPhotoUse: !!consentPhotoUse,
      createdByRole: 'farmer',
    });

    // Submissions require Admin approval from Aquaculture Hub before login is permitted.
    return NextResponse.json({
      success: true,
      pendingVerification: true,
      message:
        'আপনার নিবন্ধনের আবেদনটি সফলভাবে যাচাইয়ের জন্য জমা হয়েছে। আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে অ্যাডমিন অনুমোদনের পর আপনি আপনার প্রথম ৬ সংখ্যার পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।',
      farmer: {
        id: farmer.id,
        registrationNumber: farmer.registrationNumber,
        fullName: farmer.fullName,
        fatherName: farmer.fatherName,
        mobileNumber: farmer.mobileNumber,
        villageName: farmer.villageName,
        pondCount: farmer.pondCount,
        totalWaterAreaDecimal: farmer.totalWaterAreaDecimal,
        primarySpecies: farmer.primarySpecies,
        verificationStatus: farmer.verificationStatus,
      },
      duplicateWarning,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Registration failed' }, { status: 400 });
  }
}
