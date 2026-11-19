import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only store owners can access reports and profit analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30'; // days: 1, 7, 30, 365, all

    const now = new Date();
    let startDate = new Date();
    if (range === '1') startDate.setHours(0, 0, 0, 0);
    else if (range === '7') startDate.setDate(now.getDate() - 7);
    else if (range === '30') startDate.setDate(now.getDate() - 30);
    else if (range === '365') startDate.setFullYear(now.getFullYear() - 1);
    else startDate = new Date(2020, 0, 1);

    const startIso = startDate.toISOString();

    const [sales, purchases, expenses, products, customers] = await Promise.all([
      db.getSales(),
      db.getPurchases(),
      db.getExpenses(),
      db.getProducts(),
      db.getCustomers(),
    ]);

    // Filter by date range
    const periodSales = sales.filter((s) => s.status === 'completed' && s.createdAt >= startIso);
    const periodExpenses = expenses.filter((e) => (e.expenseDate || e.date || e.createdAt) >= startIso.split('T')[0]);
    const periodPurchases = purchases.filter((p) => p.purchaseDate >= startIso.split('T')[0]);

    // Financial Totals
    const totalRevenue = periodSales.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalCostOfGoods = periodSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const grossProfit = totalRevenue - totalCostOfGoods;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    // Payment Modes Breakdown
    const paymentModeSummary = {
      cash: periodSales.filter((s) => s.paymentMode === 'cash').reduce((acc, s) => acc + s.grandTotal, 0),
      upi: periodSales.filter((s) => s.paymentMode === 'upi').reduce((acc, s) => acc + s.grandTotal, 0),
      credit: periodSales.filter((s) => s.paymentMode === 'credit').reduce((acc, s) => acc + s.grandTotal, 0),
      other: periodSales.filter((s) => s.paymentMode === 'card' || s.paymentMode === 'split').reduce((acc, s) => acc + s.grandTotal, 0),
    };

    // Day-End Cash Closing (Cash in drawer)
    const todayStr = now.toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.status === 'completed' && s.createdAt.startsWith(todayStr));
    const todayCashSales = todaySales.reduce((acc, s) => acc + (s.cashAmount || 0), 0);
    const todayCashExpenses = expenses
      .filter((e) => (e.expenseDate || e.date || e.createdAt).startsWith(todayStr) && e.paymentMode === 'cash')
      .reduce((acc, e) => acc + e.amount, 0);

    const dayEndCashClosing = {
      date: todayStr,
      openingCash: 2500, // standard till opening float
      cashSales: todayCashSales,
      cashExpenses: todayCashExpenses,
      expectedCashInDrawer: 2500 + todayCashSales - todayCashExpenses,
    };

    // GST Accountant Breakdown by Rate (0%, 5%, 12%, 18%, 28%)
    const gstRates = [0, 5, 12, 18, 28];
    const outputGstByRate = gstRates.map((rate) => {
      let taxable = 0;
      let cgst = 0;
      let sgst = 0;

      for (const s of periodSales) {
        for (const it of s.items) {
          if (it.gstRate === rate) {
            taxable += it.quantity * it.unitPrice - it.discount;
            cgst += it.cgstAmount;
            sgst += it.sgstAmount;
          }
        }
      }

      return {
        rate,
        taxableAmount: Math.round(taxable),
        cgst: Number(cgst.toFixed(2)),
        sgst: Number(sgst.toFixed(2)),
        totalTax: Number((cgst + sgst).toFixed(2)),
      };
    });

    const inputGstByRate = gstRates.map((rate) => {
      let taxable = 0;
      let tax = 0;

      for (const p of periodPurchases) {
        for (const it of p.items) {
          if (it.gstRate === rate) {
            taxable += it.quantity * it.unitCost;
            tax += it.gstAmount;
          }
        }
      }

      return {
        rate,
        taxableAmount: Math.round(taxable),
        cgst: Number((tax / 2).toFixed(2)),
        sgst: Number((tax / 2).toFixed(2)),
        totalTax: Number(tax.toFixed(2)),
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalCostOfGoods,
        grossProfit,
        grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
        totalExpenses,
        netProfit,
        totalSalesCount: periodSales.length,
      },
      paymentModeSummary,
      dayEndCashClosing,
      outputGstByRate,
      inputGstByRate,
      recentSales: periodSales.slice(0, 50),
    });
  } catch (err: any) {
    console.error('Reports GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to generate reports' }, { status: 500 });
  }
}
