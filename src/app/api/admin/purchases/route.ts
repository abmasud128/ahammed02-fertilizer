import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const purchases = await db.getPurchases();
    return NextResponse.json({ success: true, purchases });
  } catch (err: any) {
    console.error('Purchases GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can record purchases' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.supplierId || !body.invoiceNo || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Supplier, invoice number, and at least one item are required' },
        { status: 400 }
      );
    }

    const purchase = await db.createPurchase(body);

    await db.recordAudit({
      userEmail: session.email,
      action: 'purchase_created',
      entityType: 'purchase',
      entityId: purchase.id,
      details: {
        invoiceNo: purchase.invoiceNo,
        supplierName: purchase.supplierName,
        grandTotal: purchase.grandTotal,
      },
    });

    return NextResponse.json({ success: true, purchase });
  } catch (err: any) {
    console.error('Purchase creation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record purchase' },
      { status: 500 }
    );
  }
}
