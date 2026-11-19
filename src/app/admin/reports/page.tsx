'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Download,
  Receipt,
  FileSpreadsheet,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminReportsPage() {
  const [range, setRange] = useState<'1' | '7' | '30' | '365' | 'all'>('30');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gst' | 'dayend'>('overview');

  useEffect(() => {
    loadReport();
  }, [range]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportGstCsv = () => {
    if (!reportData) return;

    const headers = ['Type', 'GST Rate (%)', 'Taxable Amount (Rs)', 'CGST (Rs)', 'SGST (Rs)', 'Total Tax (Rs)'];
    const rows = [
      ...reportData.outputGstByRate.map((r: any) => [
        'OUTPUT TAX (SALES)',
        `${r.rate}%`,
        r.taxableAmount,
        r.cgst,
        r.sgst,
        r.totalTax,
      ]),
      ...reportData.inputGstByRate.map((r: any) => [
        'INPUT TAX (PURCHASES)',
        `${r.rate}%`,
        r.taxableAmount,
        r.cgst,
        r.sgst,
        r.totalTax,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ahammed_fertilizer_gst_report_${range}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !reportData) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, paymentModeSummary, dayEndCashClosing, outputGstByRate, inputGstByRate } = reportData;

  const paymentPieData = [
    { name: 'Cash', value: paymentModeSummary.cash, color: '#2E9E4F' },
    { name: 'UPI', value: paymentModeSummary.upi, color: '#06B6D4' },
    { name: 'Credit (Udhaar)', value: paymentModeSummary.credit, color: '#F59E0B' },
    { name: 'Other / Split', value: paymentModeSummary.other, color: '#8B5CF6' },
  ].filter((p) => p.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header & Range Controls ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-leaf" />
            <span>Reports & Financial Earnings (লাভ-ক্ষতি ও আয়)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Owner-only financial performance, gross margins, GST accountant tax breakdown, and day-end cash register closing.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#0c2e21] p-1 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold">
          {[
            { id: '1', label: 'Today' },
            { id: '7', label: '7 Days' },
            { id: '30', label: '30 Days' },
            { id: '365', label: 'Year' },
            { id: 'all', label: 'All Time' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setRange(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === btn.id
                  ? 'bg-leaf text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Module Tabs ── */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>P&L Overview & Margins</span>
        </button>

        <button
          onClick={() => setActiveTab('gst')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'gst'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>GST Accountant Report (GSTR Ready)</span>
        </button>

        <button
          onClick={() => setActiveTab('dayend')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'dayend'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Day-End Cash Closing Statement</span>
        </button>
      </div>

      {/* ── TAB 1: P&L Overview & Margins ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Total Revenue (Sales)
              </span>
              <h3 className="text-2xl font-black text-forest dark:text-emerald-300 mt-1">
                ₹{summary.totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                From {summary.totalSalesCount} completed bills
              </p>
            </div>

            {/* Gross Profit */}
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Gross Profit (Revenue - Cost)
              </span>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{summary.grossProfit.toLocaleString('en-IN')}
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                Gross Margin: {summary.grossMarginPercent}%
              </span>
            </div>

            {/* Operating Expenses */}
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Shop Operating Expenses
              </span>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                Rent, power, transport & wages
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-xs bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[10px] uppercase font-bold text-leaf tracking-wider">
                Net Business Profit
              </span>
              <h3 className="text-2xl font-black text-forest dark:text-cream mt-1">
                ₹{summary.netProfit.toLocaleString('en-IN')}
              </h3>
              <span className="text-[11px] text-forest dark:text-emerald-300 font-bold block mt-0.5">
                Take-home earnings after costs
              </span>
            </div>
          </div>

          {/* Payment Modes Breakdown Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Payment Mode Distribution
                </h3>
                <p className="text-xs text-gray-500">Cash vs UPI vs Credit (Udhaar)</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {paymentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {paymentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#0c2e21',
                          borderColor: '#2E9E4F',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-400">No payment records in selected period</p>
                )}
              </div>

              <div className="text-[11px] text-gray-500 text-center pt-2 border-t border-gray-100 dark:border-white/10">
                Cash payments are dominant for rural farmer counter transactions.
              </div>
            </div>

            {/* Income & Expense Statement Summary Box */}
            <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Statement Summary
                </h3>
                <p className="text-xs text-gray-500">Breakdown of period cash inflows and outflows</p>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">(+) Gross Sales Revenue</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{summary.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">(-) Cost of Goods Sold (Purchase Cost)</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{summary.totalCostOfGoods.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold">
                  <span>(=) Gross Trading Margin</span>
                  <span>₹{summary.grossProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold">
                  <span>(-) Shop Operating Expenses</span>
                  <span>₹{summary.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-forest dark:bg-[#07241b] text-white font-black text-sm">
                  <span>NET SHOP PROFIT</span>
                  <span className="text-harvest">₹{summary.netProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center">
                Calculated in real-time from inventory batch costs and counter billing logs.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GST Accountant Report ── */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {/* Notice & Export Button */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 dark:text-amber-200">
                  GST Rate Advisory & Accountant Export
                </h4>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5">
                  Tax rates are configurable per product (Fertilizers 5%, Pesticides 18%, Micronutrients 12%). Verify all entries with your certified GST tax practitioner.
                </p>
              </div>
            </div>

            <button
              onClick={exportGstCsv}
              className="flex items-center gap-2 px-4 py-2 bg-forest hover:bg-leaf text-white font-bold rounded-xl shadow-sm text-xs shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export GST CSV for Accountant</span>
            </button>
          </div>

          {/* Output GST (Sales) Table */}
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                1. Output GST Collected on Retail Sales (GSTR-1 Ready)
              </h3>
              <span className="text-xs text-gray-400">CGST + SGST Split</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">GST Rate</th>
                    <th className="py-3 px-4 font-bold text-right">Taxable Turnover (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">Central Tax CGST (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">State Tax SGST (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">Total Output Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {outputGstByRate.map((r: any) => (
                    <tr key={r.rate} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">
                        {r.rate}% GST
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{r.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{r.cgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{r.sgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-forest dark:text-emerald-300">
                        ₹{r.totalTax.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Input GST (Purchases) Table */}
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                2. Input Tax Credit (ITC) on Inward Factory Purchases (GSTR-2B Ready)
              </h3>
              <span className="text-xs text-gray-400">Eligible Tax Credit</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">GST Rate</th>
                    <th className="py-3 px-4 font-bold text-right">Purchase Cost (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">Input CGST (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">Input SGST (₹)</th>
                    <th className="py-3 px-4 font-bold text-right">Total Input Tax Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {inputGstByRate.map((r: any) => (
                    <tr key={r.rate} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">
                        {r.rate}% GST
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{r.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{r.cgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{r.sgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                        ₹{r.totalTax.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Day-End Cash Closing ── */}
      {activeTab === 'dayend' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-[#0c2e21] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4 text-xs">
          <div className="text-center pb-3 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-base font-black text-forest dark:text-emerald-300">
              Day-End Cash Register Closing (দিনের শেষে ক্যাশ হিসাব)
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Reconcile physical cash in drawer for date: {dayEndCashClosing.date}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Morning Opening Cash Float</span>
              <span className="font-bold text-sm">₹{dayEndCashClosing.openingCash.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
              <span className="font-semibold">(+) Cash Collected from Today&apos;s Retail Sales</span>
              <span className="font-bold text-sm">₹{dayEndCashClosing.cashSales.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
              <span className="font-semibold">(-) Cash Paid Out for Today&apos;s Operating Expenses</span>
              <span className="font-bold text-sm">₹{dayEndCashClosing.cashExpenses.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-4 rounded-xl bg-forest dark:bg-[#07241b] text-white flex justify-between items-center shadow-md border border-emerald-700">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">
                  Expected Physical Cash in Drawer
                </span>
                <span className="text-xs text-gray-300">Count cash before closing shop</span>
              </div>
              <span className="text-2xl font-black text-harvest">
                ₹{dayEndCashClosing.expectedCashInDrawer.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-gray-500 text-[11px]">
            Cashier & Store Owner Sign-off Checklist: Ensure UPI QR payments tally with bank notifications.
          </div>
        </div>
      )}
    </div>
  );
}
