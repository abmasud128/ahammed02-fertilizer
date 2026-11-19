import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Permission denied: Only store owners can cancel invoices' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { saleId, reason } = body;

    if (!saleId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Sale ID and cancellation reason are required' },
        { status: 400 }
      );
    }

    const cancelledSale = await db.cancelSale(saleId, reason, session.name || session.email);

    return NextResponse.json({ success: true, sale: cancelledSale });
  } catch (err: any) {
    console.error('Cancel sale error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to cancel sale' },
      { status: 500 }
    );
  }
}
