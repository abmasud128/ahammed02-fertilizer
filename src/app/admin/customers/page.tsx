'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  IndianRupee,
  Phone,
  MapPin,
  CreditCard,
  MessageCircle,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
} from 'lucide-react';
import { CustomerRecord, CustomerLedgerEntry } from '@/types/admin';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    village: 'Chapmatali',
    openingBalance: 0,
  });

  // Edit Customer Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    phone: '',
    village: '',
    creditLimit: 25000,
    notes: '',
    currentDue: 0,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Record Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('Repayment of fertilizer credit');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Statement / Ledger Modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAddForm({ name: '', phone: '', village: 'Chapmatali', openingBalance: 0 });
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (c: CustomerRecord) => {
    setEditForm({
      id: c.id,
      name: c.name,
      phone: c.phone,
      village: c.village || '',
      creditLimit: c.creditLimit || 25000,
      notes: c.notes || '',
      currentDue: c.currentDue || 0,
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.phone) {
      setEditError('Farmer name and phone number are required');
      return;
    }

    setSavingEdit(true);
    setEditError('');
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editForm.id,
          name: editForm.name,
          phone: editForm.phone,
          village: editForm.village,
          creditLimit: Number(editForm.creditLimit),
          notes: editForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditError(data.error || 'Failed to update farmer details');
        return;
      }

      setIsEditModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setEditError(err.message || 'Error updating customer');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenPayment = (c: CustomerRecord) => {
    setSelectedCustomer(c);
    setPaymentAmount(c.currentDue > 0 ? c.currentDue : 500);
    setPaymentMode('cash');
    setPaymentNotes('Repayment towards fertilizer dues');
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    setRecordingPayment(true);
    try {
      const res = await fetch('/api/admin/customers/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amount: Number(paymentAmount),
          paymentMode,
          notes: paymentNotes,
        }),
      });

      if (res.ok) {
        setIsPaymentModalOpen(false);
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleViewLedger = async (c: CustomerRecord) => {
    setSelectedCustomer(c);
    setIsLedgerModalOpen(true);
    setLoadingLedger(true);

    try {
      const res = await fetch(`/api/admin/customers/ledger?customerId=${c.id}`);
      if (res.ok) {
        const data = await res.json();
        setLedgerEntries(data.ledger || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const getWhatsAppReminderUrl = (c: CustomerRecord) => {
    const phone = c.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `নমস্কার ${c.name}বাবু, আহাম্মেদ ফার্টিলাইজার (নন্দাইর, চাপমাতলী) থেকে বিনীত অনুরোধ:\n` +
      `আপনার বর্তমান বকেয়া বাকি টাকার পরিমাণ: ₹${c.currentDue.toLocaleString('en-IN')}।\n` +
      `সুবিধা মতো সময়ে দোকানে এসে বা ইউপিআই (UPI) মারফত পরিশোধ করার জন্য অনুরোধ করা হচ্ছে।\n` +
      `যোগাযোগ: +91 90910 17035`
    );
    return `https://wa.me/91${phone}?text=${text}`;
  };

  const totalCreditDue = customers.reduce((acc, c) => acc + (c.currentDue || 0), 0);
  const customersWithDue = customers.filter((c) => c.currentDue > 0);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-leaf" />
            <span>Customers & Credit Ledger (বাকি খাতা)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track farmer credit balances, payment receipts, limits, and WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Farmer</span>
        </button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Outstanding Due (বাকি)
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              ₹{totalCreditDue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              Across {customersWithDue.length} farmers in Dakshin Dinajpur
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Registered Farmers
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {customers.length}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Nandair, Chapmatali, Puliyapara</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-center text-leaf">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Healthy Credit Accounts
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              {customers.length - customersWithDue.length}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Zero pending balance (Nil Due)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, phone number, or village..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none font-medium"
          />
        </div>
      </div>

      {/* ── Customer Table & Mobile Cards ── */}
      <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Mobile View: Cards (< 768px) */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <a href={`tel:${c.phone}`} className="hover:underline font-medium text-gray-700 dark:text-gray-300">
                        {c.phone}
                      </a>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{c.village || 'Chapmatali'}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Current Due</span>
                  <span
                    className={`text-sm font-black ${
                      c.currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                    }`}
                  >
                    ₹{c.currentDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 gap-1.5 flex-wrap">
                <span className="text-[11px] text-gray-500">
                  Purchases:{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ₹{(c.totalPurchases || 0).toLocaleString('en-IN')}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  {c.currentDue > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenPayment(c)}
                      className="px-2.5 py-1 bg-leaf hover:bg-forest text-white rounded-lg font-bold text-xs"
                    >
                      Pay Due
                    </button>
                  )}
                  {c.currentDue > 0 && (
                    <a
                      href={getWhatsAppReminderUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleViewLedger(c)}
                    className="px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-xs flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> Ledger
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">No farmers found.</div>
          )}
        </div>

        {/* Desktop View: Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-bold">Farmer Name</th>
                <th className="py-3 px-4 font-bold">Contact & Village</th>
                <th className="py-3 px-4 font-bold text-right">Current Due (বাকি)</th>
                <th className="py-3 px-4 font-bold text-right">Total Purchases</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredCustomers.map((c) => {
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100 text-sm">
                      {c.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{c.village || 'Chapmatali'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm">
                      <span className={c.currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}>
                        ₹{c.currentDue.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-gray-600 dark:text-gray-400">
                      ₹{(c.totalPurchases || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-bold text-[11px] transition-colors flex items-center gap-1"
                          title="Edit Farmer Details"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>

                        {c.currentDue > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(c)}
                            className="px-2.5 py-1 bg-leaf hover:bg-forest text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Pay Due
                          </button>
                        )}

                        {c.currentDue > 0 && (
                          <a
                            href={getWhatsAppReminderUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleViewLedger(c)}
                          className="px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No farmers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Farmer / Customer Details Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-forest dark:text-emerald-300 text-base leading-tight">
                    Edit Farmer Details
                  </h3>
                  <p className="text-[11px] text-gray-500">ID: {editForm.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Subrata Roy"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-semibold text-gray-900 dark:text-gray-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="10 digit number"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-semibold text-gray-900 dark:text-gray-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Village / Para
                  </label>
                  <input
                    type="text"
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    placeholder="Chapmatali, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-semibold text-gray-900 dark:text-gray-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editForm.creditLimit}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-semibold text-gray-900 dark:text-gray-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current Due (বাকি)
                  </label>
                  <div className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/30 font-black text-amber-600 dark:text-amber-400 text-xs flex items-center">
                    ₹{editForm.currentDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="e.g. Regular mustard & boro paddy grower (5 bighas)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium text-gray-900 dark:text-gray-100 text-xs resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-leaf hover:bg-forest text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Farmer Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-base">
                Register Farmer Credit Account
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Ananta Roy"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="e.g. 9832011223"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Village / Locality
                </label>
                <input
                  type="text"
                  value={addForm.village}
                  onChange={(e) => setAddForm({ ...addForm, village: e.target.value })}
                  placeholder="Chapmatali, Nandair"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Opening Due Balance (if existing credit)
                </label>
                <input
                  type="number"
                  min="0"
                  value={addForm.openingBalance}
                  onChange={(e) => setAddForm({ ...addForm, openingBalance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-bold"
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
                  className="px-5 py-2 bg-leaf text-white font-bold rounded-xl shadow-md"
                >
                  Register Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ── */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-base">
                Record Credit Repayment
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-200">{selectedCustomer.name}</p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Current Due: <strong className="text-sm">₹{selectedCustomer.currentDue.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Repayment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustomer.currentDue}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-black text-sm text-forest dark:text-emerald-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-semibold"
                >
                  <option value="cash">💵 Cash Received</option>
                  <option value="upi">⚡ UPI (PhonePe / GPay)</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Repayment after paddy harvest sale"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-leaf text-white font-bold rounded-xl shadow-md"
                >
                  {recordingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer Statement / Ledger Modal ── */}
      {isLedgerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-2xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="font-black text-forest dark:text-emerald-300 text-base">
                  Customer Statement (খতিয়ান খাতা)
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedCustomer.name} • {selectedCustomer.phone} • {selectedCustomer.village}
                </p>
              </div>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingLedger ? (
                <div className="py-12 text-center text-gray-400">Loading ledger statement...</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Type / Ref</th>
                      <th className="pb-2 text-right">Debit (+Due)</th>
                      <th className="pb-2 text-right">Credit (-Paid)</th>
                      <th className="pb-2 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {ledgerEntries.map((l) => {
                      const isCreditBill = l.type === 'bill_credit';

                      return (
                        <tr key={l.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 text-gray-500 font-mono">
                            {new Date(l.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2.5">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {l.invoiceNumber ? `Bill #${l.invoiceNumber}` : l.notes}
                            </div>
                            <div className="text-[10px] text-gray-400 capitalize">
                              Mode: {l.paymentMode || 'Credit'}
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-bold text-red-600">
                            {isCreditBill ? `+₹${l.amount}` : '—'}
                          </td>
                          <td className="py-2.5 text-right font-bold text-emerald-600">
                            {!isCreditBill ? `-₹${l.amount}` : '—'}
                          </td>
                          <td className="py-2.5 text-right font-black text-gray-800 dark:text-gray-200">
                            ₹{l.balanceAfter}
                          </td>
                        </tr>
                      );
                    })}

                    {ledgerEntries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No transactions recorded in this ledger yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-xs">
              <span className="text-gray-500">Current Outstanding:</span>
              <span className="font-black text-base text-amber-600 dark:text-amber-400">
                ₹{selectedCustomer.currentDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
