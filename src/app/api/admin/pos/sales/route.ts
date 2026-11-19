import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sales = await db.getSales();
    const settings = await db.getSettings();

    return NextResponse.json({ success: true, sales: sales.slice(0, 100), settings });
  } catch (err: any) {
    console.error('Sales GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch sales history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart cannot be empty' }, { status: 400 });
    }

    const sale = await db.createSale({
      ...body,
      cashierName: session.name || session.email,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'bill_generated',
      entityType: 'sale',
      entityId: sale.id,
      details: {
        invoiceNumber: sale.invoiceNumber,
        grandTotal: sale.grandTotal,
        paymentMode: sale.paymentMode,
        customerName: sale.customerName,
      },
    });

    return NextResponse.json({ success: true, sale });
  } catch (err: any) {
    console.error('POS Sale POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to complete sale transaction' },
      { status: 500 }
    );
  }
}
