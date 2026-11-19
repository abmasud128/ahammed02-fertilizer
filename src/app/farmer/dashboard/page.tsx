'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import {
  Waves,
  Layers,
  PlayCircle,
  PlusCircle,
  Fish,
  ShieldCheck,
  Clock,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function FarmerDashboardPage() {
  const { d, isBn } = useAquaLanguage();

  const [farmer, setFarmer] = useState<any>(null);
  const [ponds, setPonds] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [stocking, setStocking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/farmer/auth/me').then((r) => r.json()),
      fetch('/api/farmer/ponds').then((r) => r.json()),
      fetch('/api/farmer/cycles').then((r) => r.json()),
      fetch('/api/farmer/stocking').then((r) => r.json()),
    ])
      .then(([meData, pondsData, cyclesData, stockingData]) => {
        if (meData && meData.authenticated) setFarmer(meData.farmer);
        if (pondsData && pondsData.success) setPonds(pondsData.ponds || []);
        if (cyclesData && cyclesData.success) setCycles(cyclesData.cycles || []);
        if (stockingData && stockingData.success) setStocking(stockingData.records || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAreaDecimal = ponds.reduce((sum, p) => sum + (Number(p.areaDecimal) || 0), 0);
  const totalAreaAcre = Math.round((totalAreaDecimal / 100) * 100) / 100;
  const activeCycles = cycles.filter((c) => c.status === 'active');

  return (
    <div className="space-y-4 pb-12">
      {/* Welcome & ID Banner */}
      <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <h1 className="text-lg sm:text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
                {d.dashboard.welcome} {farmer?.fullName || 'চাষী বন্ধু'}
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {farmer?.villageName || 'দক্ষিণ দিনাজপুর'} • {d.dashboard.regNo}{' '}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {farmer?.registrationNumber || 'FARMER-2026-XXXX'}
              </span>
            </p>
          </div>

          <div>
            {farmer?.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{d.dashboard.verifiedBadge}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{d.dashboard.pendingBadge}</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block truncate">
              {d.dashboard.ponds}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {ponds.length}
              </span>
              <span className="text-xs text-gray-400">টি</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block truncate">
              {d.dashboard.waterArea}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {totalAreaDecimal}
              </span>
              <span className="text-xs text-gray-400">শতক ({totalAreaAcre} একর)</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block truncate">
              {d.dashboard.activeCycles}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {activeCycles.length}
              </span>
              <span className="text-xs text-gray-400">টি পুকুরে</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block truncate">
              {d.dashboard.speciesStocked}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {stocking.length}
              </span>
              <span className="text-xs text-gray-400">মজুদ রেকর্ড</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Big Mobile Tap Targets) */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
          {d.dashboard.quickActions}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/farmer/ponds"
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <Waves className="w-6 h-6" />
              <div>
                <span className="font-extrabold text-sm block">{d.dashboard.addNewPond}</span>
                <span className="text-[11px] text-emerald-100">আয়তন ও জলের গভীরতা</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </Link>

          <Link
            href="/farmer/cycles"
            className="flex items-center justify-between p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="w-6 h-6" />
              <div>
                <span className="font-extrabold text-sm block">{d.dashboard.startNewCycle}</span>
                <span className="text-[11px] text-teal-100">নতুন মরসুম বা ব্যাচ</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-teal-200" />
          </Link>

          <Link
            href="/farmer/stocking"
            className="flex items-center justify-between p-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6" />
              <div>
                <span className="font-extrabold text-sm block">{d.dashboard.addStocking}</span>
                <span className="text-[11px] text-amber-100">রুই, কাতলা, মৃগেল পোনা</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-200" />
          </Link>
        </div>
      </div>

      {/* Ponds Overview List */}
      <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            {d.ponds.title} ({ponds.length})
          </h2>
          <Link
            href="/farmer/ponds"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            সকল পুকুর দেখুন →
          </Link>
        </div>

        {ponds.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            {d.dashboard.noRecordsYet}
          </div>
        ) : (
          <div className="space-y-2">
            {ponds.map((pond) => (
              <div
                key={pond.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {pond.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {pond.pondCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    আয়তন: <span className="font-bold">{pond.areaDecimal} শতক</span> • জলের গভীরতা:{' '}
                    <span className="font-bold">{pond.waterDepthFt} ফুট</span>
                  </p>
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
            ))}
          </div>
        )}
      </div>

      {/* Recent Stocking Records */}
      <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            সাম্প্রতিক মাছ মজুদ (Fish Stocking)
          </h2>
          <Link
            href="/farmer/stocking"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + নতুন মজুদ রেকর্ড →
          </Link>
        </div>

        {stocking.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            এখনো কোনো মাছ মজুদের তথ্য নেই।
          </div>
        ) : (
          <div className="space-y-2">
            {stocking.map((stk) => (
              <div
                key={stk.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-100">
                      {stk.speciesName || stk.speciesId}
                    </span>
                    {stk.isEstimated && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        আনুমানিক
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    সংখ্যা: <span className="font-bold text-gray-800 dark:text-gray-200">{stk.fryCount} টি</span> • গড় ওজন:{' '}
                    <span className="font-bold text-gray-800 dark:text-gray-200">{stk.avgWeightGrams} গ্রাম</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">
                    ₹{stk.totalCost}
                  </span>
                  <span className="text-[10px] text-gray-400">{stk.stockingDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operational Modules Quick Access Grid */}
      <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            মাছ চাষের দৈনিক ও উৎপাদন ব্যবস্থাপনা
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            ১০টি মডিউল সক্রিয়
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <Link
            href="/farmer/feed"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">🥣</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-emerald-700">
              খাদ্য প্রয়োগ
            </div>
            <div className="text-[10px] text-gray-500">দৈনিক ফিডিং খাতা</div>
          </Link>

          <Link
            href="/farmer/water-quality"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">💧</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-cyan-700">
              পানির গুণমান
            </div>
            <div className="text-[10px] text-gray-500">DO, pH, অ্যামোনিয়া</div>
          </Link>

          <Link
            href="/farmer/problems"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">⚠️</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-amber-700">
              রোগ ও সমস্যা
            </div>
            <div className="text-[10px] text-gray-500">লক্ষণ ও রিপোর্ট</div>
          </Link>

          <Link
            href="/farmer/treatment"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">🩺</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-teal-700">
              ওষুধ ও চিকিৎসা
            </div>
            <div className="text-[10px] text-gray-500">চুন, ওষুধ ও পরিচর্যা</div>
          </Link>

          <Link
            href="/farmer/growth"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">📈</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-emerald-700">
              মাছের বৃদ্ধি
            </div>
            <div className="text-[10px] text-gray-500">নমুনা ওজন ও বৃদ্ধি হার</div>
          </Link>

          <Link
            href="/farmer/mortality"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">💀</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-red-700">
              মাছের মৃত্যু
            </div>
            <div className="text-[10px] text-gray-500">দৈনিক মৃত্যুর হিসাব</div>
          </Link>

          <Link
            href="/farmer/harvest"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">⚓</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-blue-700">
              মাছ আহরণ
            </div>
            <div className="text-[10px] text-gray-500">আংশিক ও চূড়ান্ত আহরণ</div>
          </Link>

          <Link
            href="/farmer/accounts"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200/60 dark:border-white/5 transition-all group"
          >
            <div className="text-lg">💰</div>
            <div className="text-xs font-black text-gray-900 dark:text-white mt-1 group-hover:text-emerald-700">
              বিক্রয় ও হিসাব
            </div>
            <div className="text-[10px] text-gray-500">লাভ-ক্ষতি ও খাতা</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
