'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  Phone,
  Sprout,
  Droplets,
  ClipboardList,
  FlaskConical,
  PhoneCall,
  Receipt,
  Printer,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import {
  CrmLandPlot,
  CrmCultivation,
  CrmCase,
  CrmFollowup,
  CrmTestRequest,
  CrmTestResult,
} from '@/types/crm';
import { CustomerRecord, SaleRecord } from '@/types/admin';

export default function CustomerDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;

  const [dossier, setDossier] = useState<{
    customer: CustomerRecord;
    plots: CrmLandPlot[];
    cultivations: CrmCultivation[];
    sales: SaleRecord[];
    totalSpend: number;
    cases: CrmCase[];
    followups: CrmFollowup[];
    testRequests: CrmTestRequest[];
    testResults: Record<string, CrmTestResult>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'plots' | 'cultivations' | 'sales' | 'cases' | 'tests' | 'followups'
  >('plots');

  // Modal states for adding plot or cultivation
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [plotForm, setPlotForm] = useState({
    name: '',
    type: 'crop_field' as 'crop_field' | 'pond',
    locationText: '',
    village: '',
    block: 'Balurghat',
    district: 'Dakshin Dinajpur',
    areaValue: 1,
    areaUnit: 'bigha' as 'bigha' | 'acre' | 'decimal',
    waterSource: '',
    notes: '',
  });

  const [showCultModal, setShowCultModal] = useState(false);
  const [cultForm, setCultForm] = useState({
    plotId: '',
    kind: 'crop' as 'crop' | 'fish',
    cropOrSpeciesName: '',
    variety: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    season: 'Aman' as any,
    notes: '',
  });

  const loadDossier = () => {
    setLoading(true);
    fetch(`/api/admin/crm/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.dossier) {
          setDossier(data.dossier);
          if (data.dossier.customer?.village) {
            setPlotForm((prev) => ({ ...prev, village: data.dossier.customer.village }));
          }
          if (data.dossier.plots?.length > 0) {
            setCultForm((prev) => ({ ...prev, plotId: data.dossier.plots[0].id }));
          }
        }
      })
      .catch((err) => console.error('Dossier fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDossier();
  }, [customerId]);

  const handleAddPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/crm/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...plotForm,
          customerId,
          customerName: dossier?.customer.name,
        }),
      });
      if (res.ok) {
        setShowPlotModal(false);
        loadDossier();
      }
    } catch (err) {
      console.error('Failed to create plot:', err);
    }
  };

  const handleAddCultivation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/crm/cultivations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cultForm,
          customerId,
        }),
      });
      if (res.ok) {
        setShowCultModal(false);
        loadDossier();
      }
    } catch (err) {
      console.error('Failed to create cultivation:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        কৃষকের পূর্ণাঙ্গ ডসিয়ার লোড হচ্ছে...
      </div>
    );
  }

  if (!dossier || !dossier.customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">কৃষক তথ্য পাওয়া যায়নি।</p>
        <Link
          href="/admin/crm/customers"
          className="mt-4 inline-block text-xs font-bold text-forest underline"
        >
          তালিকা পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const { customer, plots, cultivations, sales, totalSpend, cases, followups, testRequests, testResults } =
    dossier;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0">
      {/* ── Top Nav / Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10 print:hidden">
        <Link
          href="/admin/crm/customers"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          সকল কৃষক তালিকা
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            ডসিয়ার প্রিন্ট করুন (Print Dossier)
          </button>
          <Link
            href={`/admin/crm/cases/new?customerId=${customer.id}`}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন সমস্যা কেস লিখুন
          </Link>
        </div>
      </div>

      {/* ── Customer Identity Dossier Banner ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf">
                POS Customer #{customer.id}
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                নিবন্ধন: {new Date(customer.createdAt).toLocaleDateString('bn-IN')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {customer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1 font-mono font-bold text-gray-700 dark:text-gray-300">
                <Phone className="w-3.5 h-3.5 text-forest" />
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                {customer.village || 'বালুরঘাট'}
              </span>
            </div>
          </div>

          {/* Quick Metrics from POS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-2xl bg-forest/5 dark:bg-white/5">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">মোট কেনাকাটা (POS)</span>
              <span className="text-lg font-extrabold text-forest dark:text-leaf">
                ₹{totalSpend.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-white/5">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">বাকি খাতা (Due)</span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                ₹{(customer.currentDue || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/5 dark:bg-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">জমি ও পুকুর</span>
              <span className="text-lg font-extrabold text-cyan-700 dark:text-cyan-400">
                {plots.length} টি প্লট
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab('plots')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'plots'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <Sprout className="w-4 h-4" />
          জমি ও পুকুর ({plots.length})
        </button>

        <button
          onClick={() => setActiveTab('cultivations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cultivations'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <Droplets className="w-4 h-4" />
          ফসল ও মাছ চাষ ({cultivations.length})
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <Receipt className="w-4 h-4" />
          পিওএস ইনভয়েস ({sales.length})
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cases'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          রোগ ও প্রেসক্রিপশন ({cases.length})
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          মাটি ও জল টেস্ট ({testRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'followups'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-forest/10'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          ফলো-আপ হিস্ট্রি ({followups.length})
        </button>
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. PLOTS & PONDS */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              নিবন্ধিত জমি ও পুকুরের তালিকা (Land Plots & Ponds)
            </h2>
            <button
              onClick={() => setShowPlotModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> নতুন প্লট যোগ করুন
            </button>
          </div>

          {plots.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              কোনো জমি বা পুকুর যুক্ত করা হয়নি। &quot;নতুন প্লট যোগ করুন&quot; বাটনে ক্লিক করে যুক্ত করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf uppercase">
                        {plot.type === 'crop_field' ? 'ফসলি জমি' : 'মাছের পুকুর'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                        {plot.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {plot.locationText}, {plot.village}, {plot.block}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-forest dark:text-leaf">
                        {plot.areaValue} {plot.areaUnit}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        (ক্যানোনিকাল: {plot.areaInDecimal} শতক)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    {plot.waterSource && (
                      <p>
                        <span className="font-semibold text-gray-500">জলের উৎস:</span> {plot.waterSource}
                      </p>
                    )}
                    {plot.notes && (
                      <p>
                        <span className="font-semibold text-gray-500">মন্তব্য:</span> {plot.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CULTIVATIONS */}
      {activeTab === 'cultivations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              চলমান ও পূর্ববর্তী চাষের বিবরণ (Cultivations)
            </h2>
            <button
              onClick={() => setShowCultModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> নতুন চাষ যোগ করুন
            </button>
          </div>

          {cultivations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              কোনো ফসল বা মাছ চাষের তথ্য যুক্ত করা হয়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cultivations.map((cult) => {
                const targetPlot = plots.find((p) => p.id === cult.plotId);
                return (
                  <div
                    key={cult.id}
                    className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 uppercase">
                          {cult.kind === 'crop' ? 'ফসল' : 'মাছ চাষ'} • {cult.season}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                          {cult.cropOrSpeciesName}
                        </h3>
                        {cult.variety && (
                          <p className="text-xs text-forest dark:text-leaf font-medium">
                            জাত: {cult.variety}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          প্লট: <span className="font-semibold">{targetPlot?.name || 'অজ্ঞাত'}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cult.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cult.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 flex justify-between">
                      <span>শুরু: {cult.startDate}</span>
                      <span>সমাপ্তি প্রত্যাশা: {cult.expectedEndDate || 'নির্দিষ্ট নয়'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. REAL POS PURCHASE HISTORY */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-forest" />
              পিওএস ইনভয়েস ইতিহাস (POS Billing History)
            </h2>
            <span className="text-xs text-gray-500">
              মোট ইনভয়েস: {sales.length} টি
            </span>
          </div>

          {sales.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              এই কৃষকের কোনো পিওএস বিলিং রেকর্ড নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5 gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-forest dark:text-leaf">
                        {sale.invoiceNumber}
                      </span>
                      <span className="text-xs text-gray-400 ml-3">
                        {new Date(sale.createdAt).toLocaleDateString('bn-IN')} • {(sale.paymentMode || 'cash').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        মোট: ₹{sale.grandTotal.toLocaleString('en-IN')}
                      </span>
                      {sale.creditAmount > 0 && (
                        <span className="block text-[10px] text-amber-600 font-bold">
                          বাকি: ₹{sale.creditAmount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 divide-y divide-gray-50 dark:divide-white/5">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {item.productName} × {item.quantity} {item.unit || 'unit'}
                        </span>
                        <span className="text-gray-500">₹{item.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CASES & PRESCRIPTIONS */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              সমস্যার কেস ও প্রেসক্রিপশন (Diagnostic Cases)
            </h2>
            <Link
              href={`/admin/crm/cases/new?customerId=${customer.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> নতুন কেস লিখুন
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              কোনো সমস্যার কেস নথিবদ্ধ নেই।
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-forest dark:text-leaf">
                          {c.caseNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest">
                          {c.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {c.severity}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        প্লট: {c.plotName} • পর্যবেক্ষণ তারিখ: {c.observedOn}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        c.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-sand/30 dark:bg-white/5 p-3 rounded-xl">
                    {c.description}
                  </p>

                  {/* Prescriptions */}
                  {c.prescriptions && c.prescriptions.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
                      <span className="text-xs font-bold text-forest dark:text-leaf uppercase tracking-wider block">
                        📋 ব্যবস্থাপত্র (Prescription Items):
                      </span>
                      {c.prescriptions.map((p) => (
                        <div key={p.id} className="text-xs space-y-1">
                          {p.notes && <p className="italic text-gray-500">{p.notes}</p>}
                          {p.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {item.productName}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  ({item.quantity} {item.unit})
                                </span>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  ডোজ: {item.doseInstructions} • পদ্ধতি: {item.applicationMethod}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/admin/crm/cases/${c.id}`}
                      className="text-xs text-forest dark:text-leaf font-bold hover:underline"
                    >
                      সম্পূর্ণ কেস ও টাইমলাইন &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. LAB TEST RESULTS */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              মাটি ও জল পরীক্ষার রিপোর্ট (Lab Tests)
            </h2>
          </div>

          {testRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              কোনো ল্যাব টেস্ট রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {testRequests.map((tr) => {
                const res = testResults[tr.id];
                return (
                  <div
                    key={tr.id}
                    className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-forest dark:text-leaf">
                          {tr.requestNumber}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1 capitalize">
                          {tr.testType === 'soil' ? 'মাটি পরীক্ষা' : tr.testType === 'pond' ? 'পুকুরের জল' : 'নলকূপের জল'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          তারিখ: {new Date(tr.createdAt).toLocaleDateString('bn-IN')} • মূল্য: ₹{tr.price} ({tr.paymentStatus})
                        </p>
                      </div>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 uppercase">
                        {tr.status}
                      </span>
                    </div>

                    {res && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {res.parameters.map((param, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-sand/30 dark:bg-white/5 text-center">
                              <span className="text-[10px] text-gray-500 block">{param.label}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {param.value} {param.unit}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full block mt-0.5 ${
                                  param.status === 'optimal'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {param.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-forest/5 dark:bg-white/5 border border-forest/15 text-xs">
                          <span className="font-bold text-forest dark:text-leaf block mb-1">
                            বিশেষজ্ঞের পরামর্শ ও সারের মাত্রা:
                          </span>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {res.recommendationText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              ফলো-আপ ও কৃষকের প্রতিক্রিয়া (Call History)
            </h2>
          </div>

          {followups.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 text-center text-xs text-gray-400">
              কোনো ফলো-আপ কল নথিবদ্ধ নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {followups.map((f) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-[#082218] rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest dark:text-leaf">
                        তারিখ: {f.dueDate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          f.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                      {f.outcome && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          ফলাফল: {f.outcome}
                        </span>
                      )}
                    </div>
                    {f.customerFeedback && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                        &quot;{f.customerFeedback}&quot;
                      </p>
                    )}
                    {f.calledByName && (
                      <p className="text-[10px] text-gray-400">কল গ্রহণকারী কর্মী: {f.calledByName}</p>
                    )}
                  </div>

                  {f.satisfactionRating && (
                    <div className="text-amber-500 font-bold text-sm shrink-0">
                      {'★'.repeat(f.satisfactionRating)}
                      <span className="text-gray-300">{'★'.repeat(5 - f.satisfactionRating)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD PLOT ── */}
      {showPlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                নতুন জমি বা পুকুর যুক্ত করুন
              </h3>
              <button
                onClick={() => setShowPlotModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPlot} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  প্লটের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={plotForm.name}
                  onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })}
                  placeholder="যেমন: উত্তর মাঠ বা বড় পুকুর"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ধরন
                  </label>
                  <select
                    value={plotForm.type}
                    onChange={(e) => setPlotForm({ ...plotForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  >
                    <option value="crop_field">ফসলি জমি (Crop Field)</option>
                    <option value="pond">মাছের পুকুর (Fish Pond)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    গ্রাম
                  </label>
                  <input
                    type="text"
                    required
                    value={plotForm.village}
                    onChange={(e) => setPlotForm({ ...plotForm, village: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    জমির পরিমাণ
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={plotForm.areaValue}
                    onChange={(e) =>
                      setPlotForm({ ...plotForm, areaValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    একক (Unit)
                  </label>
                  <select
                    value={plotForm.areaUnit}
                    onChange={(e) => setPlotForm({ ...plotForm, areaUnit: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  >
                    <option value="bigha">বিঘা (Bigha ~ 33 dec)</option>
                    <option value="decimal">শতক (Decimal)</option>
                    <option value="acre">একর (Acre = 100 dec)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  জলের উৎস (Water Source)
                </label>
                <input
                  type="text"
                  value={plotForm.waterSource}
                  onChange={(e) => setPlotForm({ ...plotForm, waterSource: e.target.value })}
                  placeholder="যেমন: ক্যানেল / শ্যালো টিউবওয়েল"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CULTIVATION ── */}
      {showCultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                নতুন ফসল বা মাছ চাষ যোগ করুন
              </h3>
              <button
                onClick={() => setShowCultModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCultivation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  কোন প্লটে চাষ হচ্ছে? <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={cultForm.plotId}
                  onChange={(e) => setCultForm({ ...cultForm, plotId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.areaValue} {p.areaUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    চাষের ধরন
                  </label>
                  <select
                    value={cultForm.kind}
                    onChange={(e) => setCultForm({ ...cultForm, kind: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  >
                    <option value="crop">ফসল (Crop)</option>
                    <option value="fish">মাছ চাষ (Fish)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    মৌসুম (Season)
                  </label>
                  <select
                    value={cultForm.season}
                    onChange={(e) => setCultForm({ ...cultForm, season: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  >
                    <option value="Aman">আমন ধান (Aman)</option>
                    <option value="Boro">বোরো ধান (Boro)</option>
                    <option value="Aus">আউশ ধান (Aus)</option>
                    <option value="Rabi">রবি শস্য (Rabi - Mustard/Potato)</option>
                    <option value="Kharif">খরিফ (Kharif)</option>
                    <option value="Year-Round">সারা বছর (Year-Round Fish)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ফসল বা মাছের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cultForm.cropOrSpeciesName}
                  onChange={(e) => setCultForm({ ...cultForm, cropOrSpeciesName: e.target.value })}
                  placeholder="যেমন: স্বর্ণা আমন ধান বা রুই-কাতলা-মৃগেল"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  জাত (Variety)
                </label>
                <input
                  type="text"
                  value={cultForm.variety}
                  onChange={(e) => setCultForm({ ...cultForm, variety: e.target.value })}
                  placeholder="যেমন: MTU-7029"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={cultForm.startDate}
                    onChange={(e) => setCultForm({ ...cultForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    সম্ভাব্য শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={cultForm.expectedEndDate}
                    onChange={(e) => setCultForm({ ...cultForm, expectedEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCultModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
