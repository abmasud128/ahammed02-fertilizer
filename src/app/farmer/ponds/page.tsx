'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Waves, Plus, CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';

export default function FarmerPondsPage() {
  const { d, isBn } = useAquaLanguage();

  const [ponds, setPonds] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    areaDecimal: '',
    waterDepthFt: '5',
    waterSource: 'rainfed',
    soilType: 'alluvial',
    hasDrainage: false,
    hasAeration: false,
    preparationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Load draft from localStorage if available
  useEffect(() => {
    fetchPonds();
    try {
      const savedDraft = localStorage.getItem('ahammed_aqua_pond_draft');
      if (savedDraft) {
        setFormData(JSON.parse(savedDraft));
      }
    } catch {}
  }, []);

  const fetchPonds = () => {
    fetch('/api/farmer/ponds')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setPonds(data.ponds || []);
        }
      });
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('ahammed_aqua_pond_draft', JSON.stringify(formData));
      setStatusMessage({ type: 'success', text: 'খসড়া সংরক্ষিত হয়েছে (Draft Saved)!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'ড্রাফট সংরক্ষণে সমস্যা হয়েছে' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/ponds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create pond');
      }

      setStatusMessage({ type: 'success', text: 'পুকুর সফলভাবে যুক্ত হয়েছে!' });
      setShowAddForm(false);
      localStorage.removeItem('ahammed_aqua_pond_draft');
      setFormData({
        name: '',
        areaDecimal: '',
        waterDepthFt: '5',
        waterSource: 'rainfed',
        soilType: 'alluvial',
        hasDrainage: false,
        hasAeration: false,
        preparationDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchPonds();
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
            {d.ponds.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.ponds.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : d.ponds.addBtn}</span>
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

      {/* Add Pond Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-lg">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 mb-4 flex items-center gap-2">
            <Waves className="w-4 h-4 text-emerald-600" />
            <span>নতুন পুকুর নিবন্ধন ফর্ম</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.ponds.pondName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: বাড়ির সামনের পুকুর বা বড় দিঘি"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.ponds.areaDecimal} * (১০০ শতক = ১ একর)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step="0.5"
                  value={formData.areaDecimal}
                  onChange={(e) => setFormData({ ...formData, areaDecimal: e.target.value })}
                  placeholder="৫০"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.ponds.depthFt}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.waterDepthFt}
                  onChange={(e) => setFormData({ ...formData, waterDepthFt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.ponds.waterSource}
                </label>
                <select
                  value={formData.waterSource}
                  onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                >
                  <option value="rainfed" className="text-black">{d.ponds.waterSourceOpts.rainfed}</option>
                  <option value="borewell" className="text-black">{d.ponds.waterSourceOpts.borewell}</option>
                  <option value="canal" className="text-black">{d.ponds.waterSourceOpts.canal}</option>
                  <option value="river" className="text-black">{d.ponds.waterSourceOpts.river}</option>
                  <option value="mixed" className="text-black">{d.ponds.waterSourceOpts.mixed}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.ponds.prepDate}
                </label>
                <input
                  type="date"
                  value={formData.preparationDate}
                  onChange={(e) => setFormData({ ...formData, preparationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasDrainage}
                  onChange={(e) => setFormData({ ...formData, hasDrainage: e.target.checked })}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>{d.ponds.drainage}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAeration}
                  onChange={(e) => setFormData({ ...formData, hasAeration: e.target.checked })}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>{d.ponds.aeration}</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? d.common.loading : d.ponds.submitPond}
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{d.ponds.saveDraft}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ponds List */}
      <div className="space-y-3">
        {ponds.map((pond) => (
          <div
            key={pond.id}
            className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                  {pond.name}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {pond.pondCode}
                </span>
              </div>
              <div>
                {pond.verificationStatus === 'verified' ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    যাচাইকৃত
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    পর্যালোচনাধীন
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-gray-400 block">জলকর আয়তন</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200">
                  {pond.areaDecimal} শতক ({Math.round((pond.areaDecimal / 100) * 100) / 100} একর)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">জলের গভীরতা</span>
                <span className="font-bold">{pond.waterDepthFt} ফুট</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">উৎস</span>
                <span className="font-semibold capitalize">{pond.waterSource}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">প্রস্তুতির তারিখ</span>
                <span className="font-semibold">{pond.preparationDate || 'উল্লেখ নেই'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
