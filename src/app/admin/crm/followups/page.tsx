'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  User,
  MapPin,
  Calendar,
  X,
  Star,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CrmFollowup, FollowupOutcome, FollowupStatus } from '@/types/crm';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<CrmFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'today' | 'all' | 'done'>('today');

  // Outcome logger modal state
  const [selectedFollowup, setSelectedFollowup] = useState<CrmFollowup | null>(null);
  const [callStatus, setCallStatus] = useState<FollowupStatus>('done');
  const [outcome, setOutcome] = useState<FollowupOutcome>('improved');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(4);
  const [nextAction, setNextAction] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);

  const loadFollowups = () => {
    setLoading(true);
    const url =
      activeFilter === 'today'
        ? '/api/admin/crm/followups?filter=today'
        : activeFilter === 'done'
        ? '/api/admin/crm/followups?status=done'
        : '/api/admin/crm/followups';

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.followups) {
          setFollowups(data.followups);
        }
      })
      .catch((err) => console.error('Fetch followups error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFollowups();
  }, [activeFilter]);

  const handleOpenOutcomeModal = (f: CrmFollowup) => {
    setSelectedFollowup(f);
    setCallStatus('done');
    setOutcome(f.outcome || 'improved');
    setFeedback(f.customerFeedback || '');
    setRating(f.satisfactionRating || 4);
    setNextAction(f.nextAction || '');
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowup) return;

    try {
      setSavingOutcome(true);
      const res = await fetch('/api/admin/crm/followups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFollowup.id,
          status: callStatus,
          outcome: callStatus === 'done' ? outcome : undefined,
          customerFeedback: feedback,
          satisfactionRating: rating,
          nextAction,
        }),
      });

      if (res.ok) {
        setSelectedFollowup(null);
        loadFollowups();
      }
    } catch (err) {
      console.error('Failed to log outcome:', err);
    } finally {
      setSavingOutcome(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4" />
            Farmer Telephony & Efficacy Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            আজকের ফলো-আপ কল কিউ (Today&apos;s Calls)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            প্রেসক্রিপশন দেওয়ার পর কৃষকদের ফোন করে ওষুধের ফলাফল জানুন এবং সন্তুষ্টি রেকর্ড করুন।
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'today'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            আজকের ও বকেয়া কল
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-forest text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            সকল কল
          </button>
          <button
            onClick={() => setActiveFilter('done')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            সম্পন্ন কল
          </button>
        </div>
      </div>

      {/* ── Follow-up Call Cards ── */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">কল লোড হচ্ছে...</div>
      ) : followups.length === 0 ? (
        <div className="py-16 text-center text-xs text-emerald-600 bg-white dark:bg-[#082218] rounded-3xl border border-gray-200 dark:border-white/10">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
          এই ক্যাটাগরিতে কোনো কল বাকি নেই!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {followups.map((f) => {
            const isOverdue = f.dueDate < todayStr && f.status === 'pending';

            return (
              <div
                key={f.id}
                className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {f.customerName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {f.customerVillage} • {f.customerMobile}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : f.status === 'done'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : f.status}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-sand/30 dark:bg-white/5 border border-forest/10 text-xs space-y-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      কেস নম্বর: <span className="font-mono text-forest dark:text-leaf">{f.caseNumber}</span>
                    </p>
                    <p className="text-gray-500">
                      নির্ধারিত তারিখ: <strong className={isOverdue ? 'text-rose-600' : ''}>{f.dueDate}</strong>
                    </p>
                    {f.outcome && (
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        ফলাফল: {f.outcome.toUpperCase()}
                      </p>
                    )}
                    {f.customerFeedback && (
                      <p className="italic text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                        &quot;{f.customerFeedback}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${f.customerMobile}`}
                    className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> কল করুন
                  </a>

                  <button
                    onClick={() => handleOpenOutcomeModal(f)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-xs"
                  >
                    ফলাফল লিখুন
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: LOG CALL OUTCOME ── */}
      {selectedFollowup && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  ফলো-আপ ফলাফল ও মতামত রেকর্ড
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedFollowup.customerName} ({selectedFollowup.customerMobile})
                </p>
              </div>
              <button
                onClick={() => setSelectedFollowup(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    কলের অবস্থা (Call Status)
                  </label>
                  <select
                    value={callStatus}
                    onChange={(e) => setCallStatus(e.target.value as FollowupStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  >
                    <option value="done">কথা হয়েছে (Done)</option>
                    <option value="no_answer">ফোন তোলেনি (No Answer)</option>
                    <option value="rescheduled">পরে কল করতে হবে (Rescheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ওষুধের কার্যকারিতা (Outcome)
                  </label>
                  <select
                    disabled={callStatus !== 'done'}
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as FollowupOutcome)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs disabled:opacity-40"
                  >
                    <option value="resolved">সম্পূর্ণ সমাধান (Resolved)</option>
                    <option value="improved">উন্নতি হয়েছে (Improved)</option>
                    <option value="no_change">কোনো পরিবর্তন নেই (No Change)</option>
                    <option value="worse">অবস্থা খারাপ হয়েছে (Worse)</option>
                    <option value="product_not_used">ওষুধ এখনও দেয়নি (Not Used)</option>
                  </select>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  কৃষকের সন্তুষ্টি রেটিং (Satisfaction Rating 1-5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all ${
                        star <= rating ? 'text-amber-500 scale-110' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-2">({rating}/5 তারা)</span>
                </div>
              </div>

              {/* Verbal feedback */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  কৃষকের মৌখিক প্রতিক্রিয়া (Farmer&apos;s Verbal Feedback)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="কৃষক কী বললেন লিখুন: যেমন- '২ বার স্প্রে করার পর পাতা পোড়া বন্ধ হয়েছে'..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              {/* Next Action */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  পরবর্তী পদক্ষেপ (Next Action)
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="যেমন: আর কোনো ওষুধ লাগবে না, বা ৫ দিন পর ইউরিয়া দিতে বলা হল"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFollowup(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingOutcome}
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 disabled:opacity-50 shadow-md"
                >
                  {savingOutcome ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ ও স্ট্যাটাস সিঙ্ক করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
