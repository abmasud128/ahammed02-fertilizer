'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Layers, Plus, CheckCircle2, AlertCircle, Fish } from 'lucide-react';
import { AquaSpecies } from '@/types/aqua';

export default function FarmerStockingPage() {
  const { d, isBn } = useAquaLanguage();

  const [stocking, setStocking] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [species, setSpecies] = useState<AquaSpecies[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productionCycleId: '',
    speciesId: 'spec-rohu',
    stockingDate: new Date().toISOString().split('T')[0],
    seedStage: 'fingerling',
    fryCount: '',
    avgWeightGrams: '35',
    supplierName: '',
    totalCost: '',
    isEstimated: false,
    notes: '',
  });

  useEffect(() => {
    fetchStocking();
    fetch('/api/farmer/cycles')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && data.cycles.length > 0) {
          setCycles(data.cycles);
          setFormData((prev) => ({ ...prev, productionCycleId: data.cycles[0].id }));
        }
      });

    fetch('/api/farmer/geo')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setSpecies(data.species || []);
        }
      });
  }, []);

  const fetchStocking = () => {
    fetch('/api/farmer/stocking')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setStocking(data.records || []);
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/stocking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record stocking');
      }

      setStatusMessage({ type: 'success', text: d.stocking.stockingSuccess });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        fryCount: '',
        supplierName: '',
        totalCost: '',
        isEstimated: false,
        notes: '',
      }));
      fetchStocking();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.stocking.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.stocking.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : '+ মাছ মজুদ করুন'}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Stocking Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-lg">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 mb-4 flex items-center gap-2">
            <Fish className="w-4 h-4 text-amber-600" />
            <span>নতুন মাছ মজুদ (Fish Stocking) এন্ট্রি</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.selectCycle} *
                </label>
                <select
                  value={formData.productionCycleId}
                  onChange={(e) => setFormData({ ...formData, productionCycleId: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.cycleName} ({c.cycleCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.selectSpecies} *
                </label>
                <select
                  value={formData.speciesId}
                  onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {species.map((s) => (
                    <option key={s.id} value={s.id} className="text-black">
                      {s.nameBn} ({s.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.stockingDate} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.stockingDate}
                  onChange={(e) => setFormData({ ...formData, stockingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.fryCount} *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.fryCount}
                  onChange={(e) => setFormData({ ...formData, fryCount: e.target.value })}
                  placeholder="যেমন: ১০০০"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.avgWeightGrams} *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step="0.5"
                  value={formData.avgWeightGrams}
                  onChange={(e) => setFormData({ ...formData, avgWeightGrams: e.target.value })}
                  placeholder="৩৫"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.supplierName}
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="যেমন: বালুরঘাট সরকারি মৎস্য হ্যাচারি"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.stocking.totalCost}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                  placeholder="২৫০০"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                />
              </div>
            </div>

            {/* Estimated Flag */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isEstimated}
                  onChange={(e) => setFormData({ ...formData, isEstimated: e.target.checked })}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <span>{d.stocking.isEstimated}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {loading ? d.common.loading : d.stocking.submitBtn}
            </button>
          </form>
        </div>
      )}

      {/* Stocking Records List */}
      <div className="space-y-3">
        {stocking.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                  {item.speciesName || item.speciesId}
                </span>
                {item.isEstimated && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    আনুমানিক গণনা
                  </span>
                )}
              </div>
              <div>
                {item.verificationStatus === 'verified' ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    যাচাইকৃত (Verified)
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    পর্যালোচনাধীন
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-gray-400 block">সংখ্যা</span>
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                  {item.fryCount} টি
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">গড় ওজন</span>
                <span className="font-bold">{item.avgWeightGrams} গ্রাম</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">মোট খরচ</span>
                <span className="font-bold">₹{item.totalCost}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">তারিখ</span>
                <span className="font-semibold">{item.stockingDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
