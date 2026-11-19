'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Scale,
} from 'lucide-react';
import { CrmSettings, CaseCategory } from '@/types/crm';

export default function CrmSettingsPage() {
  const [settings, setSettings] = useState<CrmSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/crm/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Fetch settings error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setSavedSuccess(false);

      const res = await fetch('/api/admin/crm/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-gray-400">সেটিংস লোড হচ্ছে...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* ── Top Header ── */}
      <div className="pb-6 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          Config & Agronomic Regional Rules
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          সিআরএম ও জমি পরিমাপ সেটিংস (CRM Settings)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          দক্ষিণ দিনাজপুর অঞ্চলের বিঘা-শতক রূপান্তর মান এবং সমস্যাভিত্তিক স্বয়ংক্রিয় ফলো-আপের সময়কাল।
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Land Area Conversion Settings */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-forest" />
            জমি পরিমাপ রূপান্তর অনুপাত (Area Canonical Conversion)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                ১ বিঘা = কত শতক (Decimal per Bigha)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={settings.bighaToDecimal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bighaToDecimal: parseFloat(e.target.value) || 33,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                পশ্চিমবঙ্গের দক্ষিণ দিনাজপুরে প্রমিত মান ৩৩ শতক। ১ একর = ১০০ শতক স্বয়ংক্রিয়ভাবে ধার্য থাকে।
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                সাধারণ ডিফল্ট ফলো-আপ দিন (Default Days)
              </label>
              <input
                type="number"
                required
                value={settings.defaultFollowupDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultFollowupDays: parseInt(e.target.value) || 7,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                প্রেসক্রিপশন দেওয়ার পর স্বয়ংক্রিয়ভাবে এই সংখ্যক দিনের পর ফলো-আপ শিডিউল হবে।
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Category-Specific Follow-up Schedule */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest" />
            সমস্যা ক্যাটাগরি অনুযায়ী স্বয়ংক্রিয় ফলো-আপ দিন (Days by Category)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(settings.categoryFollowupDays || {}).map(([cat, days]) => (
              <div key={cat}>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 capitalize">
                  {cat.replace('_', ' ')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => {
                      const updated = {
                        ...settings.categoryFollowupDays,
                        [cat]: parseInt(e.target.value) || 7,
                      };
                      setSettings({ ...settings, categoryFollowupDays: updated });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs font-bold"
                  />
                  <span className="text-xs text-gray-500">দিন</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-xs shadow-md disabled:opacity-50"
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস পরিবর্তন নিশ্চিত করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
