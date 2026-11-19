'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { PlayCircle, Plus, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function FarmerCyclesPage() {
  const { d, isBn } = useAquaLanguage();

  const [cycles, setCycles] = useState<any[]>([]);
  const [ponds, setPonds] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    pondId: '',
    cycleName: '',
    startDate: new Date().toISOString().split('T')[0],
    targetHarvestDate: '',
    isAuthorizedOverlap: false,
    notes: '',
  });

  useEffect(() => {
    fetchCycles();
    fetch('/api/farmer/ponds')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && data.ponds.length > 0) {
          setPonds(data.ponds);
          setFormData((prev) => ({ ...prev, pondId: data.ponds[0].id }));
        }
      });
  }, []);

  const fetchCycles = () => {
    fetch('/api/farmer/cycles')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setCycles(data.cycles || []);
        }
      });
  };

  const selectedPondHasActiveCycle = cycles.some(
    (c) => c.pondId === formData.pondId && c.status === 'active'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start cycle');
      }

      setStatusMessage({ type: 'success', text: 'নতুন চাষ চক্র সফলভাবে শুরু হয়েছে!' });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        cycleName: '',
        isAuthorizedOverlap: false,
        notes: '',
      }));
      fetchCycles();
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
            {d.cycles.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.cycles.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : d.cycles.startNewCycleBtn}</span>
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

      {/* Start Cycle Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-lg">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 mb-4 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-teal-600" />
            <span>নতুন মাছ চাষ চক্র শুরু করুন</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  পুকুর নির্বাচন করুন *
                </label>
                <select
                  value={formData.pondId}
                  onChange={(e) => setFormData({ ...formData, pondId: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {ponds.map((p) => (
                    <option key={p.id} value={p.id} className="text-black">
                      {p.name} ({p.pondCode} • {p.areaDecimal} শতক)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.cycles.cycleName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cycleName}
                  onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                  placeholder="যেমন: কার্প মিশ্র চাষ ২০২৬-২৭"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.cycles.startDate} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.cycles.targetHarvestDate}
                </label>
                <input
                  type="date"
                  value={formData.targetHarvestDate}
                  onChange={(e) => setFormData({ ...formData, targetHarvestDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Overlap Prevention Guard Warning */}
            {selectedPondHasActiveCycle && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{d.cycles.overlapWarning}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  একটি পুকুরে সাধারণত একসাথে একটিই প্রধান চাষ চক্র থাকে। নার্সারি বা বিশেষ প্রয়োজনে সমান্তরাল চক্র চালাতে হলে নিচের অনুমতি বক্সে টিক দিন।
                </p>
                <label className="flex items-center gap-2 cursor-pointer font-extrabold text-amber-900 dark:text-amber-200 pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isAuthorizedOverlap}
                    onChange={(e) => setFormData({ ...formData, isAuthorizedOverlap: e.target.checked })}
                    className="rounded text-amber-600 w-4 h-4"
                  />
                  <span>{d.cycles.authorizedOverlap}</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {loading ? d.common.loading : 'চাষ চক্র সংরক্ষণ করুন'}
            </button>
          </form>
        </div>
      )}

      {/* Cycles List */}
      <div className="space-y-3">
        {cycles.map((cycle) => {
          const pond = ponds.find((p) => p.id === cycle.pondId);
          return (
            <div
              key={cycle.id}
              className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                    {cycle.cycleName}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                    {cycle.cycleCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    সক্রিয় চক্র (Active)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-gray-400 block">পুকুর</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {pond ? `${pond.name} (${pond.pondCode})` : 'চিহ্নিত পুকুর'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">শুরুর তারিখ</span>
                  <span className="font-bold">{cycle.startDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">সম্ভাব্য আহরণ</span>
                  <span className="font-bold">{cycle.targetHarvestDate || 'নির্দিষ্ট করা নেই'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
