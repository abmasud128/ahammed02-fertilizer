'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sprout,
  Droplets,
  Package,
} from 'lucide-react';
import { CustomerRecord, ProductRecord } from '@/types/admin';
import { CrmLandPlot, CrmCultivation, CaseCategory, CaseSeverity } from '@/types/crm';

function NewCaseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [plots, setPlots] = useState<CrmLandPlot[]>([]);
  const [cultivations, setCultivations] = useState<CrmCultivation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomerId);
  const [selectedPlot, setSelectedPlot] = useState('');
  const [selectedCultivation, setSelectedCultivation] = useState('');
  const [category, setCategory] = useState<CaseCategory>('crop_disease');
  const [severity, setSeverity] = useState<CaseSeverity>('moderate');
  const [observedOn, setObservedOn] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Prescription items
  const [prescNotes, setPrescNotes] = useState('');
  const [prescItems, setPrescItems] = useState<
    Array<{
      productId?: string;
      productName: string;
      isCustomItem: boolean;
      quantity: number;
      unit: string;
      doseInstructions: string;
      applicationMethod: string;
      intervalDays: number;
      numberOfApplications: number;
    }>
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/customers').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/admin/crm/plots').then((r) => r.json()),
      fetch('/api/admin/crm/cultivations').then((r) => r.json()),
    ])
      .then(([custData, prodData, plotsData, cultData]) => {
        if (custData.success && custData.customers) setCustomers(custData.customers);
        if (prodData.success && prodData.products) setProducts(prodData.products);
        if (plotsData.success && plotsData.plots) setPlots(plotsData.plots);
        if (cultData.success && cultData.cultivations) setCultivations(cultData.cultivations);

        if (preselectedCustomerId) {
          setSelectedCustomer(preselectedCustomerId);
          const custPlots = (plotsData.plots || []).filter(
            (p: CrmLandPlot) => p.customerId === preselectedCustomerId
          );
          if (custPlots.length > 0) setSelectedPlot(custPlots[0].id);
        }
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [preselectedCustomerId]);

  // Update available plots when customer changes
  const customerPlots = plots.filter((p) => p.customerId === selectedCustomer);
  const plotCultivations = cultivations.filter((c) => c.plotId === selectedPlot);

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomer(custId);
    const available = plots.filter((p) => p.customerId === custId);
    setSelectedPlot(available.length > 0 ? available[0].id : '');
    setSelectedCultivation('');
  };

  const handleAddPrescItem = () => {
    setPrescItems([
      ...prescItems,
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || 'Product',
        isCustomItem: false,
        quantity: 1,
        unit: 'packet',
        doseInstructions: '1 ml per litre of water',
        applicationMethod: 'Foliar Spray',
        intervalDays: 7,
        numberOfApplications: 1,
      },
    ]);
  };

  const handleRemovePrescItem = (index: number) => {
    setPrescItems(prescItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...prescItems];
    if (field === 'productId') {
      const selectedProd = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value,
        productName: selectedProd?.name || 'Product',
        isCustomItem: false,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setPrescItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCustomer) {
      setErrorMessage('অনুগ্রহ করে একজন কৃষক নির্বাচন করুন।');
      return;
    }

    if (!selectedPlot) {
      setErrorMessage('অনুগ্রহ করে জমি বা পুকুর (Plot) নির্বাচন করুন।');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('অনুগ্রহ করে সমস্যার শিরোনাম এবং বিস্তারিত বিবরণ লিখুন।');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/crm/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          plotId: selectedPlot,
          cultivationId: selectedCultivation || undefined,
          category,
          severity,
          observedOn,
          title,
          description,
          initialPrescription:
            prescItems.length > 0
              ? {
                  notes: prescNotes,
                  items: prescItems,
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'কেস সংরক্ষণ করা সম্ভব হয়নি।');
      }

      router.push(`/admin/crm/cases/${data.case.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* ── Top Nav ── */}
      <div className="pb-4 border-b border-gray-200 dark:border-white/10">
        <Link
          href="/admin/crm/cases"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-forest transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          সকল কেস তালিকায় ফিরে যান
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          নতুন সমস্যা ও রোগ নির্ণয় কেস (New Diagnostic Case)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          কৃষকের ফসল বা মাছের সমস্যার লক্ষণ নথিবদ্ধ করুন এবং পিওএস ওষুধের ব্যবস্থাপত্র দিন।
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer & Plot Selection */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs">
              ১
            </span>
            কৃষক ও জমি নির্বাচন (Farmer & Plot)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                কৃষক নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCustomer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              >
                <option value="">-- কৃষক পছন্দ করুন --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.village || 'বালুরঘাট'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                আক্রান্ত জমি বা পুকুর (Plot) <span className="text-rose-500">*</span>
              </label>
              {customerPlots.length === 0 ? (
                <div className="text-xs text-amber-600 p-2.5 bg-amber-50 rounded-xl">
                  এই কৃষকের কোনো প্লট যোগ করা নেই। অনুগ্রহ করে প্রথমে কৃষকের ডসিয়ারে প্লট যুক্ত করুন।
                </div>
              ) : (
                <select
                  required
                  value={selectedPlot}
                  onChange={(e) => setSelectedPlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
                >
                  {customerPlots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type === 'crop_field' ? 'জমি' : 'পুকুর'}, {p.areaValue} {p.areaUnit})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Problem Diagnostics */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs">
              ২
            </span>
            সমস্যার লক্ষণ ও নির্ণয় (Diagnostic Details)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                সমস্যার শ্রেণি (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              >
                <option value="crop_disease">ফসলের রোগ (Crop Disease)</option>
                <option value="pest">পোকামাকড় (Pest Attack)</option>
                <option value="nutrient_deficiency">পুষ্টির অভাব (Nutrient Deficiency)</option>
                <option value="soil">মাটির সমস্যা (Soil Health)</option>
                <option value="pond_water_toxicity">পুকুরে অ্যামোনিয়া/জলের বিষ (Pond Toxicity)</option>
                <option value="fish_disease">মাছের রোগ (Fish Disease)</option>
                <option value="fish_growth">মাছের বৃদ্ধি সমস্যা (Fish Growth)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                তীব্রতা (Severity)
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as CaseSeverity)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              >
                <option value="mild">স্বল্প (Mild)</option>
                <option value="moderate">মাঝারি (Moderate)</option>
                <option value="severe">গুরুতর (Severe)</option>
                <option value="critical">অত্যন্ত সংকটজনক (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                পর্যবেক্ষণের তারিখ
              </label>
              <input
                type="date"
                required
                value={observedOn}
                onChange={(e) => setObservedOn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              সমস্যার শিরোনাম (Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: আমন ধানে বাদামি ফড়িং ও পাতা পোড়া রোগ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              বিস্তারিত পর্যবেক্ষণ লক্ষণ (Description) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="পাতার ডগা হলুদ হওয়া, শিকড়ে পচন, মাছের ফুলকায় ঘা, সকালবেলায় খাবি খাওয়া ইত্যাদি বিস্তারিত লক্ষণ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
            />
          </div>
        </div>

        {/* Step 3: Prescriptions (Optional during creation) */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs">
                ৩
              </span>
              ওষুধ ও সমাধানের ব্যবস্থাপত্র (Prescription)
            </h2>
            <button
              type="button"
              onClick={handleAddPrescItem}
              className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> আইটেম যোগ করুন
            </button>
          </div>

          {prescItems.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              কোনো ওষুধ বা সমাধান যোগ করা হয়নি। আপনি চাইলে পরে বিস্তারিত পেজ থেকেও যোগ করতে পারেন।
            </p>
          ) : (
            <div className="space-y-4">
              {prescItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-sand/30 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-forest dark:text-leaf">
                      আইটেম #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescItem(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> মুছুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        দোকানের পিওএস পণ্য নির্বাচন করুন
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.packSize || p.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          পরিমাণ (Quantity)
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          একক (Unit)
                        </label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        ব্যবহারের মাত্রা (Dose Instructions)
                      </label>
                      <input
                        type="text"
                        value={item.doseInstructions}
                        onChange={(e) => handleItemChange(idx, 'doseInstructions', e.target.value)}
                        placeholder="যেমন: ১ মিলি প্রতি লিটার জলে গুলে স্প্রে"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        প্রয়োগ পদ্ধতি (Application Method)
                      </label>
                      <select
                        value={item.applicationMethod}
                        onChange={(e) => handleItemChange(idx, 'applicationMethod', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-xs"
                      >
                        <option value="Foliar Spray">পাতায় স্প্রে (Foliar Spray)</option>
                        <option value="Soil Application">মাটিতে প্রয়োগ (Soil Application)</option>
                        <option value="Broadcasting">ছিটানো (Broadcasting)</option>
                        <option value="Water Treatment">জলে দ্রবীভূত (Water Treatment)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notice of Automatic Follow-up */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span>
            <strong>স্বয়ংক্রিয় ফলো-আপ অ্যালার্ট:</strong> কেস সংরক্ষণ করার সাথে সাথে নির্বাচিত সমস্যা ক্যাটাগরি
            অনুযায়ী সিস্টেমে আজকের কল কিউ-তে একটি ফলো-আপ ক্যালেন্ডার এন্ট্রি যুক্ত হবে।
          </span>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/crm/cases"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            বাতিল
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-xs shadow-md disabled:opacity-50"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : 'কেস সংরক্ষণ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">লোড হচ্ছে...</div>}>
      <NewCaseForm />
    </Suspense>
  );
}
