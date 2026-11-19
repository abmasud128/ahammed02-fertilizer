import { NextRequest, NextResponse } from 'next/server';
import { getFarmerSession } from '@/lib/aqua/auth';
import { aquaDb } from '@/lib/aqua/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized (401)' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productionCycleId = searchParams.get('cycleId') || undefined;
    const pondId = searchParams.get('pondId') || undefined;

    const [expenses, sales, summary] = await Promise.all([
      aquaDb.listExpenses({ farmerId: session.farmerId, productionCycleId, pondId }),
      aquaDb.listSales({ farmerId: session.farmerId, productionCycleId, pondId }),
      aquaDb.getAccountsSummary(session.farmerId, productionCycleId),
    ]);

    return NextResponse.json({
      success: true,
      expenses,
      sales,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized (401)' }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body; // 'expense' | 'sale'

    if (type === 'expense') {
      const {
        productionCycleId,
        pondId,
        expenseDate,
        category,
        amount,
        paymentMode,
        vendorOrRecipient,
        notes,
      } = body;

      if (!productionCycleId || !expenseDate || !amount) {
        return NextResponse.json({ success: false, error: 'Cycle, expense date, and amount are required' }, { status: 400 });
      }

      const amt = Number(amount);
      if (isNaN(amt) || amt <= 0) {
        return NextResponse.json({ success: false, error: 'Valid amount (> 0) is required' }, { status: 400 });
      }

      const record = await aquaDb.addExpense({
        farmerId: session.farmerId,
        productionCycleId,
        pondId,
        expenseDate,
        category: category || 'other',
        amount: amt,
        paymentMode: paymentMode || 'cash',
        vendorOrRecipient: vendorOrRecipient || '',
        notes: notes || '',
        createdById: session.farmerId,
      });

      return NextResponse.json({ success: true, message: 'Expense recorded successfully', record });
    } else if (type === 'sale') {
      const {
        productionCycleId,
        pondId,
        harvestId,
        saleDate,
        buyerType,
        totalKg,
        ratePerKg,
        grossAmount,
        deductions,
        netAmount,
        paymentStatus,
        notes,
      } = body;

      if (!productionCycleId || !saleDate || !totalKg || !ratePerKg) {
        return NextResponse.json({ success: false, error: 'Cycle, sale date, total kg, and rate/kg are required' }, { status: 400 });
      }

      const kg = Number(totalKg);
      const rate = Number(ratePerKg);
      if (isNaN(kg) || kg <= 0 || isNaN(rate) || rate <= 0) {
        return NextResponse.json({ success: false, error: 'Valid weight and rate are required' }, { status: 400 });
      }

      const record = await aquaDb.addSale({
        farmerId: session.farmerId,
        productionCycleId,
        pondId,
        harvestId: harvestId || undefined,
        saleDate,
        buyerType: buyerType || 'local_wholesaler',
        totalKg: kg,
        ratePerKg: rate,
        grossAmount: grossAmount ? Number(grossAmount) : kg * rate,
        deductions: deductions ? Number(deductions) : 0,
        netAmount: netAmount ? Number(netAmount) : (grossAmount ? Number(grossAmount) : kg * rate) - (deductions ? Number(deductions) : 0),
        paymentStatus: paymentStatus || 'paid',
        notes: notes || '',
        createdById: session.farmerId,
      });

      return NextResponse.json({ success: true, message: 'Fish sale recorded successfully', record });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid record type (must be expense or sale)' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
