import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    let customers = await db.getCustomers();

    if (query) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          (c.village && c.village.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error('Customers GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    const newCustomer = await db.createCustomer(body);

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_created',
      entityType: 'customer',
      entityId: newCustomer.id,
      details: { name: newCustomer.name, phone: newCustomer.phone, village: newCustomer.village },
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (err: any) {
    console.error('Customers POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create customer' },
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
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    const updated = await db.updateCustomer(body.id, {
      name: body.name.trim(),
      phone: body.phone.trim(),
      fatherName: body.fatherName !== undefined ? body.fatherName.trim() : undefined,
      village: body.village !== undefined ? body.village.trim() : undefined,
      para: body.para !== undefined ? body.para.trim() : undefined,
      aadhaar: body.aadhaar !== undefined ? body.aadhaar.trim() : undefined,
      landArea: body.landArea !== undefined ? body.landArea.trim() : undefined,
      primaryCrops: Array.isArray(body.primaryCrops) ? body.primaryCrops : undefined,
      creditLimit: body.creditLimit !== undefined ? Math.max(0, Number(body.creditLimit) || 0) : undefined,
      notes: body.notes !== undefined ? body.notes.trim() : undefined,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_updated',
      entityType: 'customer',
      entityId: updated.id,
      details: {
        name: updated.name,
        phone: updated.phone,
        village: updated.village,
        creditLimit: updated.creditLimit,
        notes: updated.notes,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: any) {
    console.error('Customers PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update customer' },
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
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const customer = await db.getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    if (customer.currentDue > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete customer with pending credit balance (Due: ₹${customer.currentDue})` },
        { status: 400 }
      );
    }

    const deleted = await db.deleteCustomer(id);

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_deleted',
      entityType: 'customer',
      entityId: id,
      details: { name: customer.name, phone: customer.phone },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    console.error('Customers DELETE error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
