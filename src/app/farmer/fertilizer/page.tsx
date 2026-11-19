'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wheat,
  User,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Clock,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Tag,
  Home,
  FlaskConical,
  Printer,
  Sprout,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Download,
  Activity,
  Award,
} from 'lucide-react';

interface FarmerProfile {
  id: string;
  name: string;
  fatherName?: string;
  phone: string;
  village: string;
  para?: string;
  aadhaarMasked?: string;
  landArea?: string;
  primaryCrops?: string[];
  memberSince?: string;
}

interface SaleItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  baseUnit: string;
  unitPrice: number;
  totalPrice: number;
}

interface SaleRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: string;
  cashAmount: number;
  upiAmount: number;
  creditAmount: number;
  status: string;
  items: SaleItem[];
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  notes?: string;
  paymentMode?: string;
  createdAt: string;
}

interface SoilAdvisory {
  id: string;
  farmerId: string;
  fieldId?: string;
  farmerName: string;
  farmerPhone: string;
  fieldName: string;
  fieldArea: number;
  fieldAreaUnit: string;
  sampleCollectionDate: string;
  samplingDepth: string;
  purpose: string;
  status: string;
  createdAt: string;
  labResults?: {
    ph: number;
    ec: number;
    organicCarbon: number;
    availableN: number;
    availableP: number;
    availableK: number;
    zinc: number;
    copper?: number;
    iron?: number;
    boron?: number;
    manganese?: number;
    testedAt?: string;
  };
  cropDetails?: {
    cropName: string;
    cultivationMethod: string;
    variety: string;
    waterManagement: string;
    season: string;
    previousCrop?: string;
    expectedSowingDate?: string;
    expectedYield?: number;
    yieldUnit?: string;
  };
  recommendation?: {
    cropName: string;
    nutrientPerAcre: {
      nitrogenKg: number;
      phosphorusKg: number;
      potassiumKg: number;
    };
    fertilizerPerAcre: {
      ureaKg: number;
      sspKg: number;
      mopKg: number;
      zincSulphateKg?: number;
    };
    applicationSchedule: Array<{
      stage: string;
      description: string;
      products: string;
    }>;
    additionalAdvisoryBn?: string[];
    additionalAdvisoryEn?: string[];
  };
}

export default function FertilizerFarmerPortalPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ahammed_language') || localStorage.getItem('ahammed_lang');
      if (saved === 'bn' || saved === 'en') {
        setLang(saved as 'en' | 'bn');
      }
    } catch {}
  }, []);

  const [activeTab, setActiveTab] = useState<'bills' | 'khata' | 'soil' | 'profile'>('bills');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalBillsCount: 0,
    currentDue: 0,
    creditLimit: 25000,
    availableCredit: 25000,
  });
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [soilAdvisories, setSoilAdvisories] = useState<SoilAdvisory[]>([]);
  const [selectedAdvisoryIndex, setSelectedAdvisoryIndex] = useState<number>(0);
  const [reportLang, setReportLang] = useState<'bn' | 'en'>('bn');

  const isBn = lang === 'bn';

  const loadFarmerRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/farmer/fertilizer/records');
      if (res.status === 401) {
        router.push('/farmer/login');
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load farmer records');
      }

      setFarmer(data.farmer);
      if (data.summary) setSummary(data.summary);
      if (data.sales) setSales(data.sales);
      if (data.ledger) setLedger(data.ledger);
      if (data.soilAdvisories && Array.isArray(data.soilAdvisories)) {
        setSoilAdvisories(data.soilAdvisories);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerRecords();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/farmer/auth/me', { method: 'POST' });
      router.push('/farmer/login');
      router.refresh();
    } catch {
      router.push('/farmer/login');
    }
  };

  const currentAdvisory = soilAdvisories[selectedAdvisoryIndex] || soilAdvisories[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#061711] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {isBn ? 'আপনার সার, খাতা ও মাটি পরীক্ষার বিবরণী লোড হচ্ছে...' : 'Loading your fertilizer, ledger & soil advisory records...'}
        </p>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#061711] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
          {isBn ? 'অধিবেশন মেয়াদোত্তীর্ণ বা পাওয়া যায়নি' : 'Session Expired or Not Found'}
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">{error || 'Please login with your mobile number.'}</p>
        <Link
          href="/farmer/login"
          className="px-5 py-2.5 rounded-xl bg-leaf hover:bg-forest text-white font-bold text-xs"
        >
          {isBn ? 'লগইন পাতায় যান' : 'Go to Login'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#061711] text-slate-800 dark:text-slate-100 flex flex-col justify-between antialiased">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#071d15]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-white/10 px-4 sm:px-6 py-3.5 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🌾</span>
              <div>
                <span className="font-black text-sm tracking-tight text-forest dark:text-emerald-400 block leading-tight">
                  Ahammed Fertilizer
                </span>
                <span className="text-[10px] text-harvest font-extrabold uppercase tracking-wider block">
                  {isBn ? 'ডিজিটাল কৃষক পাসবই ও মাটি স্বাস্থ্য কার্ড' : 'Digital Farmer Passbook & Soil Health'}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Farmer Avatar & Info */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-leaf/10 dark:bg-emerald-950 text-leaf dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                {farmer.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-white block leading-tight">
                  {farmer.name}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  +91 {farmer.phone}
                </span>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => {
                const next = isBn ? 'en' : 'bn';
                setLang(next);
                setReportLang(next);
                try {
                  localStorage.setItem('ahammed_language', next);
                  localStorage.setItem('ahammed_lang', next);
                } catch {}
              }}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold text-xs hover:border-leaf cursor-pointer transition-colors"
            >
              {isBn ? 'English' : 'বাংলা'}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              title={isBn ? 'লগ আউট' : 'Log Out'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1 print:p-0 print:m-0 print:max-w-none">
        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-linear-to-r from-forest via-[#0e3b29] to-[#0a2f20] text-white shadow-md relative overflow-hidden print:hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-harvest text-forest shadow-xs">
                  {isBn ? 'সার, ফসল ও মাটি স্বাস্থ্য খাতা' : 'Fertilizer, Crop & Soil Passbook'}
                </span>
                {soilAdvisories.length > 0 && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-emerald-300" />
                    <span>{isBn ? 'মাটি স্বাস্থ্য কার্ড প্রস্তুত' : 'Soil Advisory Ready'}</span>
                  </span>
                )}
                <span className="text-xs text-emerald-200">
                  {farmer.village} {farmer.para ? `• ${farmer.para}` : ''}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isBn ? `নমস্কার, ${farmer.name}` : `Welcome, ${farmer.name}`}
              </h1>
              {farmer.fatherName && (
                <p className="text-xs text-white/80">
                  {isBn ? `পিতা/অভিভাবক: ${farmer.fatherName}` : `Father/Guardian: ${farmer.fatherName}`}
                </p>
              )}
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15">
              <div>
                <span className="text-[10px] text-white/70 uppercase font-bold block">
                  {isBn ? 'খাতার বর্তমান বাকি' : 'Current Due Balance'}
                </span>
                <span className={`text-xl font-black block ${summary.currentDue > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  ₹{summary.currentDue}
                </span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-white/70 uppercase font-bold block">
                  {isBn ? 'মাটি পরীক্ষার নমুনা' : 'Soil Health Card'}
                </span>
                <span className="text-xl font-black text-white block">
                  {soilAdvisories.length > 0 ? soilAdvisories[0].id : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2e21] border border-gray-200/80 dark:border-white/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {isBn ? 'মোট কেনাকাটা' : 'Total Purchases'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              ₹{summary.totalPurchases}
            </p>
            <span className="text-[10px] text-leaf font-bold block">
              {summary.totalBillsCount} {isBn ? 'টি চালান/বিল' : 'Total Invoices'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2e21] border border-gray-200/80 dark:border-white/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {isBn ? 'বাকি ব্যালেন্স' : 'Khata Due'}
            </span>
            <p className={`text-xl sm:text-2xl font-black ${summary.currentDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ₹{summary.currentDue}
            </p>
            <span className="text-[10px] text-gray-400 block">
              {summary.currentDue > 0 ? (isBn ? 'পরিশোধ বাকি' : 'Pending repayment') : (isBn ? 'সম্পূর্ণ পরিশোধিত' : 'Zero outstanding')}
            </span>
          </div>

          {/* Soil Card Metric */}
          <div
            onClick={() => setActiveTab('soil')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0c2e21] border border-emerald-500/30 hover:border-emerald-500 shadow-xs space-y-1 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                {isBn ? 'মাটি স্বাস্থ্য ও সার' : 'Soil Advisory'}
              </span>
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200">
              {currentAdvisory?.labResults ? `pH ${currentAdvisory.labResults.ph}` : 'Active'}
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
              {currentAdvisory?.cropDetails?.cropName || (isBn ? 'ধান চাষের সুপারিশ' : 'Paddy Recommendation')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2e21] border border-gray-200/80 dark:border-white/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {isBn ? 'জমির পরিমাণ' : 'Registered Land'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {farmer.landArea || (isBn ? '১.৫ বিঘা' : '1.5 Acre')}
            </p>
            <span className="text-[10px] text-gray-400 block truncate">
              {farmer.primaryCrops && farmer.primaryCrops.length > 0
                ? farmer.primaryCrops.join(', ')
                : isBn ? 'ধান, সরিষা' : 'Paddy, Mustard'}
            </span>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-1 overflow-x-auto print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'bills'
                ? 'bg-leaf text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isBn ? 'কেনাকাটার বিল ও রসিদ' : 'Purchase Invoices'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {sales.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('khata')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'khata'
                ? 'bg-leaf text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isBn ? 'খাতা জমা ও লেনদেন' : 'Khata Ledger'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {ledger.length}
            </span>
          </button>

          {/* Merged Soil Advisory Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('soil')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'soil'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/5 text-emerald-800 dark:text-emerald-400 font-extrabold'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>{isBn ? 'মাটি পরীক্ষা ও সার সুপারিশ' : 'Soil Health & Advisory'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-white font-mono font-bold">
              {soilAdvisories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-leaf text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isBn ? 'চাষীর পরিচয় ও জমি' : 'Farmer Profile'}</span>
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: PURCHASE INVOICES & BILLS ── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'bills' && (
          <div className="space-y-4 print:hidden">
            {sales.length === 0 ? (
              <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 p-12 text-center space-y-2">
                <Receipt className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-700 dark:text-gray-300">
                  {isBn ? 'কোনো কেনাকাটার বিল পাওয়া যায়নি' : 'No Purchase Bills Found'}
                </p>
                <p className="text-xs text-gray-500">
                  {isBn
                    ? 'আহম্মেদ ফার্টিলাইজারে পণ্য কিনলে আপনার সব রসিদ এখানে স্বয়ংক্রিয়ভাবে জমা হবে।'
                    : 'When you purchase products at Ahammed Fertilizer, your receipts will appear here automatically.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((s) => {
                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-xs p-5 hover:border-leaf/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-900 dark:text-white font-mono">
                              #{s.invoiceNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                              {s.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase">
                              {s.paymentMode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{new Date(s.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-gray-400 block">
                            {isBn ? 'মোট বিল' : 'Grand Total'}
                          </span>
                          <span className="text-xl font-black text-forest dark:text-emerald-400">
                            ₹{s.grandTotal}
                          </span>
                        </div>
                      </div>

                      {/* Items Purchased (Public Details) */}
                      <div className="pt-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">
                          {isBn ? 'কেনা পণ্যের বিবরণ' : 'Items in Bill'}
                        </span>
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                          {s.items.map((item) => (
                            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {item.productName}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {item.brand ? `${item.brand} • ` : ''}
                                  {item.quantity} {item.baseUnit || 'Unit'} × ₹{item.unitPrice}
                                </p>
                              </div>
                              <span className="font-black text-gray-900 dark:text-white">
                                ₹{item.totalPrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: KHATA LEDGER & COUNTER PAYMENTS ── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'khata' && (
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-xs overflow-hidden print:hidden">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isBn ? 'খাতা লেজার ও জমা বিবরণী' : 'Khata Ledger & Repayment Transactions'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isBn ? 'আপনার দোকানের বাকি ও জমার সম্পূর্ণ রেকর্ড' : 'Complete statement of counter credits and payments'}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {isBn ? 'সর্বশেষ ব্যালেন্স: ' : 'Balance: '} ₹{summary.currentDue}
              </span>
            </div>

            {ledger.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                {isBn ? 'কোনো খাতা জমা-খরচের রেকর্ড পাওয়া যায়নি।' : 'No khata transactions recorded yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 dark:bg-white/5 text-gray-500 font-extrabold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-white/10">
                      <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-3 px-4">{isBn ? 'বিবরণ' : 'Description'}</th>
                      <th className="py-3 px-4 text-right">{isBn ? 'বাকি (+Debit)' : 'Debit (+Credit)'}</th>
                      <th className="py-3 px-4 text-right">{isBn ? 'জমা (-Credit)' : 'Paid (-Repay)'}</th>
                      <th className="py-3 px-4 text-right">{isBn ? 'অবশিষ্ট বাকি' : 'Balance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                    {ledger.map((entry) => {
                      const isDebit = entry.type === 'bill_credit';
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                          <td className="py-3 px-4 text-gray-500 font-mono">
                            {new Date(entry.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            <span className="font-bold">
                              {isDebit
                                ? isBn ? 'বাকিতে সার/কীটনাশক ক্রয়' : 'Purchase on Credit'
                                : isBn ? 'দোকানে নগদ/ইউপিআই জমা' : 'Counter Repayment'}
                            </span>
                            {entry.notes && (
                              <p className="text-[11px] text-gray-400">{entry.notes}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600">
                            {isDebit ? `+₹${entry.amount}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            {!isDebit ? `-₹${entry.amount}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-gray-900 dark:text-white">
                            ₹{entry.balanceAfter}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 3: MERGED SOIL HEALTH & CROP ADVISORY ── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'soil' && (
          <div className="space-y-6">
            {soilAdvisories.length === 0 ? (
              <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 p-12 text-center space-y-3">
                <FlaskConical className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-black text-base text-gray-900 dark:text-white">
                  {isBn ? 'কোনো মাটি পরীক্ষার রিপোর্ট পাওয়া যায়নি' : 'No Soil Test Reports Found'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {isBn
                    ? 'আহম্মেদ ফার্টিলাইজারে আপনার মাটির নমুনা জমা দিয়ে বিনামূল্যে সরকারি মানসম্মত মাটি পরীক্ষা ও সারের বৈজ্ঞানিক সুপারিশ গ্রহণ করুন।'
                    : 'Submit your soil sample at Ahammed Fertilizer to receive certified laboratory test results and custom crop nutrition schedules.'}
                </p>
              </div>
            ) : (
              <>
                {/* Advisory Controls & Sample Selector */}
                <div className="bg-white dark:bg-[#0c241b] rounded-2xl border border-gray-200/80 dark:border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="font-black text-sm text-gray-900 dark:text-white">
                        {isBn ? 'মাটি পরীক্ষা ও সার সুপারিশ তালিকা' : 'Certified Soil Health & Advisory Reports'}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {isBn ? 'নমুনা অনুযায়ী ফসলের সার ব্যবহারের বিজ্ঞানভিত্তিক মাত্রা' : 'Official sample test results with custom split application recommendations'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Multi-sample selector if more than 1 */}
                    {soilAdvisories.length > 1 && (
                      <select
                        value={selectedAdvisoryIndex}
                        onChange={(e) => setSelectedAdvisoryIndex(Number(e.target.value))}
                        className="py-1.5 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                      >
                        {soilAdvisories.map((advisory, idx) => (
                          <option key={advisory.id} value={idx}>
                            {advisory.id} - {advisory.fieldName}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Report Language toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-white/5 p-0.5 rounded-xl border border-gray-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setReportLang('bn')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          reportLang === 'bn' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        বাংলা
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportLang('en')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          reportLang === 'en' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        English
                      </button>
                    </div>

                    {/* Print / Save PDF Button */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isBn ? 'রিপোর্ট প্রিন্ট / PDF' : 'Print / Save PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* Printable Soil Health Card Certificate (Matches Screen 9 of Layout) */}
                <div className="bg-white text-gray-900 rounded-3xl border-2 border-emerald-600/30 p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0">
                  {/* Official Header */}
                  <div className="border-b-2 border-emerald-700 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
                        🌾
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                          Ahammed Fertilizer • Soil Health Testing Laboratory
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                          {reportLang === 'bn'
                            ? 'মাটি পরীক্ষা ও ফসল পরামর্শ প্রতিবেদন'
                            : 'Soil Health & Crop Advisory Report'}
                        </h2>
                        <p className="text-xs text-gray-600">
                          Authorized Soil Testing Center • Dakshin Dinajpur, West Bengal • Helpline: +91 9091017035
                        </p>
                      </div>
                    </div>

                    <div className="text-right border-l-2 sm:border-emerald-200 sm:pl-4">
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                        Sample ID: {currentAdvisory?.id || 'ND-2026-001'}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-1">
                        Date: {currentAdvisory?.sampleCollectionDate || '16 Nov 2026'}
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Farmer & Field Details (১. কৃষকের তথ্য) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{reportLang === 'bn' ? '১. কৃষকের তথ্য (Farmer & Field Details)' : '1. Farmer & Field Details'}</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'কৃষকের নাম:' : 'Farmer Name:'}
                        </span>
                        <span className="font-black text-gray-950">{farmer.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}
                        </span>
                        <span className="font-mono font-bold text-gray-900">+91 {farmer.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'গ্রাম / পাড়া:' : 'Village / Para:'}
                        </span>
                        <span className="font-semibold text-gray-900">{farmer.village} {farmer.para ? `(${farmer.para})` : ''}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'ব্লক ও জেলা:' : 'Block & District:'}
                        </span>
                        <span className="font-semibold text-gray-900">Gangarampur, Dakshin Dinajpur</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'জমির নাম ও পরিমাণ:' : 'Field & Land Area:'}
                        </span>
                        <span className="font-black text-emerald-800">
                          {currentAdvisory?.fieldName || 'Field-01'} ({currentAdvisory?.fieldArea || farmer.landArea || '1.50'} {currentAdvisory?.fieldAreaUnit || 'Acre'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'জিপিএস কোঅর্ডিনেট:' : 'GPS Coordinates:'}
                        </span>
                        <span className="font-mono text-gray-700">25.6234° N, 88.6742° E</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'লক্ষ্য ফসল ও জাত:' : 'Target Crop & Variety:'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {currentAdvisory?.cropDetails?.cropName || 'Paddy (Rice)'} ({currentAdvisory?.cropDetails?.variety || 'Swarna Gouri'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {reportLang === 'bn' ? 'নমুনার গভীরতা:' : 'Sampling Depth:'}
                        </span>
                        <span className="font-semibold text-gray-900">{currentAdvisory?.samplingDepth || '0 - 15 cm'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Laboratory Test Results (২. মাটি পরীক্ষার ফলাফল) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{reportLang === 'bn' ? '২. মাটি পরীক্ষার ফলাফল (Soil Test Results & Interpretation)' : '2. Soil Test Results & Interpretation'}</span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-emerald-800 text-white font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3">{reportLang === 'bn' ? 'প্যারামিটার (Parameter)' : 'Parameter'}</th>
                            <th className="py-2.5 px-3 text-center">{reportLang === 'bn' ? 'পরীক্ষিত মান (Result)' : 'Test Value'}</th>
                            <th className="py-2.5 px-3 text-center">{reportLang === 'bn' ? 'আদর্শ সীমা (Optimal Range)' : 'Standard Range'}</th>
                            <th className="py-2.5 px-3">{reportLang === 'bn' ? 'মানদণ্ড / মূল্যায়ন (Status)' : 'Status / Health Rating'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'মাটির পিএইচ (pH)' : 'Soil pH (Reaction)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.ph || 6.2}
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">6.0 - 7.5</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {reportLang === 'bn' ? 'সামান্য অম্লীয় (ভালো)' : 'Slightly Acidic (Good)'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'তড়িৎ পরিবাহিতা (EC)' : 'Electrical Conductivity (EC)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.ec || 0.31} dS/m
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">&lt; 1.0 dS/m</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {reportLang === 'bn' ? 'স্বাভাবিক (Normal)' : 'Normal (Non-saline)'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'জৈব কার্বন (Organic Carbon)' : 'Organic Carbon (OC)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.organicCarbon || 0.72} %
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">0.75 - 1.50 %</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {reportLang === 'bn' ? 'কম (Low - জৈব সার প্রয়োজন)' : 'Low (Compost Recommended)'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'সহজলভ্য নাইট্রোজেন (Available N)' : 'Available Nitrogen (N)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.availableN || 210} kg/ha
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">280 - 560 kg/ha</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                {reportLang === 'bn' ? 'ঘাটতি / কম (Low)' : 'Low Deficiency'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'সহজলভ্য ফসফরাস (Available P)' : 'Available Phosphorus (P)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.availableP || 14} kg/ha
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">10 - 25 kg/ha</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                                {reportLang === 'bn' ? 'মাঝারি (Medium)' : 'Medium'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'সহজলভ্য পটাশিয়াম (Available K)' : 'Available Potassium (K)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.availableK || 210} kg/ha
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">110 - 280 kg/ha</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {reportLang === 'bn' ? 'মাঝারি (Medium)' : 'Medium / Optimal'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-gray-50/80">
                            <td className="py-2.5 px-3 font-bold text-gray-900">
                              {reportLang === 'bn' ? 'জিংক (Zinc - Zn)' : 'Available Zinc (Zn)'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black font-mono">
                              {currentAdvisory?.labResults?.zinc || 0.62} mg/kg
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">&gt; 0.60 mg/kg</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {reportLang === 'bn' ? 'পর্যাপ্ত (Adequate)' : 'Adequate'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 3: Fertilizer Recommendation (৩. সার ব্যবহারের সুপারিশ) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-700 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {reportLang === 'bn'
                          ? `৩. সার ব্যবহারের সুপারিশ - ${currentAdvisory?.cropDetails?.cropName || 'ধান'} (Fertilizer Recommendation)`
                          : `3. Fertilizer Recommendation - ${currentAdvisory?.cropDetails?.cropName || 'Paddy'}`}
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nutrients Per Acre */}
                      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 block">
                          {reportLang === 'bn' ? 'পুষ্টি উপাদান প্রতি একর (Nutrient Requirement)' : 'Nutrient Dose (kg/acre)'}
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Nitrogen (N)</span>
                            <span className="font-black text-gray-900">46 kg/acre</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Phosphorus (P₂O₅)</span>
                            <span className="font-black text-gray-900">20 kg/acre</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="font-semibold text-gray-700">Potassium (K₂O)</span>
                            <span className="font-black text-gray-900">16 kg/acre</span>
                          </div>
                        </div>
                      </div>

                      {/* Commercial Products Per Acre */}
                      <div className="border-2 border-emerald-600/30 rounded-2xl p-4 bg-emerald-50/40 space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                          {reportLang === 'bn' ? 'বাণিজ্যিক সার প্রতি একর (Commercial Products)' : 'Fertilizer Product Per Acre'}
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-emerald-200/60">
                            <span className="font-bold text-gray-900">Urea (46% N)</span>
                            <span className="font-black text-emerald-900">100 kg / একর</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-emerald-200/60">
                            <span className="font-bold text-gray-900">SSP (16% P₂O₅)</span>
                            <span className="font-black text-emerald-900">125 kg / একর</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-emerald-200/60">
                            <span className="font-bold text-gray-900">MOP (60% K₂O)</span>
                            <span className="font-black text-emerald-900">27 kg / একর</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="font-bold text-gray-900">Zinc Sulphate (21%)</span>
                            <span className="font-black text-emerald-900">5 kg / একর</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Application Schedule (৪. প্রয়োগের সময়সূচি) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{reportLang === 'bn' ? '৪. প্রয়োগের সময়সূচি (Application Schedule)' : '4. Split Application Schedule'}</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span className="font-bold text-gray-900">
                              {reportLang === 'bn' ? 'বেসাল (জমি তৈরির শেষ চাষে)' : 'Basal (At final land preparation)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {reportLang === 'bn' ? 'জমি তৈরির শেষ চাষে সমভাবে প্রয়োগ করে মাটিতে মিশিয়ে দিন।' : 'Broadcast evenly and incorporate into soil during final ploughing.'}
                          </p>
                        </div>
                        <span className="font-black text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 font-mono">
                          SSP 125 kg + MOP 27 kg + Urea 20 kg
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-bold text-gray-900">
                              {reportLang === 'bn' ? 'প্রথম উপরি প্রয়োগ (২০-২৫ দিন পর)' : 'Top Dressing 1 (20-25 DAT)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {reportLang === 'bn' ? 'চারা রোপণের ২০-২৫ দিন পর ১ম বার উপরি প্রয়োগ করুন।' : 'Apply 20-25 days after transplanting at active tillering stage.'}
                          </p>
                        </div>
                        <span className="font-black text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 font-mono">
                          Urea 40 kg
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="font-bold text-gray-900">
                              {reportLang === 'bn' ? 'দ্বিতীয় উপরি প্রয়োগ (৪০-৪৫ দিন পর)' : 'Top Dressing 2 (40-45 DAT)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {reportLang === 'bn' ? 'শীষ বা থোড় আসার সময় ২য় বার উপরি প্রয়োগ করুন।' : 'Apply 40-45 days after transplanting at panicle initiation.'}
                          </p>
                        </div>
                        <span className="font-black text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 font-mono">
                          Urea 40 kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Additional Advisory (৫. অতিরিক্ত বৈজ্ঞানিক পরামর্শ) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{reportLang === 'bn' ? '৫. অতিরিক্ত বৈজ্ঞানিক পরামর্শ (Agronomic Advisory)' : '5. Agronomic Advisory & Guidelines'}</span>
                    </h3>

                    <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs">
                      {reportLang === 'bn' ? (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>জমিতে জৈব পদার্থের ঘাটতি মেটাতে একর প্রতি ২ টন পচা গোবর সার বা কম্পোস্ট শেষ চাষের সময় প্রয়োগ করুন।</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>ইউরিয়া সার জমিতে প্রয়োগ করার সময় জমিতে ২-৩ সেমি নিয়ন্ত্রিত জল রাখুন যাতে সারের অপচয় রোধ হয়।</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>জিংকের ঘাটতি লক্ষণ দেখা দিলে জিংক সালফেট (০.৫%) ও চুন দ্রবণ স্প্রে করতে পারেন।</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>Apply 2 tonnes of farmyard manure or well-decomposed compost per acre during final land preparation to build organic carbon.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>Maintain a shallow water layer (2-3 cm) during top dressing of Urea fertilizer to minimize volatilization loss.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>If foliar zinc deficiency chlorosis occurs, spray 0.5% Zinc Sulphate neutralized with 0.25% slaked lime.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Certified Signatures Footer */}
                  <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <span>Approved by Ahammed Fertilizer Agronomist &amp; Govt. Authorized Lab</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] block">Verified Digital Record • Dakshin Dinajpur</span>
                      <span className="text-[10px] text-gray-400">Helpline: +91 9091017035 • support@ahammed.com</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 4: FARMER PROFILE & PUBLIC DETAILS ── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-xs p-6 space-y-6 print:hidden">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
              <User className="w-5 h-5 text-leaf" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                {isBn ? 'ডাটাবেসে সংরক্ষিত পাবলিক বিবরণী' : 'Public Profile & Records in Database'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'কৃষকের পুরো নাম' : 'Full Name'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{farmer.name}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'পিতার নাম' : "Father's Name"}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{farmer.fatherName || '—'}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'নিবন্ধিত ফোন' : 'Registered Phone'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white font-mono">+91 {farmer.phone}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'গ্রাম' : 'Village'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{farmer.village}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'পাড়া / এলাকা' : 'Para / Locality'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{farmer.para || '—'}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'আধার নম্বর (সুরক্ষিত)' : 'Aadhaar (Protected)'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white font-mono">
                  {farmer.aadhaarMasked || '—'}
                </p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'জমির পরিমাণ' : 'Land Area'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{farmer.landArea || '—'}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'প্রধান ফসল' : 'Primary Crops'}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {farmer.primaryCrops && farmer.primaryCrops.length > 0 ? (
                    farmer.primaryCrops.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">{isBn ? 'নিবন্ধন তারিখ' : 'Registered Since'}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {farmer.memberSince ? new Date(farmer.memberSince).toLocaleDateString('en-IN') : '2026'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 flex items-start gap-3 text-xs text-gray-500">
              <ShieldCheck className="w-5 h-5 text-leaf shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'এই তথ্যগুলো আহম্মদ ফার্টিলাইজারের অফিসিয়াল ডাটাবেসে সুরক্ষিত রয়েছে। আপনার খাতা বা বিলের কোনো তথ্যে গরমিল থাকলে দোকানে যোগাযোগ করুন।'
                  : 'This information is securely synchronized with Ahammed Fertilizer store master. Only public customer-facing details are displayed.'}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-6xl w-full mx-auto p-4 border-t border-gray-200/80 dark:border-white/10 text-center text-xs text-gray-400 print:hidden">
        <p>Ahammed Fertilizer • Dakshin Dinajpur • Govt. Authorized Shop • হেল্পলাইন: +91 9091017035</p>
      </footer>
    </div>
  );
}
