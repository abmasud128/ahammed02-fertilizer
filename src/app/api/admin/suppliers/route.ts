import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const suppliers = await db.getSuppliers();
    return NextResponse.json({ success: true, suppliers });
  } catch (err: any) {
    console.error('Suppliers GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can manage suppliers' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ success: false, error: 'Supplier name and phone are required' }, { status: 400 });
    }

    const newSupplier = await db.createSupplier(body);

    await db.recordAudit({
      userEmail: session.email,
      action: 'supplier_created',
      entityType: 'supplier',
      entityId: newSupplier.id,
      details: { name: newSupplier.name, phone: newSupplier.phone },
    });

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (err: any) {
    console.error('Suppliers POST error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create supplier' }, { status: 500 });
  }
}
