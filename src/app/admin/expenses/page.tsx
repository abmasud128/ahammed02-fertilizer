'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  IndianRupee,
  Calendar,
  Tag,
  Filter,
  Trash2,
  X,
  TrendingDown,
  Building,
  Zap,
  Truck,
  Users,
} from 'lucide-react';
import { ExpenseRecord } from '@/types/admin';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add Expense Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    category: 'transport',
    amount: 500,
    description: '',
    paymentMode: 'cash',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.amount <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: addForm.category,
          amount: Number(addForm.amount),
          description: addForm.description || `${addForm.category.toUpperCase()} expense`,
          paymentMode: addForm.paymentMode,
          date: addForm.date,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAddForm({
          category: 'transport',
          amount: 500,
          description: '',
          paymentMode: 'cash',
          date: new Date().toISOString().split('T')[0],
        });
        loadExpenses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const filteredExpenses = expenses.filter((e) => {
    const q = search.toLowerCase();
    const matchQ =
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.paymentMode && e.paymentMode.toLowerCase().includes(q));

    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchQ && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-leaf" />
            <span>Shop Expenses Tracker (দোকানের খরচ)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Record shop rent, electricity, truck freight, staff salary, and deduct from net profit.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record New Expense</span>
        </button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Recorded Expenses
            </p>
            <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
              ₹{totalExpense.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">{expenses.length} expense entries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Transport & Freight
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
              ₹{(categoryTotals['transport'] || 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Truck unloaded at shop</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Electricity & Utilities
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
              ₹{(categoryTotals['electricity'] || 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">WBSEDCL power bill</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Staff Salaries & Wages
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
              ₹{(categoryTotals['salary'] || 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Counter staff & helpers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses by description, category, or payment mode..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full md:w-auto">
          {['all', 'transport', 'electricity', 'rent', 'salary', 'maintenance', 'other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 capitalize text-[11px] transition-colors ${
                selectedCategory === cat
                  ? 'bg-forest text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Expenses Table ── */}
      <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Description / Purpose</th>
                <th className="py-3 px-4 font-bold">Payment Mode</th>
                <th className="py-3 px-4 font-bold">Recorded By</th>
                <th className="py-3 px-4 font-bold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-400">
                    {exp.expenseDate || exp.date || exp.createdAt?.split('T')[0]}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 font-bold capitalize text-[10px]">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    {exp.description}
                  </td>

                  <td className="py-3.5 px-4 capitalize font-medium text-gray-500">
                    {exp.paymentMode}
                  </td>

                  <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                    {exp.recordedByName || 'Owner'}
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-sm text-red-600 dark:text-red-400">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Expense Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-base">
                Record Shop Operating Expense
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-semibold capitalize"
                  >
                    <option value="transport">🚚 Transport / Freight</option>
                    <option value="electricity">⚡ Electricity Bill</option>
                    <option value="rent">🏢 Shop Rent</option>
                    <option value="salary">👥 Staff Salary</option>
                    <option value="maintenance">🛠️ Maintenance</option>
                    <option value="packaging">📦 Bags / Packaging</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-black text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Paid Via
                  </label>
                  <select
                    value={addForm.paymentMode}
                    onChange={(e) => setAddForm({ ...addForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-semibold"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">⚡ UPI</option>
                    <option value="bank">🏦 Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="e.g. Unloading labour charge for 100 bags Urea truck"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-leaf text-white font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
