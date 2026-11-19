'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Clock,
  History,
  ShoppingCart,
  PlusCircle,
  FileText,
  Camera,
  Layers,
  X,
  Share2,
} from 'lucide-react';
import { CrmCase, CaseStatus, CrmPrescriptionItem } from '@/types/crm';
import { ProductRecord } from '@/types/admin';

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [caseData, setCaseData] = useState<CrmCase | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Status change state
  const [newStatus, setNewStatus] = useState<CaseStatus>('open');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Add prescription modal
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [prescNotes, setPrescNotes] = useState('');
  const [prescItems, setPrescItems] = useState<
    Array<{
      productId?: string;
      productName: string;
      isCustomItem: boolean;
      quantity: number;
      unit: string;
      doseInstructions: string;
      applicationMethod: string;
      intervalDays: number;
      numberOfApplications: number;
    }>
  >([]);

  // Add media modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    storagePath: '/uploads/cases/demo-photo.jpg',
    fileName: 'crop-lesion.jpg',
    fileType: 'image/jpeg',
    sizeBytes: 154000,
    caption: '',
  });

  const loadCase = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/crm/cases/${caseId}`).then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ])
      .then(([cData, pData]) => {
        if (cData.success && cData.case) {
          setCaseData(cData.case);
          setNewStatus(cData.case.status);
        }
        if (pData.success && pData.products) {
          setProducts(pData.products);
        }
      })
      .catch((err) => console.error('Case fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || newStatus === caseData.status) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/crm/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
          reason: statusReason || undefined,
        }),
      });

      if (res.ok) {
        setStatusReason('');
        loadCase();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prescItems.length === 0) return;

    try {
      const res = await fetch(`/api/admin/crm/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_prescription',
          notes: prescNotes,
          items: prescItems,
        }),
      });

      if (res.ok) {
        setShowPrescModal(false);
        setPrescItems([]);
        setPrescNotes('');
        loadCase();
      }
    } catch (err) {
      console.error('Failed to add prescription:', err);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/crm/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_media',
          ...mediaForm,
        }),
      });

      if (res.ok) {
        setShowMediaModal(false);
        loadCase();
      }
    } catch (err) {
      console.error('Failed to add media:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">কেস লোড হচ্ছে...</div>;
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">কেস পাওয়া যায়নি।</p>
        <Link href="/admin/crm/cases" className="text-xs font-bold text-forest underline mt-2 block">
          তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <Link
          href="/admin/crm/cases"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          সকল কেস তালিকা
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/pos`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            পিওএস বিলিং করুন (Sell in POS)
          </Link>
        </div>
      </div>

      {/* ── Case Overview Banner ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-forest dark:text-leaf">
                {caseData.caseNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  caseData.severity === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : caseData.severity === 'severe'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {caseData.severity.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf">
                {caseData.category.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
              {caseData.title}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              কৃষক:{' '}
              <Link
                href={`/admin/crm/customers/${caseData.customerId}`}
                className="font-bold text-forest dark:text-leaf hover:underline"
              >
                {caseData.customerName}
              </Link>{' '}
              ({caseData.customerVillage} • {caseData.customerMobile}) • জমি: {caseData.plotName}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                caseData.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : caseData.status === 'follow_up_due'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {caseData.status}
            </span>
            <span className="block text-[11px] text-gray-400 mt-2">
              পর্যবেক্ষণ: {caseData.observedOn}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
          <span className="font-bold block text-gray-500 mb-1">লক্ষণ ও নির্ণয় বিবরণ:</span>
          {caseData.description}
        </div>
      </div>

      {/* ── Status Change Control ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-forest" />
          স্ট্যাটাস পরিবর্তন ও সংশোধন রেকর্ড (Status & Revision)
        </h3>

        <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              নতুন স্ট্যাটাস
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
            >
              <option value="open">ওপেন (Open)</option>
              <option value="treated">চিকিৎসাধীন (Treated)</option>
              <option value="follow_up_due">ফলো-আপ বাকী (Follow-up Due)</option>
              <option value="resolved">সমাধান হয়েছে (Resolved)</option>
              <option value="failed">ব্যর্থ / বাড়েনি (Failed)</option>
              <option value="closed">বন্ধ (Closed)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              পরিবর্তনের কারণ / মন্তব্য
            </label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="যেমন: কৃষকের সাথে কথা বলে সমাধান নিশ্চিত..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={updatingStatus || newStatus === caseData.status}
              className="w-full px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 disabled:opacity-50 transition-all shadow-xs"
            >
              {updatingStatus ? 'আপডেট হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
            </button>
          </div>
        </form>

        {/* Revision logs */}
        {caseData.revisions && caseData.revisions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">
              সংশোধন ও পরিবর্তনের লগ:
            </span>
            {caseData.revisions.map((rev) => (
              <p key={rev.id} className="text-[11px] text-gray-500">
                • {new Date(rev.createdAt).toLocaleString('bn-IN')}: {rev.previousStatus} &rarr;{' '}
                <strong>{rev.newStatus}</strong> ({rev.changedBy}) - {rev.reason}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Prescriptions Section ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest" />
            প্রেসক্রিপশন ও ওষুধের বিবরণ (Prescriptions)
          </h2>
          <button
            onClick={() => setShowPrescModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> নতুন প্রেসক্রিপশন যোগ করুন
          </button>
        </div>

        {caseData.prescriptions?.length === 0 ? (
          <p className="text-xs text-gray-400 italic">কোনো ব্যবস্থাপত্র নথিবদ্ধ নেই।</p>
        ) : (
          <div className="space-y-4">
            {caseData.prescriptions.map((presc) => (
              <div
                key={presc.id}
                className="p-5 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>তারিখ: {presc.prescribedOn} • প্রদানকারী: {presc.prescribedByName}</span>
                  {presc.notes && <span className="italic">{presc.notes}</span>}
                </div>

                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {presc.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.productName}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({item.quantity} {item.unit})
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          ডোজ: {item.doseInstructions} • পদ্ধতি: {item.applicationMethod}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest">
                        {item.applicationMethod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Media Photos Section ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-forest" />
            আক্রান্ত অংশের ছবি ও মিডিয়া (Case Photos)
          </h2>
          <button
            onClick={() => setShowMediaModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> ছবি যুক্ত করুন
          </button>
        </div>

        {caseData.media?.length === 0 ? (
          <p className="text-xs text-gray-400 italic">কোনো ছবি যুক্ত করা হয়নি।</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {caseData.media.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10 text-xs"
              >
                <div className="w-full h-24 rounded-xl bg-forest/10 flex items-center justify-center text-forest mb-2">
                  <Camera className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{m.fileName}</p>
                {m.caption && <p className="text-[11px] text-gray-500">{m.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: ADD PRESCRIPTION ── */}
      {showPrescModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                প্রেসক্রিপশন যোগ করুন
              </h3>
              <button
                onClick={() => setShowPrescModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  পণ্য নির্বাচন
                </label>
                <select
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      setPrescItems([
                        ...prescItems,
                        {
                          productId: prod.id,
                          productName: prod.name,
                          isCustomItem: false,
                          quantity: 1,
                          unit: prod.unit || 'packet',
                          doseInstructions: '1 ml per litre water',
                          applicationMethod: 'Foliar Spray',
                          intervalDays: 7,
                          numberOfApplications: 1,
                        },
                      ]);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                >
                  <option value="">-- পিওএস পণ্য থেকে বেছে নিন --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {prescItems.length > 0 && (
                <div className="space-y-2">
                  {prescItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{item.productName}</span>
                        <button
                          type="button"
                          onClick={() => setPrescItems(prescItems.filter((_, i) => i !== idx))}
                          className="text-rose-500"
                        >
                          বাতিল
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.doseInstructions}
                        onChange={(e) => {
                          const updated = [...prescItems];
                          updated[idx].doseInstructions = e.target.value;
                          setPrescItems(updated);
                        }}
                        placeholder="ডোজ নির্দেশনা..."
                        className="w-full px-2 py-1 rounded border text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  বিশেষজ্ঞের পরামর্শ নোট
                </label>
                <textarea
                  rows={2}
                  value={prescNotes}
                  onChange={(e) => setPrescNotes(e.target.value)}
                  placeholder="সকালের দিকে স্প্রে করুন, ইউরিয়া বন্ধ রাখুন..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrescModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={prescItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 disabled:opacity-50"
                >
                  ব্যবস্থাপত্র যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD MEDIA ── */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                আক্রান্ত অংশের ছবি যুক্ত করুন
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ফাইলের নাম
                </label>
                <input
                  type="text"
                  required
                  value={mediaForm.fileName}
                  onChange={(e) => setMediaForm({ ...mediaForm, fileName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ক্যাপশন (বর্ণনা)
                </label>
                <input
                  type="text"
                  value={mediaForm.caption}
                  onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
                  placeholder="যেমন: ধানের পাতায় বাদামি দাগের বিস্তার"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                >
                  ছবি সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
