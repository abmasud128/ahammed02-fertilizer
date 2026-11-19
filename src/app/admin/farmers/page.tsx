'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  User,
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Wheat,
  ShoppingCart,
  Clock,
  Check,
  ChevronRight,
  ShieldCheck,
  Search,
  Edit2,
  X,
  CreditCard,
  Building2,
  Filter,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import type { CustomerRecord } from '@/types/admin';

interface FormState {
  name: string;
  fatherName: string;
  phone: string;
  village: string;
  para: string;
  aadhaar: string;
  landArea: string;
  landUnit: 'Bigha' | 'Acre' | 'Decimal';
  primaryCrops: string[];
  customCrop: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  fatherName: '',
  phone: '',
  village: '',
  para: '',
  aadhaar: '',
  landArea: '',
  landUnit: 'Bigha',
  primaryCrops: [],
  customCrop: '',
  notes: '',
};

const COMMON_CROPS = [
  { id: 'paddy', en: 'Paddy', bn: 'ধান' },
  { id: 'mustard', en: 'Mustard', bn: 'সরিষা' },
  { id: 'potato', en: 'Potato', bn: 'আলু' },
  { id: 'jute', en: 'Jute', bn: 'পাট' },
  { id: 'maize', en: 'Maize', bn: 'ভুট্টা' },
  { id: 'vegetables', en: 'Vegetables', bn: 'শাকসবজি' },
  { id: 'wheat', en: 'Wheat', bn: 'গম' },
  { id: 'fishery', en: 'Fishery / Aqua', bn: 'মাছ চাষ' },
];

const SUGGESTED_VILLAGES = [
  'Chapmatali',
  'Jahangirpur',
  'Nandair',
  'Bunsidhari',
  'Gangarampur',
  'Belbari',
  'Chalkbhabani',
  'Patiram',
  'Balurghat',
  'Kushmandi',
  'Tapan',
  'Bansihari',
  'Harirampur',
  'Kumarganj',
];

interface EditFormState {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  village: string;
  para: string;
  aadhaar: string;
  landArea: string;
  landUnit: 'Bigha' | 'Acre' | 'Decimal';
  primaryCrops: string[];
  creditLimit: number;
  notes: string;
}

