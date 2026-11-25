'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Pill,
  Shield,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function FarmerTreatmentPage() {
  const router = useRouter();
  const { d, isBn } = useAquaLanguage();

  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = () => {
    setLoading(true);
    fetch('/api/farmer/treatment')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/farmer/login?returnUrl=/farmer/treatment');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && data.success) {
          setTreatments(data.records || []);
        }
      })
      .catch((err) => console.error('Fetch treatments error:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Hub Specialist Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
              {isBn ? 'চিকিৎসা ও ওষুধ প্রেসক্রিপশন' : 'Treatment & Care Prescriptions'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
              <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              {isBn ? 'হাব বিশেষজ্ঞ প্রেসক্রাইবড' : 'Hub Specialist Prescribed'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isBn
              ? 'আহাম্মেদ ফার্টিলাইজার মৎস্য বিজ্ঞানীদের অনুমোদিত ওষুধ, প্রতিষেধক ও পরিচর্যার নির্দেশিকা (কেবলমাত্র প্রদর্শনযোগ্য)'
              : 'Medical treatments and chemical prescriptions authorized by Aquaculture Hub specialists (Read-Only access for farmers)'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-teal-900 dark:text-teal-200 text-xs font-bold self-start sm:self-auto">
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span>{isBn ? 'প্রেসক্রিপশন ভিউয়ার' : 'Prescription Viewer'}</span>
        </div>
      </div>

      {/* Advisory & Dosage Protocol Notice */}
      <div className="p-3.5 rounded-2xl bg-linear-to-r from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/30 border border-teal-200 dark:border-teal-800/50 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-black text-teal-950 dark:text-teal-100">
            {isBn ? 'ওষুধ প্রয়োগের সতর্কবার্তা ও নিয়মাবলী' : 'Medication & Dosage Protocol'}
          </div>
          <div className="text-teal-800 dark:text-teal-300 text-[11px] leading-relaxed">
            {isBn
              ? 'চিকিৎসা ও ওষুধের ডোজ কেবলমাত্র আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার বিশেষজ্ঞ কর্তৃক পরিচালিত ও নির্ধারিত হয়। অনুমোদিত মাত্রার বাইরে কোনো রাসায়নিক ব্যবহার করবেন না। ডোজ প্রয়োগে কোনো সন্দেহ থাকলে ল্যাবে যোগাযোগ করুন।'
              : 'All treatments, sanitizers, and chemical doses are prescribed directly by Aquaculture Hub specialists. Please strictly adhere to the exact doses and application methods specified below.'}
          </div>
        </div>
      </div>

      {/* Treatments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>{isBn ? 'প্রেসক্রাইবড চিকিৎসা ও নির্দেশিকা' : 'Prescribed Treatments & Protocols'}</span>
          </h2>
          <span className="text-xs font-bold text-gray-500">
            {treatments.length} {isBn ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30 text-xs text-gray-500 font-bold">
            {isBn ? 'প্রেসক্রিপশন লোড হচ্ছে...' : 'Loading prescriptions...'}
          </div>
        ) : treatments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {isBn
                ? 'বর্তমানে কোনো সক্রিয় ওষুধ বা চিকিৎসার প্রেসক্রিপশন নেই।'
                : 'No active medical treatments or prescriptions issued by Hub Specialists.'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {isBn
                ? 'পুকুরের পানি ও মাছ সুস্থ অবস্থায় রয়েছে।'
                : 'Ponds and fish are currently in good health.'}
            </p>
          </div>
        ) : (
          treatments.map((tr) => (
            <div
              key={tr.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{tr.treatmentDate}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border border-teal-300">
                    {tr.prescribedBy || (isBn ? 'হাব মৎস্য বিশেষজ্ঞ' : 'Hub Specialist')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'অনুমোদিত প্রেসক্রিপশন' : 'Authorized Prescription'}</span>
                </div>
              </div>

              {/* Medicine & Dosage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
                  <div className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-0.5">
                    {isBn ? 'ওষুধ / রাসায়নিকের নাম' : 'Medicine / Chemical Name'}
                  </div>
                  <div className="text-xs font-black text-teal-950 dark:text-teal-100 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>{tr.medicineOrChemicalName}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                  <div className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-0.5">
                    {isBn ? 'নির্দেশিত মাত্রা (Dosage)' : 'Prescribed Dosage'}
                  </div>
                  <div className="text-xs font-black text-amber-950 dark:text-amber-100">
                    {tr.dosage}
                  </div>
                </div>
              </div>

              {/* Application Method & Condition */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-emerald-950/60 border border-gray-100 dark:border-emerald-900/30 space-y-1.5 text-xs">
                {tr.applicationMethod && (
                  <div>
                    <span className="font-extrabold text-gray-700 dark:text-gray-300">
                      {isBn ? 'প্রয়োগ পদ্ধতি: ' : 'Application Method: '}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{tr.applicationMethod}</span>
                  </div>
                )}
                {tr.targetCondition && (
                  <div>
                    <span className="font-extrabold text-gray-700 dark:text-gray-300">
                      {isBn ? 'লক্ষ্যমাত্রা / উদ্দিষ্ট কারণ: ' : 'Target Condition: '}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{tr.targetCondition}</span>
                  </div>
                )}
                {tr.notes && (
                  <div className="pt-1 border-t border-gray-200 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
                    <strong>{isBn ? 'বিশেষ নোট: ' : 'Special Notes: '}</strong>
                    {tr.notes}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
                {tr.productionCycleId && (
                  <span>
                    {isBn ? 'চাষ চক্র:' : 'Cycle:'} <strong className="text-gray-900 dark:text-gray-200">{tr.productionCycleId}</strong>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
