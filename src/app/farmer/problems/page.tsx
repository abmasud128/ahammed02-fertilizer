'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Flame,
  Phone,
  Shield,
  Microscope,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export default function FarmerProblemsPage() {
  const { d, isBn } = useAquaLanguage();

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = () => {
    setLoading(true);
    fetch('/api/farmer/problems')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setProblems(data.records || []);
        }
      })
      .catch((err) => console.error('Fetch problems error:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Read-Only Hub Specialist Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
              {isBn ? 'রোগ ও সমস্যা নির্ণয় লগ' : 'Problem & Disease Diagnosis'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {isBn ? 'হাব বিশেষজ্ঞ দ্বারা নিয়ন্ত্রিত' : 'Hub Specialist Managed'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isBn
              ? 'আহাম্মেদ ফার্টিলাইজার মৎস্য বিশেষজ্ঞদের দ্বারা সরাসরি পরিদর্শন ও নির্ণয়কৃত রোগ বা সমস্যার বিবরণ (কেবলমাত্র প্রদর্শনযোগ্য)'
              : 'Clinical problem diagnoses and pest alerts recorded by Aquaculture Hub specialists (Read-Only access for farmers)'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs font-bold self-start sm:self-auto">
          <Microscope className="w-4 h-4 text-amber-600" />
          <span>{isBn ? 'বিশেষজ্ঞ ডায়াগনোসিস ভিউয়ার' : 'Specialist Clinical Viewer'}</span>
        </div>
      </div>

      {/* Specialist Clinical Protocol Notice */}
      <div className="p-3.5 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-black text-emerald-950 dark:text-emerald-100">
            {isBn ? 'রোগ নির্ণয় নীতি ও পরামর্শ' : 'Clinical Diagnostic & Disease Protocol'}
          </div>
          <div className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
            {isBn
              ? 'রোগ ও সমস্যা সংক্রান্ত যাবতীয় এন্ট্রি এবং পরীক্ষা আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাব অ্যাডমিন ও ল্যাব বিশেষজ্ঞদের দ্বারা পরিচালিত হয়। যেকোনো অস্বাভাবিক লক্ষণ দেখলে নিচের হেল্পলাইনে যোগাযোগ করুন।'
              : 'Problem & disease diagnoses are conducted, verified, and updated by Aquaculture Hub specialists. To report new symptoms or emergency pond distress, please call the emergency helpline directly.'}
          </div>
        </div>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-950 dark:text-amber-100">
              {isBn ? 'জরুরি মৎস্য পরামর্শ হেল্পলাইন' : 'Emergency Aquaculture Hotline'}
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-300">
              {isBn
                ? 'মাছ ভেসে উঠলে বা গ্যাস সমস্যায় সাথে সাথে যোগাযোগ করুন'
                : 'For gas distress, sudden piping, or unusual lesions, contact us immediately'}
            </div>
          </div>
        </div>

        <a
          href="tel:9091017035"
          className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shrink-0 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{isBn ? 'কল করুন' : 'Call Now'}</span>
        </a>
      </div>

      {/* Problems & Diagnoses List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{isBn ? 'হাব বিশেষজ্ঞ দ্বারা নথিবদ্ধ রোগের বিবরণ' : 'Clinical Diagnoses Logged by Hub'}</span>
          </h2>
          <span className="text-xs font-bold text-gray-500">
            {problems.length} {isBn ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30 text-xs text-gray-500 font-bold">
            {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading clinical records...'}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {isBn
                ? 'আপনার পুকুরে কোনো সক্রিয় রোগ বা সমস্যা নথিবদ্ধ নেই।'
                : 'No active problem or disease events recorded by Hub Specialists.'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {isBn
                ? 'পুকুর সুস্থ ও স্বাভাবিক অবস্থায় রয়েছে।'
                : 'Ponds are in normal, healthy condition.'}
            </p>
          </div>
        ) : (
          problems.map((prob) => (
            <div
              key={prob.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{prob.reportDate}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                      prob.severity === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border border-red-300'
                        : prob.severity === 'high' || prob.severity === 'severe'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border border-orange-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300'
                    }`}
                  >
                    {isBn ? 'তীব্রতা: ' : 'Severity: '}
                    {prob.severity ? prob.severity.toUpperCase() : 'MODERATE'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'হাব সার্টিফাইড ডায়াগনোসিস' : 'Hub Certified Diagnosis'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-emerald-950/60 border border-gray-100 dark:border-emerald-900/30">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {isBn ? 'রোগের লক্ষণ ও পর্যবেক্ষণ বিবরণ' : 'Observed Symptoms & Diagnosis'}
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {prob.symptomDescription}
                </div>
              </div>

              <div className="text-[11px] text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 dark:border-white/5">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-gray-400" />
                  <span>{isBn ? 'শ্রেণী:' : 'Category:'} <strong className="text-gray-900 dark:text-gray-200">{prob.problemCategory}</strong></span>
                </span>
                {prob.affectedSpeciesId && (
                  <span>{isBn ? 'আক্রান্ত প্রজাতি:' : 'Species:'} <strong className="text-gray-900 dark:text-gray-200">{prob.affectedSpeciesId}</strong></span>
                )}
                {prob.productionCycleId && (
                  <span>{isBn ? 'চাষ চক্র:' : 'Cycle:'} <strong className="text-gray-900 dark:text-gray-200">{prob.productionCycleId}</strong></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
