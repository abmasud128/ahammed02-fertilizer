import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, amount, paymentMode, notes } = body;

    if (!customerId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and positive amount are required' },
        { status: 400 }
      );
    }

    const ledgerEntry = await db.recordCustomerPayment({
      customerId,
      amount,
      paymentMode: paymentMode || 'cash',
      notes,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_payment_received',
      entityType: 'customer_ledger',
      entityId: ledgerEntry.id,
      details: { customerId, amount, paymentMode },
    });

    return NextResponse.json({ success: true, ledgerEntry });
  } catch (err: any) {
    console.error('Customer payment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
