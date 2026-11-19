import { NextResponse } from 'next/server';
import { getFarmerSession, FARMER_SESSION_COOKIE_NAME } from '@/lib/aqua/auth';
import { aquaDb } from '@/lib/aqua/db';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, farmer: null }, { status: 401 });
    }

    // 1. Fertilizer Farmer Session
    if (session.portalType === 'fertilizer') {
      const customers = await db.getCustomers();
      const customer = customers.find(
        (c) =>
          c.id === session.farmerId ||
          c.phone.replace(/\D/g, '').slice(-10) === session.mobileNumber.replace(/\D/g, '').slice(-10)
      );

      if (!customer) {
        return NextResponse.json({ authenticated: false, farmer: null }, { status: 404 });
      }

      return NextResponse.json({
        authenticated: true,
        portalType: 'fertilizer',
        farmer: {
          id: customer.id,
          registrationNumber: customer.id,
          fullName: customer.name,
          fatherName: customer.fatherName,
          mobileNumber: customer.phone,
          villageName: customer.village || 'Dakshin Dinajpur',
          para: customer.para,
          aadhaarMasked: customer.aadhaar
            ? `•••• •••• ${customer.aadhaar.slice(-4)}`
            : undefined,
          landArea: customer.landArea,
          primaryCrops: customer.primaryCrops || [],
          creditLimit: customer.creditLimit || 25000,
          currentDue: customer.currentDue || 0,
          memberSince: customer.createdAt,
        },
      });
    }

    // 2. Aquaculture Farmer Session
    const farmer = await aquaDb.getFarmerById(session.farmerId);
    if (!farmer) {
      return NextResponse.json({ authenticated: false, farmer: null }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      portalType: 'aquaculture',
      farmer: {
        id: farmer.id,
        registrationNumber: farmer.registrationNumber,
        fullName: farmer.fullName,
        mobileNumber: farmer.mobileNumber,
        villageName: farmer.villageName,
        districtId: farmer.districtId,
        blockId: farmer.blockId,
        villageId: farmer.villageId,
        pondCount: farmer.pondCount,
        totalWaterAreaDecimal: farmer.totalWaterAreaDecimal,
        experienceYears: farmer.experienceYears,
        verificationStatus: farmer.verificationStatus,
        status: farmer.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set(FARMER_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
