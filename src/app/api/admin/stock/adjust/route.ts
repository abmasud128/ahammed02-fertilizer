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
    const { productId, batchId, type, quantity, reason } = body;

    if (!productId || !type || typeof quantity !== 'number' || quantity <= 0 || !reason) {
      return NextResponse.json(
        { success: false, error: 'Product, type, positive quantity, and reason are required' },
        { status: 400 }
      );
    }

    const movement = await db.adjustStock({
      productId,
      batchId: batchId || undefined,
      type,
      quantity,
      reason,
      performedByName: session.name || session.email,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'stock_adjusted',
      entityType: 'stock_movement',
      entityId: movement.id,
      details: { productId, batchId, type, quantity, reason },
    });

    return NextResponse.json({ success: true, movement });
  } catch (err: any) {
    console.error('Stock adjustment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
