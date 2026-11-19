'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { TrendingUp, Plus, CheckCircle2, AlertCircle, ShieldCheck, Scale } from 'lucide-react';
import { AquaSpecies } from '@/types/aqua';

export default function FarmerGrowthPage() {
  const { d, isBn } = useAquaLanguage();

  const [samples, setSamples] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [species, setSpecies] = useState<AquaSpecies[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productionCycleId: '',
    speciesId: 'spec-rohu',
    sampleDate: new Date().toISOString().split('T')[0],
    sampleCount: '15',
    avgWeightGrams: '',
    avgLengthCm: '',
    isEstimated: false,
  });

  useEffect(() => {
    fetchSamples();
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

  const fetchSamples = () => {
    fetch('/api/farmer/growth')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setSamples(data.records || []);
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record growth sample');
      }

      setStatusMessage({ type: 'success', text: d.growth.successMsg });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        avgWeightGrams: '',
        avgLengthCm: '',
        isEstimated: false,
      }));
      fetchSamples();
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
            {d.growth.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.growth.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? d.common.close : d.growth.addGrowthBtn}</span>
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

      {/* Add Growth Sample Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-emerald-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              নমুনা জালে মাছের ওজন রেকর্ড করুন
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                চাষ চক্র ও পুকুর *
              </label>
              <select
                required
                value={formData.productionCycleId}
                onChange={(e) => setFormData({ ...formData, productionCycleId: e.target.value })}
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
                {d.growth.species} *
              </label>
              <select
                required
                value={formData.speciesId}
                onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameBn} ({s.commonName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.growth.sampleDate} *
              </label>
              <input
                type="date"
                required
                value={formData.sampleDate}
                onChange={(e) => setFormData({ ...formData, sampleDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.growth.sampleCount}
              </label>
              <input
                type="number"
                placeholder="যেমন: 15"
                value={formData.sampleCount}
                onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.growth.avgWeightGrams} *
              </label>
              <input
                type="number"
                step="1"
                required
                placeholder="যেমন: 165 (গ্রাম)"
                value={formData.avgWeightGrams}
                onChange={(e) => setFormData({ ...formData, avgWeightGrams: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.growth.avgLengthCm}
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="যেমন: 22 (সেমি)"
                value={formData.avgLengthCm}
                onChange={(e) => setFormData({ ...formData, avgLengthCm: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div className="flex items-center pt-4 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isEstimated}
                  onChange={(e) => setFormData({ ...formData, isEstimated: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{d.growth.isEstimated}</span>
              </label>
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

      {/* Growth Samples List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
          {d.growth.recentSamples}
        </h2>

        {samples.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-500">এখনো কোনো বৃদ্ধির নমুনা রেকর্ড নেই।</p>
          </div>
        ) : (
          samples.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {s.sampleDate}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    নমুনা: {s.sampleCount} টি মাছ
                  </span>
                  {s.isEstimated && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      আনুমানিক
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span>প্রজাতি: {s.speciesId}</span>
                  {s.avgLengthCm && <span>• দৈর্ঘ্য: {s.avgLengthCm} সেমি</span>}
                </div>

                {s.calculatedAdgGrams && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>দৈনিক বৃদ্ধি (ADG): +{s.calculatedAdgGrams} গ্রাম/দিন</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {s.avgWeightGrams} <span className="text-xs font-normal">গ্রাম</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{s.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
