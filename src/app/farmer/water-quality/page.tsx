'use client';

import React, { useState, useEffect } from 'react';
import { useAquaLanguage } from '@/lib/i18n/aqua-context';
import { Droplet, ShieldCheck, Thermometer, FlaskConical, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FarmerWaterQualityPage() {
  const { d, isBn } = useAquaLanguage();

  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = () => {
    setLoading(true);
    fetch('/api/farmer/water-quality')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setReadings(data.records || []);
        }
      })
      .finally(() => setLoading(false));
  };

  const latestReading = readings.length > 0 ? readings[0] : null;

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
            {d.waterQuality.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {d.waterQuality.subtitle}
          </p>
        </div>

        {/* Read-Only Specialist Authority Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-bold shadow-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>
            {isBn
              ? 'হাব ল্যাব বিশেষজ্ঞ দ্বারা পরিচালিত • শুধুমাত্র দর্শনীয়'
              : 'Hub Specialist Managed • Read-Only'}
          </span>
        </div>
      </div>

      {/* Official Notice Banner */}
      <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-xs flex items-start gap-3 shadow-xs">
        <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-cyan-950 dark:text-cyan-100 block">
            {isBn ? 'ল্যাব পরীক্ষাগার ও পানির গুণমান পর্যবেক্ষণ' : 'Official Laboratory Water Diagnostics'}
          </span>
          <p className="text-cyan-800/90 dark:text-cyan-300/90 leading-relaxed text-[11px]">
            {isBn
              ? 'পুকুরের পানির গুণমান (পিএইচ, দ্রবীভূত অক্সিজেন, অ্যামোনিয়া, স্বচ্ছতা ও তাপমাত্রা) পরীক্ষা আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে ল্যাব বিশেষজ্ঞ দ্বারা পরিচালিত হয়। চাষীরা এখান থেকে সমস্ত বৈজ্ঞানিক রিপোর্ট দেখতে পারবেন। কোনো পরিবর্তন প্রয়োজন হলে অ্যাকুয়াকালচার হাবে যোগাযোগ করুন।'
              : 'Water quality diagnostics (pH, Dissolved Oxygen, Ammonia, Transparency, and Temperature) are strictly tested and recorded by Ahammed Fertilizer Aquaculture Hub lab specialists. Farmers have read-only access to view laboratory results and trends.'}
          </p>
        </div>
      </div>

      {/* Latest Status Indicator Card */}
      {latestReading && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-cyan-900 to-emerald-950 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-cyan-200">
              {isBn ? 'সর্বশেষ পানির অবস্থা' : 'Latest Water Condition'}
            </span>
            <span className="opacity-80 font-mono text-[11px]">
              {latestReading.readingDate} {latestReading.readingTime ? `(${latestReading.readingTime})` : ''}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-cyan-200 font-bold">
                {isBn ? 'অক্সিজেন (DO)' : 'Dissolved Oxygen'}
              </div>
              <div className="text-lg font-black mt-0.5">
                {latestReading.dissolvedOxygenPpm || '—'} <span className="text-[10px] font-normal">ppm</span>
              </div>
              <div className="text-[9px] mt-1 text-emerald-300 font-bold">
                {(latestReading.dissolvedOxygenPpm || 0) >= 4
                  ? isBn ? 'অনুকূল (Good)' : 'Optimal'
                  : isBn ? 'স্বল্পতা (Low)' : 'Low'}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-cyan-200 font-bold">
                {isBn ? 'পিএইচ (pH)' : 'pH Level'}
              </div>
              <div className="text-lg font-black mt-0.5">{latestReading.phLevel || '—'}</div>
              <div className="text-[9px] mt-1 text-emerald-300 font-bold">
                {(latestReading.phLevel || 7) >= 7.5 && (latestReading.phLevel || 7) <= 8.5
                  ? isBn ? 'স্বাভাবিক (Normal)' : 'Normal'
                  : isBn ? 'নজরদারি (Monitor)' : 'Check'}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-cyan-200 font-bold">
                {isBn ? 'অ্যামোনিয়া (NH3)' : 'Ammonia'}
              </div>
              <div className="text-lg font-black mt-0.5">
                {latestReading.ammoniaPpm !== undefined ? latestReading.ammoniaPpm : '—'}{' '}
                <span className="text-[10px] font-normal">ppm</span>
              </div>
              <div className="text-[9px] mt-1 text-emerald-300 font-bold">
                {(latestReading.ammoniaPpm || 0) < 0.1
                  ? isBn ? 'নিরাপদ (Safe)' : 'Safe'
                  : isBn ? 'উচ্চ মাত্রা (High)' : 'High'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Readings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
            {d.waterQuality.recentReadings}
          </h2>
          <span className="text-xs text-gray-400 font-semibold">
            {isBn ? `মোট পরীক্ষা: ${readings.length} টি` : `Total Tests: ${readings.length}`}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500 font-semibold">
            {d.common.loading}
          </div>
        ) : readings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30">
            <Droplet className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-500">
              {isBn ? 'এখনো কোনো পানির পরীক্ষার রেকর্ড নেই।' : 'No water quality readings on record yet.'}
            </p>
          </div>
        ) : (
          readings.map((reading) => (
            <div
              key={reading.id}
              className="p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {reading.readingDate}
                  </span>
                  {reading.readingTime && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 font-bold">
                      {reading.readingTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {reading.verificationStatus === 'verified'
                      ? isBn ? 'ল্যাব অনুমোদিত' : 'Lab Verified'
                      : isBn ? 'পর্যালোচনাধীন' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] text-gray-500">{isBn ? 'অক্সিজেন (DO)' : 'DO (Dissolved Oxygen)'}</div>
                  <div className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">
                    {reading.dissolvedOxygenPpm ? `${reading.dissolvedOxygenPpm} ppm` : '—'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] text-gray-500">{isBn ? 'পিএইচ (pH)' : 'pH Level'}</div>
                  <div className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">
                    {reading.phLevel || '—'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] text-gray-500">{isBn ? 'তাপমাত্রা' : 'Water Temp'}</div>
                  <div className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">
                    {reading.waterTempC ? `${reading.waterTempC}°C` : '—'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                  <div className="text-[10px] text-gray-500">{isBn ? 'স্বচ্ছতা (Secchi)' : 'Transparency'}</div>
                  <div className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">
                    {reading.waterTransparencyCm ? `${reading.waterTransparencyCm} cm` : '—'}
                  </div>
                </div>
              </div>

              {reading.observationNotes && (
                <div className="text-[11px] text-gray-600 dark:text-gray-300 italic pt-2 border-t border-gray-100 dark:border-white/5 flex items-start gap-1.5">
                  <span className="font-bold not-italic text-emerald-700 dark:text-emerald-400 shrink-0">
                    {isBn ? 'বিশেষজ্ঞ মন্তব্য:' : 'Lab Specialist Notes:'}
                  </span>
                  <span>&ldquo;{reading.observationNotes}&rdquo;</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
