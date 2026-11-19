'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Utensils, Plus, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { AquaFeedBrand } from '@/types/aqua';

export default function FarmerFeedPage() {
  const { d, isBn } = useAquaLanguage();

  const [feedLogs, setFeedLogs] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [feedBrands, setFeedBrands] = useState<AquaFeedBrand[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productionCycleId: '',
    feedBrandId: 'feed-cp-grower',
    feedDate: new Date().toISOString().split('T')[0],
    feedingTime: 'সকাল (Morning)',
    quantityKg: '',
    feedingMethod: 'হাতে ছিটানো (Broadcast)',
    weatherCondition: 'রৌদ্রোজ্জ্বল (Sunny)',
    isEstimated: false,
  });

  useEffect(() => {
    fetchFeedLogs();
    fetch('/api/farmer/cycles')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && data.cycles.length > 0) {
          setCycles(data.cycles);
          setFormData((prev) => ({ ...prev, productionCycleId: data.cycles[0].id }));
        }
      });
  }, []);

  const fetchFeedLogs = () => {
    fetch('/api/farmer/feed')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setFeedLogs(data.records || []);
          if (data.brands) setFeedBrands(data.brands);
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/farmer/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record feed');
      }

      setStatusMessage({ type: 'success', text: d.feed.successMsg });
      setShowAddForm(false);
      setFormData((prev) => ({
        ...prev,
        quantityKg: '',
        isEstimated: false,
      }));
      fetchFeedLogs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotalKg = feedLogs
    .filter((f) => f.feedDate === todayStr)
    .reduce((sum, f) => sum + (Number(f.quantityKg) || 0), 0);

  const totalLogsKg = feedLogs.reduce((sum, f) => sum + (Number(f.quantityKg) || 0), 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.feed.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.feed.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? d.common.close : d.feed.addFeedBtn}</span>
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

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            {d.feed.todayFed}
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
            {todayTotalKg.toFixed(1)} <span className="text-xs font-normal">কেজি</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            মোট নথিভুক্ত খাদ্য
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
            {totalLogsKg.toFixed(1)} <span className="text-xs font-normal">কেজি</span>
          </div>
        </div>
      </div>

      {/* Add Feed Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border-2 border-emerald-500/30 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-900/40 pb-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              নতুন খাদ্য প্রয়োগ রেকর্ড
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
                {d.feed.feedBrand}
              </label>
              <select
                value={formData.feedBrandId}
                onChange={(e) => setFormData({ ...formData, feedBrandId: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                {feedBrands.length > 0 ? (
                  feedBrands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.brandName} ({b.proteinPercentage}% প্রোটিন)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="feed-cp-grower">CP Aqua Classic 28/3 (ভাসমান)</option>
                    <option value="feed-godrej-aqua">Godrej Aquafeed Carpo 26</option>
                    <option value="feed-local-mash">খৈল + চালের কুঁড়া মিশ্রণ (১:১)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.feed.feedDate} *
              </label>
              <input
                type="date"
                required
                value={formData.feedDate}
                onChange={(e) => setFormData({ ...formData, feedDate: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.feed.feedingTime}
              </label>
              <select
                value={formData.feedingTime}
                onChange={(e) => setFormData({ ...formData, feedingTime: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="সকাল (Morning)">সকাল (Morning)</option>
                <option value="দুপুর (Noon)">দুপুর (Noon)</option>
                <option value="বিকাল (Afternoon)">বিকাল (Afternoon)</option>
                <option value="সন্ধ্যা (Evening)">সন্ধ্যা (Evening)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.feed.quantityKg} *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="যেমন: 12.5"
                value={formData.quantityKg}
                onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.feed.feedingMethod}
              </label>
              <select
                value={formData.feedingMethod}
                onChange={(e) => setFormData({ ...formData, feedingMethod: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="হাতে ছিটানো (Broadcast)">হাতে ছিটানো (Broadcast)</option>
                <option value="চেক ট্রে / ফিডিং ট্রে">চেক ট্রে / ফিডিং ট্রে</option>
                <option value="অটো ফিডার (Auto Feeder)">অটো ফিডার (Auto Feeder)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.feed.weatherCondition}
              </label>
              <select
                value={formData.weatherCondition}
                onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60"
              >
                <option value="রৌদ্রোজ্জ্বল (Sunny)">রৌদ্রোজ্জ্বল (Sunny)</option>
                <option value="মেঘলা (Cloudy)">মেঘলা (Cloudy)</option>
                <option value="বৃষ্টি (Rainy)">বৃষ্টি (Rainy)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isEstimated}
                  onChange={(e) => setFormData({ ...formData, isEstimated: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{d.feed.isEstimated}</span>
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

      {/* Feed Logs List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
          {d.feed.recentFeedLogs}
        </h2>

        {feedLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-500">এখনো কোনো খাদ্য প্রয়োগ রেকর্ড নেই।</p>
          </div>
        ) : (
          feedLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {log.feedDate}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    {log.feedingTime || 'সকাল'}
                  </span>
                  {log.isEstimated && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      আনুমানিক
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span>পদ্ধতি: {log.feedingMethod}</span>
                  <span>•</span>
                  <span>আবহাওয়া: {log.weatherCondition}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {log.quantityKg} <span className="text-xs font-normal">কেজি</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{log.verificationStatus === 'verified' ? 'যাচাইকৃত' : 'পর্যালোচনাধীন'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
