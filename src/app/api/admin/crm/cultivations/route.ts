import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get('plotId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;

    const cultivations = await crmDb.getCultivations(plotId, customerId);
    return NextResponse.json({ success: true, cultivations });
  } catch (err: any) {
    console.error('CRM Cultivations GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cultivations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.plotId || !body.customerId || !body.kind || !body.cropOrSpeciesName) {
      return NextResponse.json(
        { success: false, error: 'Plot ID, Customer ID, Kind, and Crop/Species Name are required' },
        { status: 400 }
      );
    }

    const cult = await crmDb.createCultivation(body);
    return NextResponse.json({ success: true, cultivation: cult });
  } catch (err: any) {
    console.error('CRM Cultivations POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create cultivation' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Cultivation ID is required' }, { status: 400 });
    }

    const cult = await crmDb.updateCultivation(body.id, body);
    return NextResponse.json({ success: true, cultivation: cult });
  } catch (err: any) {
    console.error('CRM Cultivations PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update cultivation' },
      { status: 500 }
    );
  }
}
