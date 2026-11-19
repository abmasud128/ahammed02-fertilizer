'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MapPin,
  Phone,
  Sprout,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  Receipt,
  FileText,
} from 'lucide-react';
import { CustomerRecord } from '@/types/admin';

export default function CrmCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [plotsMap, setPlotsMap] = useState<Record<string, number>>({});
  const [casesMap, setCasesMap] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing POS customers
    Promise.all([
      fetch('/api/admin/customers').then((r) => r.json()),
      fetch('/api/admin/crm/plots').then((r) => r.json()),
      fetch('/api/admin/crm/cases').then((r) => r.json()),
    ])
      .then(([custData, plotsData, casesData]) => {
        if (custData.success && custData.customers) {
          setCustomers(custData.customers);
        }

        // Count plots per customer
        if (plotsData.success && plotsData.plots) {
          const pCounts: Record<string, number> = {};
          for (const p of plotsData.plots) {
            pCounts[p.customerId] = (pCounts[p.customerId] || 0) + 1;
          }
          setPlotsMap(pCounts);
        }

        // Count cases per customer
        if (casesData.success && casesData.cases) {
          const cCounts: Record<string, number> = {};
          for (const c of casesData.cases) {
            cCounts[c.customerId] = (cCounts[c.customerId] || 0) + 1;
          }
          setCasesMap(cCounts);
        }
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.village && c.village.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Farmer Profiles & Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            কৃষক তালিকা ও ডসিয়ার (Customer Profiles)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            পিওএস গ্রাহকদের খামার বিবরণ, চাষের জমি, রোগ নির্ণয় ও কেনাকাটার পূর্ণাঙ্গ ডসিয়ার।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/crm/cases/new"
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন কেস লিখুন
          </Link>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="কৃষকের নাম, মোবাইল বা গ্রাম দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#082218] text-sm focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </div>

      {/* ── Customers Directory Table / Cards ── */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400">কোনো কৃষক পাওয়া যায়নি।</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((customer) => {
            const plotCount = plotsMap[customer.id] || 0;
            const caseCount = casesMap[customer.id] || 0;

            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-forest dark:text-leaf shrink-0" />
                        {customer.village || 'গ্রামের নাম দেওয়া নেই'}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf">
                      {customer.phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                    <div className="p-2.5 rounded-xl bg-sand/30 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-gray-500 block">জমি ও পুকুর</span>
                      <span className="text-sm font-bold text-forest dark:text-leaf">
                        {plotCount} টি প্লট
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sand/30 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-gray-500 block">সমস্যার কেস</span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {caseCount} টি কেস
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-xs text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1 hover:text-forest"
                  >
                    <Phone className="w-3.5 h-3.5 text-forest" /> কল করুন
                  </a>

                  <Link
                    href={`/admin/crm/customers/${customer.id}`}
                    className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    পূর্ণাঙ্গ ডসিয়ার <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
