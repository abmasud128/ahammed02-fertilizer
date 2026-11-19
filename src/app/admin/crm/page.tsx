'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  PhoneCall,
  ClipboardList,
  FlaskConical,
  Sprout,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  PlusCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { CrmCase, CrmFollowup } from '@/types/crm';

export default function CrmDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/crm/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
        }
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Top Header & Quick Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            Customer Care & Farm Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            সিআরএম ও কৃষক পরামর্শ হাব (Farm Intelligence)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            দক্ষিণ দিনাজপুরের কৃষকদের জমি, সমস্যা, প্রেসক্রিপশন ও ফলো-আপ ট্র্যাকিং।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/crm/cases/new"
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন কেস লিখুন (New Case)
          </Link>
          <Link
            href="/admin/crm/followups"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            আজকের কল ({metrics?.dueCallsCount ?? 0})
          </Link>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Today's Due Calls */}
        <Link
          href="/admin/crm/followups"
          className="rounded-2xl p-5 bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              আজকের ফলো-আপ কল
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {metrics?.dueCallsCount ?? 0}
            </span>
            <span className="text-xs text-gray-500">কল বকেয়া</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 group-hover:text-forest transition-colors">
            কল করতে ক্লিক করুন <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 2: Active Problem Cases */}
        <Link
          href="/admin/crm/cases"
          className="rounded-2xl p-5 bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              চলমান সমস্যা কেস
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {metrics?.activeCasesCount ?? 0}
            </span>
            <span className="text-xs text-gray-500">অমীমাংসিত</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 group-hover:text-forest transition-colors">
            সব কেস দেখুন <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 3: Pending Lab Tests */}
        <Link
          href="/admin/crm/tests"
          className="rounded-2xl p-5 bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              মাটি ও জল টেস্ট
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {metrics?.pendingTestsCount ?? 0}
            </span>
            <span className="text-xs text-gray-500">ল্যাবে প্রক্রিয়াধীন</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 group-hover:text-forest transition-colors">
            টেস্ট রিকোয়েস্ট ও রিপোর্ট <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 4: Registered Plots & Cultivations */}
        <Link
          href="/admin/crm/customers"
          className="rounded-2xl p-5 bg-white dark:bg-[#082218] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              নিবন্ধিত জমি ও পুকুর
            </span>
            <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest dark:text-leaf flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest dark:text-leaf">
              {metrics?.totalPlots ?? 0}
            </span>
            <span className="text-xs text-gray-500">
              ({metrics?.totalCultivations ?? 0} টি চাষ)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 group-hover:text-forest transition-colors">
            কৃষক প্রোফাইল ব্রাউজ করুন <ArrowRight className="w-3 h-3" />
          </p>
        </Link>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
        <Link
          href="/admin/crm"
          className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-sm"
        >
          ওভারভিউ (Hub)
        </Link>
        <Link
          href="/admin/crm/customers"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          কৃষক ডসিয়ার (Farmer Profiles)
        </Link>
        <Link
          href="/admin/crm/cases"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          সমস্যা ও প্রেসক্রিপশন (Cases)
        </Link>
        <Link
          href="/admin/crm/followups"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          আজকের ফলো-আপ কল (Calls)
        </Link>
        <Link
          href="/admin/crm/tests"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          মাটি ও জল পরীক্ষা (Lab Tests)
        </Link>
        <Link
          href="/admin/crm/analytics"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          ওষুধের কার্যকারিতা (Efficacy)
        </Link>
        <Link
          href="/admin/crm/settings"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-forest/10 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
        >
          বিঘা সেটিংস (Settings)
        </Link>
      </div>

      {/* ── Two-Column Operational Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Diagnostic Cases & Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Cases */}
          <div className="bg-white dark:bg-[#082218] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-forest" />
                সাম্প্রতিক সমস্যা ও প্রেসক্রিপশন (Recent Cases)
              </h2>
              <Link
                href="/admin/crm/cases"
                className="text-xs text-forest dark:text-leaf font-bold hover:underline"
              >
                সব দেখুন &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
            ) : !metrics?.recentCases || metrics.recentCases.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">কোনো কেস পাওয়া যায়নি।</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {metrics.recentCases.map((c: CrmCase) => (
                  <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-forest dark:text-leaf">
                          {c.caseNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : c.severity === 'severe'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.severity}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                          {c.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        কৃষক: <span className="font-medium">{c.customerName}</span> ({c.customerVillage}) • জমি: {c.plotName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.status === 'follow_up_due'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {c.status}
                      </span>
                      <div className="mt-2">
                        <Link
                          href={`/admin/crm/cases/${c.id}`}
                          className="text-xs text-forest dark:text-leaf font-bold hover:underline"
                        >
                          বিস্তারিত
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Calls Priority Queue */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#082218] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-500" />
                জরুরি কল কিউ (Due Calls)
              </h2>
              <Link
                href="/admin/crm/followups"
                className="text-xs text-amber-600 font-bold hover:underline"
              >
                সব কল &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
            ) : !metrics?.todayFollowups || metrics.todayFollowups.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-80" />
                আজকের কোনো বকেয়া কল নেই!
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.todayFollowups.map((f: CrmFollowup) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-sand/30 dark:bg-white/5 border border-forest/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {f.customerName}
                      </p>
                      <p className="text-[11px] text-gray-500">{f.customerVillage} • {f.customerMobile}</p>
                      <span className="inline-block mt-1 text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        Due: {f.dueDate}
                      </span>
                    </div>

                    <a
                      href={`tel:${f.customerMobile}`}
                      className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest/90 shadow shrink-0"
                      title="কল করুন"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl p-5 bg-forest/5 dark:bg-white/5 border border-forest/15">
            <h3 className="text-xs font-bold text-forest dark:text-leaf uppercase tracking-wider mb-2">
              💡 পরামর্শ টিপস
            </h3>
            <p className="text-xs text-charcoal/70 dark:text-gray-300 leading-relaxed">
              প্রেসক্রিপশন দেওয়ার সাথে সাথেই সিস্টেম স্বয়ংক্রিয়ভাবে ফলো-আপের তারিখ তৈরি করে। কৃষকের ফলাফল অনুযায়ী
              কেস স্ট্যাটাস আপডেট করুন যাতে ওষুধের সঠিক কার্যকারিতা রিপোর্ট পাওয়া যায়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