export default function AddFarmerPage() {
  // Navigation View: 'add' or 'customers'
  const [activeTab, setActiveTab] = useState<'add' | 'customers'>('add');

  // Form State for Add Farmer
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    name: string;
    phone: string;
    id: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Customers Directory State
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'due'>('recent');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessToast, setEditSuccessToast] = useState<string | null>(null);

  // Load all customers from DB
  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.customers && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Format Phone Input (numeric only, max 10 digits)
  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: numeric }));
    if (errors.phone && numeric.length === 10) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  // Format Aadhaar Input (numeric only, max 12 digits)
  const handleAadhaarChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 12);
    setForm((prev) => ({ ...prev, aadhaar: numeric }));
    if (errors.aadhaar && (numeric.length === 0 || numeric.length === 12)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.aadhaar;
        return next;
      });
    }
  };

  // Toggle Crop Tag in Add Form
  const toggleCrop = (cropName: string) => {
    setForm((prev) => {
      const exists = prev.primaryCrops.includes(cropName);
      return {
        ...prev,
        primaryCrops: exists
          ? prev.primaryCrops.filter((c) => c !== cropName)
          : [...prev.primaryCrops, cropName],
      };
    });
  };

  // Add Custom Crop
  const handleAddCustomCrop = () => {
    const trimmed = form.customCrop.trim();
    if (trimmed && !form.primaryCrops.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        primaryCrops: [...prev.primaryCrops, trimmed],
        customCrop: '',
      }));
    }
  };

  // Validate Add Form
  const validateAddForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Farmer name is required';
    }
    if (!form.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (form.phone.length !== 10) {
      newErrors.phone = 'Mobile number must be exactly 10 digits';
    }
    if (!form.village.trim()) {
      newErrors.village = 'Village name is required';
    }
    if (!form.para.trim()) {
      newErrors.para = 'Para / Locality is required';
    }
    if (form.aadhaar && form.aadhaar.length !== 12) {
      newErrors.aadhaar = 'Aadhaar number must be exactly 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset Add Form
  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setServerError(null);
  };

  // Submit Add Farmer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateAddForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        para: form.para.trim(),
        aadhaar: form.aadhaar.trim() || undefined,
        landArea: form.landArea.trim() ? `${form.landArea.trim()} ${form.landUnit}` : undefined,
        primaryCrops: form.primaryCrops.length > 0 ? form.primaryCrops : undefined,
        notes: form.notes.trim() || undefined,
      };

      const res = await fetch('/api/admin/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save farmer record');
      }

      setSuccessToast({
        show: true,
        name: data.farmer.name,
        phone: data.farmer.phone,
        id: data.farmer.id,
      });

      setForm(INITIAL_FORM);
      setErrors({});
      loadCustomers();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setSuccessToast(null);
      }, 6000);
    } catch (err: any) {
      setServerError(err.message || 'Error occurred while saving farmer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal for a Customer
  const handleOpenEdit = (c: CustomerRecord) => {
    // Extract Land Unit if formatted (e.g. "3.5 Bigha")
    let rawLand = c.landArea || '';
    let unit: 'Bigha' | 'Acre' | 'Decimal' = 'Bigha';
    if (rawLand.includes('Acre')) {
      unit = 'Acre';
      rawLand = rawLand.replace('Acre', '').trim();
    } else if (rawLand.includes('Decimal')) {
      unit = 'Decimal';
      rawLand = rawLand.replace('Decimal', '').trim();
    } else if (rawLand.includes('Bigha')) {
      unit = 'Bigha';
      rawLand = rawLand.replace('Bigha', '').trim();
    }

    setEditForm({
      id: c.id,
      name: c.name || '',
      fatherName: c.fatherName || '',
      phone: (c.phone || '').replace(/\D/g, '').slice(-10),
      village: c.village || '',
      para: c.para || '',
      aadhaar: c.aadhaar || '',
      landArea: rawLand,
      landUnit: unit,
      primaryCrops: Array.isArray(c.primaryCrops) ? [...c.primaryCrops] : [],
      creditLimit: c.creditLimit !== undefined ? c.creditLimit : 25000,
      notes: c.notes || '',
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Toggle Crop Tag in Edit Modal
  const toggleEditCrop = (cropName: string) => {
    if (!editForm) return;
    const exists = editForm.primaryCrops.includes(cropName);
    setEditForm({
      ...editForm,
      primaryCrops: exists
        ? editForm.primaryCrops.filter((c) => c !== cropName)
        : [...editForm.primaryCrops, cropName],
    });
  };

  // Submit Edit Farmer
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = 'Farmer name is required';
    if (!editForm.phone.trim()) errs.phone = 'Mobile number is required';
    else if (editForm.phone.replace(/\D/g, '').slice(-10).length !== 10) {
      errs.phone = 'Mobile number must be 10 digits';
    }
    if (editForm.aadhaar && editForm.aadhaar.replace(/\D/g, '').length !== 12) {
      errs.aadhaar = 'Aadhaar must be 12 digits';
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setIsSavingEdit(true);

    try {
      const payload = {
        id: editForm.id,
        name: editForm.name.trim(),
        fatherName: editForm.fatherName.trim() || undefined,
        phone: editForm.phone.trim(),
        village: editForm.village.trim() || undefined,
        para: editForm.para.trim() || undefined,
        aadhaar: editForm.aadhaar.trim() || undefined,
        landArea: editForm.landArea.trim() ? `${editForm.landArea.trim()} ${editForm.landUnit}` : undefined,
        primaryCrops: editForm.primaryCrops,
        creditLimit: Number(editForm.creditLimit) || 0,
        notes: editForm.notes.trim() || undefined,
      };

      const res = await fetch('/api/admin/farmers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update customer');
      }

      setIsEditModalOpen(false);
      setEditSuccessToast(`Updated details for ${editForm.name} successfully!`);
      loadCustomers();

      setTimeout(() => {
        setEditSuccessToast(null);
      }, 5000);
    } catch (err: any) {
      setEditErrors({ general: err.message || 'Error saving changes' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered & Sorted Customers List
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.name?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.village?.toLowerCase().includes(q) ||
          c.fatherName?.toLowerCase().includes(q) ||
          c.para?.toLowerCase().includes(q);

        const matchesVillage =
          villageFilter === 'all' ||
          (c.village && c.village.toLowerCase() === villageFilter.toLowerCase());

        return matchesQuery && matchesVillage;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'due') return (b.currentDue || 0) - (a.currentDue || 0);
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
  }, [customers, searchQuery, villageFilter, sortBy]);

  // Unique villages from customer list for filter dropdown
  const uniqueVillages = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.village) set.add(c.village.trim());
    });
    return Array.from(set).sort();
  }, [customers]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-leaf/10 dark:bg-emerald-950/60 border border-leaf/30 text-leaf dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            {activeTab === 'add' ? <UserPlus className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              {activeTab === 'add' ? 'Add Farmer' : 'Your Customers'}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {activeTab === 'add' ? 'POS Sync' : `${customers.length} Farmers`}
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activeTab === 'add'
                ? 'Register a farmer to instantly make them searchable and selectable for POS billing and khata credit.'
                : 'Browse all registered farmers, search records, and edit their details or Khata accounts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/pos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest dark:bg-emerald-950 hover:bg-forest/90 text-white font-bold text-xs shadow-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-harvest" /> Open POS Billing
          </Link>
        </div>
      </div>

      {/* ── Top Navigation Switcher: Add Farmer vs Your Customers ── */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl max-w-md border border-gray-200/80 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'bg-leaf text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Farmer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-leaf text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Your Customers</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'customers'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300'
            }`}
          >
            {customers.length}
          </span>
        </button>
      </div>

      {/* ── Global Success Toast Banner ── */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Farmer Added Successfully!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                <strong>{successToast.name}</strong> (+91 {successToast.phone}) is now registered and ready in POS Billing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-200"
            >
              View in Your Customers
            </button>
            <Link
              href="/admin/pos"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              Bill Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Edit Success Toast ── */}
      {editSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 shadow-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{editSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditSuccessToast(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Server Error Alert ── */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 dark:text-red-300">
            <p className="font-bold text-sm">Failed to Register Farmer</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: ADD FARMER ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Single-Page Add Farmer Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-6"
              noValidate
            >
              {/* Section 1: Primary Farmer Info */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-white/10">
                  <User className="w-4 h-4 text-leaf dark:text-emerald-400" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-forest dark:text-emerald-300">
                    Primary Farmer Details
                  </h2>
                  <span className="text-[10px] text-gray-400 ml-auto">* Required fields</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Farmer Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Farmer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.name;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Biplab Mondal / বিপ্লব মণ্ডল"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-medium outline-none transition-all text-gray-900 dark:text-white ${
                        errors.name
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                          : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Father&apos;s / Guardian&apos;s Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fatherName}
                      onChange={(e) => {
                        setForm({ ...form, fatherName: e.target.value });
                        if (errors.fatherName) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.fatherName;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Haradhan Mondal"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-medium outline-none transition-all text-gray-900 dark:text-white ${
                        errors.fatherName
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                          : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                      }`}
                    />
                    {errors.fatherName && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fatherName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-gray-400 border-r border-gray-200 dark:border-white/10 pr-2">
                        <Phone className="w-3.5 h-3.5 text-leaf" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="10-digit number"
                        className={`w-full pl-20 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-bold tracking-wider outline-none transition-all text-gray-900 dark:text-white ${
                          errors.phone
                            ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                            : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                        }`}
                      />
                    </div>
                    {errors.phone ? (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Used for POS lookup, Khata ledger, and SMS invoices
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Residential Location */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-white/10">
                  <MapPin className="w-4 h-4 text-leaf dark:text-emerald-400" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-forest dark:text-emerald-300">
                    Location & Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Village */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Village <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      list="villages-list"
                      value={form.village}
                      onChange={(e) => {
                        setForm({ ...form, village: e.target.value });
                        if (errors.village) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.village;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Chapmatali / Jahangirpur"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-medium outline-none transition-all text-gray-900 dark:text-white ${
                        errors.village
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                          : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                      }`}
                    />
                    <datalist id="villages-list">
                      {SUGGESTED_VILLAGES.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                    {errors.village && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.village}
                      </p>
                    )}
                  </div>

                  {/* Para / Locality */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Para / Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.para}
                      onChange={(e) => {
                        setForm({ ...form, para: e.target.value });
                        if (errors.para) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.para;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Purba Para / Mondal Para / School Math"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-medium outline-none transition-all text-gray-900 dark:text-white ${
                        errors.para
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                          : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                      }`}
                    />
                    {errors.para && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.para}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Identity & Agricultural Details (Optional) */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-white/10">
                  <Wheat className="w-4 h-4 text-leaf dark:text-emerald-400" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-forest dark:text-emerald-300">
                    Additional Details <span className="text-xs font-normal normal-case text-gray-400">(Optional)</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Aadhaar Card Number */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                        <span>Aadhaar Card Number</span>
                        <span className="text-[10px] text-gray-400 font-normal">12 digits (Optional)</span>
                      </label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={12}
                          value={form.aadhaar}
                          onChange={(e) => handleAadhaarChange(e.target.value)}
                          placeholder="XXXX XXXX XXXX"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/30 text-sm font-mono tracking-wider outline-none transition-all text-gray-900 dark:text-white ${
                            errors.aadhaar
                              ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                              : 'border-gray-300 dark:border-white/15 focus:ring-2 focus:ring-leaf'
                          }`}
                        />
                      </div>
                      {errors.aadhaar && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.aadhaar}
                        </p>
                      )}
                    </div>

                    {/* Land Area */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                        <span>Total Land Area</span>
                        <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.landArea}
                          onChange={(e) => setForm({ ...form, landArea: e.target.value })}
                          placeholder="e.g. 3.5"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                        />
                        <select
                          value={form.landUnit}
                          onChange={(e) => setForm({ ...form, landUnit: e.target.value as any })}
                          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-black/40 text-xs font-bold outline-none text-gray-700 dark:text-gray-200"
                        >
                          <option value="Bigha">Bigha (বিঘা)</option>
                          <option value="Acre">Acre (একর)</option>
                          <option value="Decimal">Decimal (শতক)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Primary Crops Multi-select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Primary Crops Cultivated <span className="text-[10px] text-gray-400 font-normal">(Click to select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {COMMON_CROPS.map((c) => {
                        const isSelected = form.primaryCrops.includes(c.en);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCrop(c.en)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-leaf text-white shadow-xs font-bold'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{c.en}</span>
                            <span className="text-[10px] opacity-75">({c.bn})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Crop input */}
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="text"
                        value={form.customCrop}
                        onChange={(e) => setForm({ ...form, customCrop: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCrop();
                          }
                        }}
                        placeholder="+ Other crop..."
                        className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs outline-none focus:ring-1 focus:ring-leaf text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCrop}
                        disabled={!form.customCrop.trim()}
                        className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-gray-700 dark:text-gray-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Remarks / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>Remarks / Notes</span>
                      <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="e.g. Regular buyer of IFFCO DAP & Urea; prefers delivery to Chapmatali market; borewell irrigation."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-medium outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-leaf hover:bg-forest text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Farmer...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Save Farmer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side Card: Store Sync & Quick Customers Link */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-forest text-white shadow-sm space-y-3 border border-emerald-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-harvest" />
                </div>
                <h3 className="font-extrabold text-sm tracking-tight">Direct POS & Billing Sync</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Every farmer saved here is written straight into the store database collection. When opening{' '}
                <strong className="text-harvest">POS Billing</strong>, search their name or 10-digit number for 1-click billing and Khata ledger tracking.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-harvest" /> View All {customers.length} Customers
              </button>
            </div>

            {/* Recently Added Farmers */}
            <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-leaf" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-forest dark:text-emerald-300">
                    Recently Added
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('customers')}
                  className="text-[11px] font-bold text-leaf hover:underline cursor-pointer"
                >
                  See All ({customers.length})
                </button>
              </div>

              {isLoadingCustomers ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading store records...</div>
              ) : customers.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">No farmers registered yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {customers.slice(0, 5).map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 text-xs hover:border-gray-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{f.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          +91 {f.phone} • {f.village || 'Dakshin Dinajpur'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-leaf hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href="/admin/pos"
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] shrink-0 hover:bg-emerald-200 transition-colors"
                          title="Open in POS Billing"
                        >
                          Bill
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: YOUR CUSTOMERS (FULL DIRECTORY WITH EDIT) ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Village Filter, Sort & Add Shortcut */}
          <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, village, father's name..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-medium outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Village Filter */}
              <div className="flex items-center gap-1.5 border border-gray-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 bg-white dark:bg-black/30 text-xs text-gray-700 dark:text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-leaf" />
                <select
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="bg-transparent outline-none font-semibold text-xs cursor-pointer text-gray-900 dark:text-white"
                >
                  <option value="all">All Villages ({customers.length})</option>
                  {uniqueVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 border border-gray-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 bg-white dark:bg-black/30 text-xs text-gray-700 dark:text-gray-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-leaf" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent outline-none font-semibold text-xs cursor-pointer text-gray-900 dark:text-white"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="due">Highest Due</option>
                </select>
              </div>

              {/* Add Farmer Shortcut */}
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="px-3.5 py-2 rounded-xl bg-leaf hover:bg-forest text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Add Farmer
              </button>
            </div>
          </div>

          {/* Customer Cards & Table */}
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm overflow-hidden">
            {isLoadingCustomers ? (
              <div className="p-12 text-center text-sm text-gray-400">Loading customers database...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No matching customers found</p>
                <p className="text-xs text-gray-500">Try adjusting your search query or village filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 text-gray-500 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Farmer Profile</th>
                      <th className="py-3.5 px-4">Father&apos;s Name</th>
                      <th className="py-3.5 px-4">Mobile & Location</th>
                      <th className="py-3.5 px-4">Land & Crops</th>
                      <th className="py-3.5 px-4">Khata Due</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                    {filteredCustomers.map((c) => {
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors group"
                        >
                          {/* Farmer Profile */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-forest/10 dark:bg-white/10 text-forest dark:text-emerald-300 font-black flex items-center justify-center shrink-0 text-sm">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                                  {c.name}
                                </p>
                                {c.aadhaar && (
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    UID: {c.aadhaar.replace(/(\d{4})/g, '$1 ').trim()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Father's Name */}
                          <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                            {c.fatherName ? (
                              <span>{c.fatherName}</span>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">— Not specified —</span>
                            )}
                          </td>

                          {/* Mobile & Location */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                <Phone className="w-3 h-3 text-leaf" />
                                <span>+91 {c.phone}</span>
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span>
                                  {c.village || 'Dakshin Dinajpur'}
                                  {c.para ? ` (${c.para})` : ''}
                                </span>
                              </p>
                            </div>
                          </td>

                          {/* Land & Crops */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {c.landArea ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60">
                                  {c.landArea}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">No land entered</span>
                              )}
                              {Array.isArray(c.primaryCrops) && c.primaryCrops.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {c.primaryCrops.map((crop) => (
                                    <span
                                      key={crop}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-semibold"
                                    >
                                      {crop}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Khata Due */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span
                                className={`font-black text-sm block ${
                                  (c.currentDue || 0) > 0 ? 'text-red-600' : 'text-emerald-600'
                                }`}
                              >
                                ₹{c.currentDue || 0}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                Limit: ₹{c.creditLimit || 25000}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Details Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 hover:border-leaf hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-200 hover:text-leaf font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Edit Customer Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Bill in POS Button */}
                              <Link
                                href="/admin/pos"
                                className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                                title="Open in POS Billing"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 text-harvest" />
                                <span>Bill</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── EDIT FARMER DETAILS MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-leaf/10 text-leaf flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900 dark:text-white">
                    Edit Farmer Details
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Updating profile for <strong className="text-leaf">{editForm.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Edit Error */}
            {editErrors.general && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Farmer Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Farmer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                  />
                  {editErrors.name && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5">{editErrors.name}</p>
                  )}
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Father&apos;s / Guardian&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={editForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setEditForm({ ...editForm, phone: val });
                      }}
                      className="w-full pl-12 pr-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  {editErrors.phone && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5">{editErrors.phone}</p>
                  )}
                </div>

                {/* Village */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    list="edit-villages"
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                  />
                  <datalist id="edit-villages">
                    {SUGGESTED_VILLAGES.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>

                {/* Para / Locality */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Para / Locality
                  </label>
                  <input
                    type="text"
                    value={editForm.para}
                    onChange={(e) => setEditForm({ ...editForm, para: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                  />
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Aadhaar Number (12 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editForm.aadhaar}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setEditForm({ ...editForm, aadhaar: val });
                    }}
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white font-mono"
                  />
                  {editErrors.aadhaar && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5">{editErrors.aadhaar}</p>
                  )}
                </div>

                {/* Land Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Land Area
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.landArea}
                      onChange={(e) => setEditForm({ ...editForm, landArea: e.target.value })}
                      placeholder="e.g. 3.5"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                    />
                    <select
                      value={editForm.landUnit}
                      onChange={(e) => setEditForm({ ...editForm, landUnit: e.target.value as any })}
                      className="px-2.5 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-black/40 text-xs font-bold outline-none text-gray-700 dark:text-gray-200"
                    >
                      <option value="Bigha">Bigha</option>
                      <option value="Acre">Acre</option>
                      <option value="Decimal">Decimal</option>
                    </select>
                  </div>
                </div>

                {/* Khata Credit Limit */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editForm.creditLimit}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-bold outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Primary Crops Cultivated */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary Crops Cultivated
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CROPS.map((crop) => {
                    const isSelected = editForm.primaryCrops.includes(crop.en);
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => toggleEditCrop(crop.en)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-leaf text-white font-bold'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{crop.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Remarks / Khata Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Additional notes about customer preferences, fertilizer requirements, or credit history"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs font-medium outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-leaf hover:bg-forest text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
