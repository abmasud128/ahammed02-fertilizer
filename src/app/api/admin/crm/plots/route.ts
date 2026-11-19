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
    const customerId = searchParams.get('customerId') || undefined;

    const plots = await crmDb.getPlots(customerId);
    return NextResponse.json({ success: true, plots });
  } catch (err: any) {
    console.error('CRM Plots GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plots' },
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
    if (!body.customerId || !body.name || !body.areaValue || !body.areaUnit) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, Plot Name, Area Value and Unit are required' },
        { status: 400 }
      );
    }

    const plot = await crmDb.createPlot(body);
    return NextResponse.json({ success: true, plot });
  } catch (err: any) {
    console.error('CRM Plots POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create plot' },
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
      return NextResponse.json({ success: false, error: 'Plot ID is required' }, { status: 400 });
    }

    const plot = await crmDb.updatePlot(body.id, body);
    return NextResponse.json({ success: true, plot });
  } catch (err: any) {
    console.error('CRM Plots PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update plot' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plot ID is required' }, { status: 400 });
    }

    const deleted = await crmDb.deletePlot(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    console.error('CRM Plots DELETE error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete plot' },
      { status: 500 }
    );
  }
}
