'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Anchor, Plus, CheckCircle2, AlertCircle, ShieldCheck, IndianRupee } from 'lucide-react';
import { AquaSpecies } from '@/types/aqua';

export default function FarmerHarvestPage() {
  const { d, isBn } = useAquaLanguage();

  const [harvests, setHarvests] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [species, setSpecies] = useState<AquaSpecies[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productionCycleId: '',
    speciesId: 'spec-rohu',
    harvestDate: new Date().toISOString().split('T')[0],
    harvestType: 'partial',
    totalWeightKg: '',
    pieceCount: '',
    buyerName: 'বালুরঘাট মাছ বাজার',
    pricePerKg: '180',
    totalRevenue: '',
    isEstimated: false,
  });

  useEffect(() => {
    fetchHarvests();
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

  const fetchHarvests = () => {
    fetch('/api/farmer/harvest')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setHarvests(data.records || []);
        }
      });
  };

  const handleWeightOrPriceChange = (weightStr: string, priceStr: string) => {
    const w = parseFloat(weightStr);
    const p = parseFloat(priceStr);
    const rev = !isNaN(w) && !isNaN(p) ? (w * p).toFixed(0) : '';
    setFormData((prev) => ({
      ...prev,
      totalWeightKg: weightStr,
      pricePerKg: priceStr,
      totalRevenue: rev,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record harvest');
      }

      setStatusMessage({ type: 'success', text: d.harvest.successMsg });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        totalWeightKg: '',
        pieceCount: '',
        totalRevenue: '',
        isEstimated: false,
      }));
      fetchHarvests();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const totalHarvestKg = harvests.reduce((sum, h) => sum + (Number(h.totalWeightKg) || 0), 0);
  const totalRevenueRs = harvests.reduce((sum, h) => sum + (Number(h.totalRevenue) || 0), 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.harvest.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.harvest.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? d.common.close : d.harvest.addHarvestBtn}</span>
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

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">মোট আহরিত মাছ</div>
          <div className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">
            {totalHarvestKg.toFixed(1)} <span className="text-xs font-normal">কেজি</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">মোট বাজার মূল্য</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
            ₹{totalRevenueRs.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Add Harvest Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-blue-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <Anchor className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              মাছ আহরণ চালান যুক্ত করুন
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
                {d.stocking.selectSpecies} *
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
                {d.harvest.harvestDate} *
              </label>
              <input
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.harvestType}
              </label>
              <select
                value={formData.harvestType}
                onChange={(e) => setFormData({ ...formData, harvestType: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="partial">{d.harvest.partialHarvest}</option>
                <option value="final">{d.harvest.finalHarvest}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.totalWeightKg} *
              </label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="যেমন: 85 (কেজি)"
                value={formData.totalWeightKg}
                onChange={(e) => handleWeightOrPriceChange(e.target.value, formData.pricePerKg)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.pieceCount}
              </label>
              <input
                type="number"
                placeholder="যেমন: 170 (পিস)"
                value={formData.pieceCount}
                onChange={(e) => setFormData({ ...formData, pieceCount: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.buyerName}
              </label>
              <input
                type="text"
                placeholder="আড়তদার বা ক্রেতার নাম"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.pricePerKg}
              </label>
              <input
                type="number"
                placeholder="যেমন: 190"
                value={formData.pricePerKg}
                onChange={(e) => handleWeightOrPriceChange(formData.totalWeightKg, e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.harvest.totalRevenue} (হিসাবকৃত)
              </label>
              <input
                type="number"
                placeholder="মোট টাকা"
                value={formData.totalRevenue}
                onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 font-mono text-emerald-800 dark:text-emerald-300 font-bold"
              />
            </div>

            <div className="flex items-center pt-2 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isEstimated}
                  onChange={(e) => setFormData({ ...formData, isEstimated: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>আনুমানিক ওজন / হিসেব</span>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md"
            >
              {loading ? d.common.loading : d.common.save}
            </button>
          </div>
        </form>
      )}

      {/* Harvests List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
          {d.harvest.recentHarvests}
        </h2>

        {harvests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <Anchor className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-500">এখনো কোনো মাছ আহরণের রেকর্ড নথিভুক্ত হয়নি।</p>
          </div>
        ) : (
          harvests.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {h.harvestDate}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                    {h.harvestType === 'final' ? 'চূড়ান্ত আহরণ' : 'আংশিক আহরণ'}
                  </span>
                  {h.buyerName && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      • {h.buyerName}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span>মোট ওজন: <strong>{h.totalWeightKg} কেজি</strong></span>
                  {h.pieceCount && <span>({h.pieceCount} পিস)</span>}
                  {h.pricePerKg && <span>• দর: ₹{h.pricePerKg}/কেজি</span>}
                </div>
              </div>

              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {h.totalRevenue ? `₹${Number(h.totalRevenue).toLocaleString('en-IN')}` : '—'}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{h.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
