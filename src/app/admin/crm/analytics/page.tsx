'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ProductEfficacyMetric } from '@/types/crm';

export default function CrmAnalyticsPage() {
  const [efficacy, setEfficacy] = useState<ProductEfficacyMetric[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/crm/analytics')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEfficacy(data.efficacy || []);
          setCategories(data.casesByCategory || {});
          setDisclaimer(data.disclaimer || '');
        }
      })
      .catch((err) => console.error('Fetch analytics error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="pb-6 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Evidence-Based Agronomy & Efficacy
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          ওষুধের কার্যকারিতা ও ফলাফল বিশ্লেষণ (Product Efficacy)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          দোকানের ব্যবস্থাপত্র ও কৃষকের বাস্তব ফলো-আপের ভিত্তিতে কোন ওষুধটি কোন সমস্যায় কাজ করছে তার বৈজ্ঞানিক বিশ্লেষণ।
        </p>
      </div>

      {/* ── Scientific Integrity & Statistical Rule Alert Banner ── */}
      <div className="p-5 rounded-3xl bg-forest/5 dark:bg-forest/20 border border-forest/20 text-xs text-charcoal dark:text-gray-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-forest dark:text-leaf text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          পরিসংখ্যানগত সততা ও বৈজ্ঞানিক মানদণ্ড (Statistical Honesty Standards)
        </div>
        <p className="leading-relaxed">
          <strong>নিয়ম ১ (নমুনার আকার):</strong> কোনো পণ্যের সাফল্যের হার (Success Rate %) তখনই হিসাব করা হয় যখন
          কমপক্ষে ৫টি স্বতন্ত্র কেসে (N &ge; 5) ওষুধটি ব্যবহৃত হয়েছে এবং ফলাফল যাচাই করা হয়েছে। ৫টির কম কেস হলে
          ভ্রান্ত ধারণা এড়াতে শতাংশের বদলে &quot;নমুনার আকার অপ্রতুল&quot; দেখানো হয়।
        </p>
        <p className="leading-relaxed">
          <strong>নিয়ম ২ (কার্যকারণ বনাম সহসম্পর্ক):</strong> সমস্ত ফলাফল কৃষকদের বাস্তব অভিজ্ঞতার সাথে
          &quot;যুক্ত (associated with)&quot; হিসেবে বর্ণিত; এটি কোনো ল্যাবরেটরি ক্লিনিকাল প্রমাণপত্র নয়।
        </p>
      </div>

      {/* ── Product Efficacy Table ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest" />
            পণ্যভিত্তিক ফলাফল পর্যবেক্ষণ সারণী (Observed Outcomes)
          </h2>
          <span className="text-xs text-gray-400">মোট পর্যবেক্ষণাধীন পণ্য: {efficacy.length} টি</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">বিশ্লেষণ লোড হচ্ছে...</div>
        ) : efficacy.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            পর্যাপ্ত প্রেসক্রিপশন ডেটা এখনও জমা হয়নি। কেস ও ফলো-আপ যুক্ত হলে চার্ট আপডেট হবে।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-3">পণ্যের নাম</th>
                  <th className="py-3 px-3">ক্যাটাগরি</th>
                  <th className="py-3 px-3 text-center">ব্যবস্থাপত্র সংখ্যা</th>
                  <th className="py-3 px-3 text-center">কেস সংখ্যা (N)</th>
                  <th className="py-3 px-3 text-center">ফলাফল (সমাধান / উন্নতি / অপরিবর্তিত / খারাপ)</th>
                  <th className="py-3 px-3 text-right">সাফল্যের হার (Success %)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {efficacy.map((p, idx) => (
                  <tr key={idx} className="hover:bg-sand/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-gray-900 dark:text-white">
                      {p.productName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf">
                        {p.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold">{p.timesPrescribed} বার</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-forest dark:text-leaf">
                        {p.casesCount} টি
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px]">
                        <span className="text-emerald-700 font-bold" title="Resolved">
                          ✓ {p.outcomes.resolved}
                        </span>
                        <span>•</span>
                        <span className="text-blue-600 font-bold" title="Improved">
                          ↗ {p.outcomes.improved}
                        </span>
                        <span>•</span>
                        <span className="text-gray-500 font-bold" title="No Change">
                          = {p.outcomes.noChange}
                        </span>
                        <span>•</span>
                        <span className="text-rose-600 font-bold" title="Worse">
                          ✗ {p.outcomes.worse}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {p.successRate !== null ? (
                        <div className="inline-block text-right">
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                            {p.successRate}%
                          </span>
                          <span className="block text-[9px] text-gray-400">যুক্ত ফলাফল</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md font-medium">
                          {p.sampleSizeLabel}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Problem Frequency Distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            চলমান সমস্যার শ্রেণি বিভাজন (Active Issues Breakdown)
          </h3>

          <div className="space-y-3">
            {Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize font-semibold text-gray-700 dark:text-gray-300">
                    {cat.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-forest dark:text-leaf">{count} টি কেস</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-forest h-full rounded-full"
                    style={{ width: `${Math.min(100, count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agronomic Best Routines */}
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest dark:text-leaf" />
            দক্ষিণ দিনাজপুরের জন্য সেরা পরীক্ষিত রুটিন
          </h3>

          <div className="space-y-3 text-xs text-charcoal/80 dark:text-gray-300">
            <div className="p-3.5 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10">
              <span className="font-bold text-forest dark:text-leaf block mb-1">
                আমন ধানের ব্যাক্টেরিয়াল পাতা পোড়া:
              </span>
              ইউরিয়া সার সাময়িক বন্ধ রেখে ক্রেসোক্সিম-মিথাইল (Tata Ergon) স্প্রে দ্রুত রোগ বিস্তার থামায়।
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10">
              <span className="font-bold text-cyan-700 dark:text-cyan-400 block mb-1">
                পুকুরে অ্যামোনিয়া ও সকালে মাছ খাবি খাওয়া:
              </span>
              অবিলম্বে ২৫-৩০ কেজি জিওলাইট প্রয়োগ এবং বোরিং জলের হালকা সরবরাহ অ্যামোনিয়ার বিষাক্ততা দ্রুত প্রশমিত করে।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
