import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only store owners can view expenses' }, { status: 403 });
    }

    const expenses = await db.getExpenses();
    return NextResponse.json({ success: true, expenses });
  } catch (err: any) {
    console.error('Expenses GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only store owners can record expenses' }, { status: 403 });
    }

    const body = await req.json();
    const { category, amount, description, paymentMode, date } = body;

    if (!category || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Expense category and positive amount are required' },
        { status: 400 }
      );
    }

    const newExpense = await db.createExpense({
      category,
      amount,
      description: description || 'Shop Operating Expense',
      paymentMode: paymentMode || 'cash',
      expenseDate: date || new Date().toISOString().split('T')[0],
      date: date || new Date().toISOString().split('T')[0],
      recordedByName: session.name || session.email,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'expense_recorded',
      entityType: 'expense',
      entityId: newExpense.id,
      details: { category, amount, description },
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (err: any) {
    console.error('Expenses POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record expense' },
      { status: 500 }
    );
  }
}
