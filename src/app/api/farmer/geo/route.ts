import { NextRequest, NextResponse } from 'next/server';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get('districtId') || undefined;
    const blockId = searchParams.get('blockId') || undefined;

    const [districts, blocks, villages, species] = await Promise.all([
      aquaDb.getDistricts(),
      aquaDb.getBlocks(districtId),
      aquaDb.getVillages(blockId),
      aquaDb.getSpecies(),
    ]);

    return NextResponse.json({
      success: true,
      districts,
      blocks,
      villages,
      species,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
