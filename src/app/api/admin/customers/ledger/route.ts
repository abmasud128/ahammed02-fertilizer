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
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400 });
    }

    const customer = await db.getCustomerById(customerId);
    const ledger = await db.getCustomerLedger(customerId);

    return NextResponse.json({ success: true, customer, ledger });
  } catch (err: any) {
    console.error('Customer ledger error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
