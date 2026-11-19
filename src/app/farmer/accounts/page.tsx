'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { CircleDollarSign, Plus, CheckCircle2, AlertCircle, ShieldCheck, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function FarmerAccountsPage() {
  const { d, isBn } = useAquaLanguage();

  const [activeTab, setActiveTab] = useState<'expenses' | 'sales'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalExpenses: 0, totalSales: 0, netBalance: 0 });
  const [cycles, setCycles] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    productionCycleId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'feed',
    amount: '',
    paymentMode: 'cash',
    vendorOrRecipient: 'আহাম্মেদ ফার্টিলাইজার',
    notes: '',
  });

  // Sale form
  const [saleForm, setSaleForm] = useState({
    productionCycleId: '',
    saleDate: new Date().toISOString().split('T')[0],
    buyerType: 'local_wholesaler',
    totalKg: '',
    ratePerKg: '190',
    grossAmount: '',
    deductions: '0',
    netAmount: '',
    paymentStatus: 'paid',
    notes: '',
  });

  useEffect(() => {
    fetchAccounts();
    fetch('/api/farmer/cycles')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && data.cycles.length > 0) {
          setCycles(data.cycles);
          setExpenseForm((prev) => ({ ...prev, productionCycleId: data.cycles[0].id }));
          setSaleForm((prev) => ({ ...prev, productionCycleId: data.cycles[0].id }));
        }
      });
  }, []);

  const fetchAccounts = () => {
    fetch('/api/farmer/accounts')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setExpenses(data.expenses || []);
          setSales(data.sales || []);
          setSummary(data.summary || { totalExpenses: 0, totalSales: 0, netBalance: 0 });
        }
      });
  };

  const handleSaleKgOrRateChange = (kgStr: string, rateStr: string, dedStr: string) => {
    const kg = parseFloat(kgStr);
    const rate = parseFloat(rateStr);
    const ded = parseFloat(dedStr) || 0;
    const gross = !isNaN(kg) && !isNaN(rate) ? kg * rate : 0;
    const net = gross - ded;
    setSaleForm((prev) => ({
      ...prev,
      totalKg: kgStr,
      ratePerKg: rateStr,
      deductions: dedStr,
      grossAmount: gross ? gross.toFixed(0) : '',
      netAmount: net > 0 ? net.toFixed(0) : '',
    }));
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'expense', ...expenseForm }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record expense');
      }

      setStatusMessage({ type: 'success', text: 'খরচের খাতা সফলভাবে আপডেট হয়েছে!' });
      setShowAddForm(false);
      setExpenseForm((prev) => ({ ...prev, amount: '', notes: '' }));
      fetchAccounts();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sale', ...saleForm }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record sale');
      }

      setStatusMessage({ type: 'success', text: 'মাছ বিক্রয়ের চালান যুক্ত হয়েছে!' });
      setShowAddForm(false);
      setSaleForm((prev) => ({ ...prev, totalKg: '', grossAmount: '', netAmount: '', notes: '' }));
      fetchAccounts();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    feed: 'মাছের খাবার (Feed)',
    seed: 'পোনা মাছ ক্রয় (Seed)',
    medicine_chemical: 'ওষুধ ও চুন (Medicine)',
    electricity_fuel: 'বিদ্যুৎ ও জ্বালানি',
    labor: 'শ্রমিক মজুরি (Labour)',
    pond_prep: 'পুকুর সংস্কার ও প্রস্তুতি',
    netting: 'জাল টানা খরচ',
    equipment: 'যন্ত্রপাতি ও পাইপ',
    other: 'অন্যান্য খরচ',
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.accounts.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.accounts.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? d.common.close : activeTab === 'expenses' ? '+ খরচ লিখুন' : '+ বিক্রয় লিখুন'}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'bg-red-100 text-red-900 border border-red-300 dark:bg-red-950/60 dark:text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-gray-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span>মোট খরচ</span>
          </div>
          <div className="text-base sm:text-xl font-black text-red-700 dark:text-red-400 mt-1">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>মোট বিক্রয়</span>
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            ₹{summary.totalSales.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-gray-500 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-blue-500" />
            <span>নিট উদ্বৃত্ত</span>
          </div>
          <div className={`text-base sm:text-xl font-black mt-1 ${summary.netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
            ₹{summary.netBalance.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-200 dark:bg-emerald-950/60 p-1 border border-slate-300 dark:border-emerald-800/40">
        <button
          type="button"
          onClick={() => { setActiveTab('expenses'); setShowAddForm(false); }}
          className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-emerald-800 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          {d.accounts.tabExpenses} ({expenses.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('sales'); setShowAddForm(false); }}
          className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
            activeTab === 'sales'
              ? 'bg-white dark:bg-emerald-800 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          {d.accounts.tabSales} ({sales.length})
        </button>
      </div>

      {/* Add Form (Expense or Sale) */}
      {showAddForm && activeTab === 'expenses' && (
        <form
          onSubmit={handleExpenseSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-red-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <CircleDollarSign className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              নতুন খামার খরচ লিখুন
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                চাষ চক্র ও পুকুর *
              </label>
              <select
                required
                value={expenseForm.productionCycleId}
                onChange={(e) => setExpenseForm({ ...expenseForm, productionCycleId: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cycleName} ({c.cycleCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.expenseDate} *
              </label>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.category}
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="feed">মাছের খাবার (Feed)</option>
                <option value="seed">পোনা মাছ ক্রয় (Seed Cost)</option>
                <option value="medicine_chemical">ওষুধ ও চুন (Medicine & Chemicals)</option>
                <option value="electricity_fuel">বিদ্যুৎ বিল বা ডিজেল</option>
                <option value="labor">শ্রমিক মজুরি (Labour)</option>
                <option value="pond_prep">পুকুর প্রস্তুতি ও সংস্কার</option>
                <option value="netting">জাল টানা খরচ (Netting)</option>
                <option value="equipment">যন্ত্রপাতি ও সরঞ্জাম</option>
                <option value="other">অন্যান্য অনুষঙ্গিক খরচ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.amount} *
              </label>
              <input
                type="number"
                required
                placeholder="যেমন: 2500"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.paymentMode}
              </label>
              <select
                value={expenseForm.paymentMode}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="cash">নগদ টাকা (Cash)</option>
                <option value="upi">অনলাইন / UPI / GPay</option>
                <option value="credit">বাকি (Due / Credit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.vendor}
              </label>
              <input
                type="text"
                placeholder="যেমন: আহাম্মেদ ফার্টিলাইজার"
                value={expenseForm.vendorOrRecipient}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorOrRecipient: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                মন্তব্য বা বিবরণ
              </label>
              <input
                type="text"
                placeholder="যেমন: ভাসমান ফিড ২ বস্তা ক্রয়"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              {d.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 shadow-md"
            >
              {loading ? d.common.loading : d.common.save}
            </button>
          </div>
        </form>
      )}

      {showAddForm && activeTab === 'sales' && (
        <form
          onSubmit={handleSaleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-emerald-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              নতুন মাছ বিক্রয় চালান লিখুন
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                চাষ চক্র ও পুকুর *
              </label>
              <select
                required
                value={saleForm.productionCycleId}
                onChange={(e) => setSaleForm({ ...saleForm, productionCycleId: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cycleName} ({c.cycleCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.saleDate} *
              </label>
              <input
                type="date"
                required
                value={saleForm.saleDate}
                onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.totalKg} *
              </label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="যেমন: 85"
                value={saleForm.totalKg}
                onChange={(e) => handleSaleKgOrRateChange(e.target.value, saleForm.ratePerKg, saleForm.deductions)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.ratePerKg} *
              </label>
              <input
                type="number"
                required
                placeholder="যেমন: 190"
                value={saleForm.ratePerKg}
                onChange={(e) => handleSaleKgOrRateChange(saleForm.totalKg, e.target.value, saleForm.deductions)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                আড়তের কমিশন বা ঘাটতি বাদ (₹)
              </label>
              <input
                type="number"
                placeholder="যেমন: 200"
                value={saleForm.deductions}
                onChange={(e) => handleSaleKgOrRateChange(saleForm.totalKg, saleForm.ratePerKg, e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                গৃহীত নিট অর্থ (₹)
              </label>
              <input
                type="number"
                readOnly
                value={saleForm.netAmount}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.paymentStatus}
              </label>
              <select
                value={saleForm.paymentStatus}
                onChange={(e) => setSaleForm({ ...saleForm, paymentStatus: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="paid">{d.accounts.paid}</option>
                <option value="partial">{d.accounts.partial}</option>
                <option value="due">{d.accounts.due}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.accounts.buyerType}
              </label>
              <select
                value={saleForm.buyerType}
                onChange={(e) => setSaleForm({ ...saleForm, buyerType: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="local_wholesaler">আড়তদার / পাইকার (Wholesaler)</option>
                <option value="retail_market">খুচরা বাজার (Retail Market)</option>
                <option value="trader">বেপারী / ফড়িয়া (Trader)</option>
                <option value="direct_consumer">সরাসরি ভোক্তা (Direct Consumer)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              {d.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md"
            >
              {loading ? d.common.loading : d.common.save}
            </button>
          </div>
        </form>
      )}

      {/* Ledger Lists */}
      {activeTab === 'expenses' ? (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
              <CircleDollarSign className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500">কোনো খরচের রেকর্ড নেই।</p>
            </div>
          ) : (
            expenses.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 dark:text-white">{e.expenseDate}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 font-bold">
                      {categoryLabels[e.category] || e.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {e.vendorOrRecipient && <span>{e.vendorOrRecipient} • </span>}
                    {e.notes}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-red-700 dark:text-red-400">
                    -₹{Number(e.amount).toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{e.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sales.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
              <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500">কোনো বিক্রয়ের রেকর্ড নেই।</p>
            </div>
          ) : (
            sales.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 dark:text-white">{s.saleDate}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      {s.totalKg} কেজি @ ₹{s.ratePerKg}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    ক্রেতা: {s.buyerType} {s.deductions > 0 ? `(কমিশন বাদ: ₹${s.deductions})` : ''}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
                    +₹{Number(s.netAmount).toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{s.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
