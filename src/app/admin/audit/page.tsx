'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  Search,
  Calendar,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AuditLogRecord } from '@/types/admin';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.userEmail.toLowerCase().includes(q) ||
      (l.entityType && l.entityType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <History className="w-7 h-7 text-leaf" />
            <span>Security Audit Log (নিরাপত্তা ও অডিট লগ)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Immutable audit trail of important shop operations (logins, price edits, stock adjustments, bill cancellations).
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Shield className="w-4 h-4 text-leaf" />
          <span>Tamper-Resistant Audit Trail</span>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action (e.g. bill_cancelled, stock_adjusted), user email, entity..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none font-medium"
          />
        </div>
      </div>

      {/* ── Logs Table ── */}
      <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Entity Type</th>
                <th className="py-3 px-4 font-bold">Actor (User)</th>
                <th className="py-3 px-4 font-bold">Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 capitalize font-semibold text-gray-600 dark:text-gray-400">
                    {log.entityType || 'system'}
                  </td>

                  <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 font-medium">
                    {log.userEmail}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500 max-w-xs truncate">
                    {JSON.stringify(log.details || {})}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No audit records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
