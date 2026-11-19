import { NextRequest, NextResponse } from 'next/server';
import { getFarmerSession } from '@/lib/aqua/auth';
import { aquaDb } from '@/lib/aqua/db';

export async function GET() {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized (401)' }, { status: 401 });
    }

    const ponds = await aquaDb.listPonds({ farmerId: session.farmerId });
    return NextResponse.json({ success: true, ponds });
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
    const { name, areaDecimal, waterDepthFt, waterSource, soilType, hasDrainage, hasAeration, preparationDate, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Pond name is required' }, { status: 400 });
    }

    const numArea = Number(areaDecimal);
    if (isNaN(numArea) || numArea <= 0) {
      return NextResponse.json({ success: false, error: 'Valid pond area in decimals is required (> 0)' }, { status: 400 });
    }

    const pond = await aquaDb.createPond({
      farmerId: session.farmerId,
      name: name.trim(),
      areaDecimal: numArea,
      waterDepthFt: Number(waterDepthFt) || 5.0,
      waterSource: waterSource || 'rainfed',
      soilType: soilType || 'alluvial',
      hasDrainage: !!hasDrainage,
      hasAeration: !!hasAeration,
      preparationDate: preparationDate || undefined,
      notes: notes || '',
      createdById: session.farmerId,
    });

    return NextResponse.json({ success: true, message: 'Pond registered successfully', pond });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
