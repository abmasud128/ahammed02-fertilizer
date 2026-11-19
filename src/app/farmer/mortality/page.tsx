'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Skull, Plus, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { AquaSpecies } from '@/types/aqua';

export default function FarmerMortalityPage() {
  const { d, isBn } = useAquaLanguage();

  const [mortalities, setMortalities] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [species, setSpecies] = useState<AquaSpecies[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productionCycleId: '',
    speciesId: 'spec-rohu',
    eventDate: new Date().toISOString().split('T')[0],
    deadCount: '',
    suspectedCause: 'অক্সিজেনের ঘাটতি / রাতে খাবি খাওয়া',
    isEstimated: false,
  });

  useEffect(() => {
    fetchMortalities();
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

  const fetchMortalities = () => {
    fetch('/api/farmer/mortality')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setMortalities(data.records || []);
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/mortality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record mortality event');
      }

      setStatusMessage({ type: 'success', text: d.mortality.successMsg });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        deadCount: '',
        isEstimated: false,
      }));
      fetchMortalities();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const totalDead = mortalities.reduce((sum, m) => sum + (Number(m.deadCount) || 0), 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.mortality.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.mortality.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? d.common.close : d.mortality.addMortalityBtn}</span>
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

      {/* Total Mortality Metric */}
      <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400">মোট নথিভুক্ত মৃত্যু সংখ্যা</div>
          <div className="text-2xl font-black text-red-700 dark:text-red-400 mt-0.5">
            {totalDead} <span className="text-xs font-normal">টি মাছ</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
          <Skull className="w-6 h-6" />
        </div>
      </div>

      {/* Add Mortality Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-red-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <Skull className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              মাছের মৃত্যুর ঘটনা লিখুন
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
                মাছের প্রজাতি
              </label>
              <select
                value={formData.speciesId}
                onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="">সকল মিশ্র প্রজাতি</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameBn} ({s.commonName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.mortality.eventDate} *
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.mortality.deadCount} *
              </label>
              <input
                type="number"
                required
                placeholder="যেমন: 5"
                value={formData.deadCount}
                onChange={(e) => setFormData({ ...formData, deadCount: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.mortality.suspectedCause}
              </label>
              <select
                value={formData.suspectedCause}
                onChange={(e) => setFormData({ ...formData, suspectedCause: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="অক্সিজেনের ঘাটতি / রাতে খাবি খাওয়া">{d.mortality.causeOxygen}</option>
                <option value="রোগ সংক্রমণ / ঘা">{d.mortality.causeDisease}</option>
                <option value="তলার বিষাক্ত গ্যাস / অ্যামোনিয়া">{d.mortality.causeGas}</option>
                <option value="সাপ, পাখি বা শিকারী প্রাণী">{d.mortality.causePredator}</option>
                <option value="জাল টানার আঘাত / পরিবহণ দুর্বলতা">{d.mortality.causeHandling}</option>
                <option value="অন্যান্য / অজ্ঞাত কারণ">অন্যান্য / অজ্ঞাত কারণ</option>
              </select>
            </div>

            <div className="flex items-center pt-2 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isEstimated}
                  onChange={(e) => setFormData({ ...formData, isEstimated: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>{d.mortality.isEstimated}</span>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 shadow-md"
            >
              {loading ? d.common.loading : d.common.save}
            </button>
          </div>
        </form>
      )}

      {/* Mortalities List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
          {d.mortality.recentMortalities}
        </h2>

        {mortalities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-gray-500">কোনো মৃত্যুর তথ্য নথিভুক্ত নেই।</p>
          </div>
        ) : (
          mortalities.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {m.eventDate}
                  </span>
                  {m.isEstimated && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      আনুমানিক
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300">
                  কারণ: <strong>{m.suspectedCause}</strong>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg sm:text-xl font-black text-red-700 dark:text-red-400">
                  {m.deadCount} <span className="text-xs font-normal">টি</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{m.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
