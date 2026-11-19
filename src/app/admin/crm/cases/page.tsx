'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  PlusCircle,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  ArrowRight,
  Droplets,
  Sprout,
  Activity,
} from 'lucide-react';
import { CrmCase, CaseCategory, CaseStatus, CaseSeverity } from '@/types/crm';

export default function CrmCasesListPage() {
  const [cases, setCases] = useState<CrmCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/crm/cases')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.cases) {
          setCases(data.cases);
        }
      })
      .catch((err) => console.error('Fetch cases error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerVillage?.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            Diagnostic Registry & Solutions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            রোগ ও সমস্যার কেস রেজিস্ট্রি (Farm Cases)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            ফসলের পোকা-মাকড়, ছত্রাক ও পুকুরের জলের সমস্যার বিস্তারিত রোগ নির্ণয় ও সমাধান।
          </p>
        </div>

        <Link
          href="/admin/crm/cases/new"
          className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-bold shadow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন সমস্যা কেস লিখুন
        </Link>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কেস নম্বর, শিরোনাম বা কৃষকের নাম..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#082218] text-xs focus:outline-none focus:ring-2 focus:ring-forest"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#082218] text-xs focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="all">সকল ধরন (All Categories)</option>
            <option value="crop_disease">ফসলের রোগ (Crop Disease)</option>
            <option value="pest">পোকামাকড় (Pest)</option>
            <option value="nutrient_deficiency">পুষ্টির অভাব (Nutrient Deficiency)</option>
            <option value="soil">মাটির সমস্যা (Soil)</option>
            <option value="pond_water_toxicity">পুকুরের জলের বিষাক্ততা (Pond Toxicity)</option>
            <option value="fish_disease">মাছের রোগ (Fish Disease)</option>
            <option value="fish_growth">মাছের বৃদ্ধি সমস্যা (Fish Growth)</option>
            <option value="other">অন্যান্য (Other)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#082218] text-xs focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="all">সকল স্ট্যাটাস (All Status)</option>
            <option value="open">ওপেন (Open)</option>
            <option value="treated">চিকিৎসা চলছে (Treated)</option>
            <option value="follow_up_due">ফলো-আপ বাকী (Follow-up Due)</option>
            <option value="resolved">সমাধান হয়েছে (Resolved)</option>
            <option value="failed">ব্যর্থ / বাড়েনি (Failed)</option>
            <option value="closed">বন্ধ (Closed)</option>
          </select>
        </div>
      </div>

      {/* ── Cases List ── */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white dark:bg-[#082218] rounded-2xl border border-gray-200 dark:border-white/10">
          কোনো কেস পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
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
                    {c.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf">
                    {c.category.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                    c.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'follow_up_due'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {c.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>
                    কৃষক: <strong className="text-gray-700 dark:text-gray-300">{c.customerName}</strong> ({c.customerVillage})
                  </span>
                  <span>•</span>
                  <span>প্লট: {c.plotName}</span>
                  {c.cultivationName && (
                    <>
                      <span>•</span>
                      <span>চাষ: {c.cultivationName}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>পর্যবেক্ষণ: {c.observedOn}</span>
                </p>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 bg-sand/30 dark:bg-white/5 p-3 rounded-xl line-clamp-2">
                {c.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                <span className="text-[11px] text-gray-400">
                  ব্যবস্থাপত্র আইটেম: {c.prescriptions?.[0]?.items?.length ?? 0} টি
                </span>

                <Link
                  href={`/admin/crm/cases/${c.id}`}
                  className="text-xs text-forest dark:text-leaf font-bold hover:underline flex items-center gap-1"
                >
                  বিস্তারিত ও টাইমলাইন <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
