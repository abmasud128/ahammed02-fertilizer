'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Calculator,
  Scale,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { formatWhatsAppUrl } from '@/lib/utils';

export default function CropFertilizerCalculator() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [agriCrop, setAgriCrop] = useState<'paddy' | 'mustard' | 'potato' | 'maize'>('paddy');
  const [agriUnit, setAgriUnit] = useState<'bigha' | 'decimal'>('bigha');
  const [agriArea, setAgriArea] = useState<number>(1);

  const decimalsCount = agriUnit === 'bigha' ? agriArea * 33 : agriArea;

  const agriDosageMap = {
    paddy: {
      urea: Math.round(decimalsCount * (30 / 33)),
      dap: Math.round(decimalsCount * (20 / 33)),
      mop: Math.round(decimalsCount * (15 / 33)),
      zinc: Math.round(decimalsCount * (3 / 33)),
      notes: isBn
        ? 'ডিএপি ও পটাশ সম্পূর্ণ শেষ চাষে দিন। ইউরিয়া ৩ কিস্তিতে (১৫ দিন, ৩৫ দিন ও শিষ আসার আগে) প্রয়োগ করুন।'
        : 'Apply DAP and MOP fully during final land preparation. Split Urea into 3 top-dressings.',
    },
    mustard: {
      urea: Math.round(decimalsCount * (22 / 33)),
      dap: Math.round(decimalsCount * (25 / 33)),
      mop: Math.round(decimalsCount * (12 / 33)),
      zinc: Math.round(decimalsCount * (2.5 / 33)),
      notes: isBn
        ? 'সরিষায় সালফার আবশ্যক। মূল সারের সাথে বিঘায় ৪ কেজি সালফার ডাস্ট প্রয়োগে তেল বৃদ্ধি পায়।'
        : 'Sulphur is critical for mustard. Apply 4 kg sulphur per bigha to maximize oil content.',
    },
    potato: {
      urea: Math.round(decimalsCount * (45 / 33)),
      dap: Math.round(decimalsCount * (50 / 33)),
      mop: Math.round(decimalsCount * (40 / 33)),
      zinc: Math.round(decimalsCount * (4 / 33)),
      notes: isBn
        ? 'আলু চাষে অর্ধেক ইউরিয়া ও সম্পূর্ণ ফসফেট-পটাশ রোপণে দিন। বাকি ইউরিয়া মাটি তোলার সময় দিন।'
        : 'Apply half Urea and full DAP/MOP at planting. Side-dress remaining Urea during earthing-up.',
    },
    maize: {
      urea: Math.round(decimalsCount * (50 / 33)),
      dap: Math.round(decimalsCount * (30 / 33)),
      mop: Math.round(decimalsCount * (25 / 33)),
      zinc: Math.round(decimalsCount * (3.5 / 33)),
      notes: isBn
        ? 'ভুট্টায় পর্যাপ্ত নাইট্রোজেন প্রয়োজন। হাঁটু সমান উচ্চতায় ও ফুল আসার আগে ইউরিয়া টপ ড্রেসিং করুন।'
        : 'Maize is a heavy feeder. Top-dress Urea at knee-high stage and before tasseling.',
    },
  };

  const currentAgri = agriDosageMap[agriCrop];

  const shareText = isBn
    ? `আহাম্মেদ ফার্টিলাইজার ক্যালকুলেটর:\nফসল: ${agriCrop}\nজমি: ${agriArea} ${agriUnit}\nপ্রয়োজনীয় সার:\n• ইউরিয়া: ${currentAgri.urea} কেজি\n• ডিএপি: ${currentAgri.dap} কেজি\n• পটাশ (MOP): ${currentAgri.mop} কেজি\n• জিঙ্ক: ${currentAgri.zinc} কেজি`
    : `Ahammed Fertilizer Dosage Calculator:\nCrop: ${agriCrop}\nArea: ${agriArea} ${agriUnit}\nDosage Required:\n• Urea: ${currentAgri.urea} kg\n• DAP: ${currentAgri.dap} kg\n• MOP: ${currentAgri.mop} kg\n• Zinc: ${currentAgri.zinc} kg`;

  return (
    <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl shadow-2xl p-5 sm:p-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-harvest mb-1">
            <Calculator className="w-4 h-4" />
            {isBn ? 'বৈজ্ঞানিক সার মাত্রা নির্ণয়' : 'Scientific Crop Nutrition'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isBn ? 'ফসলের সুষম সার ক্যালকুলেটর' : 'Balanced Crop Fertilizer Calculator'}
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-harvest backdrop-blur-md">
          <span>🌿</span>
          <span>{isBn ? 'দক্ষিণ দিনাজপুর স্ট্যান্ডার্ড' : 'West Bengal Soil Norms'}</span>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Controls Column */}
        <div className="md:col-span-5 space-y-4">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-extrabold text-harvest uppercase tracking-wider mb-2">
              {isBn ? 'ফসল নির্বাচন করুন' : 'Select Crop'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'paddy', label: isBn ? '🌾 ধান (Paddy)' : '🌾 Paddy / Rice' },
                { id: 'mustard', label: isBn ? '🌼 সরিষা (Mustard)' : '🌼 Mustard' },
                { id: 'potato', label: isBn ? '🥔 আলু (Potato)' : '🥔 Potato' },
                { id: 'maize', label: isBn ? '🌽 ভুট্টা (Maize)' : '🌽 Maize' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAgriCrop(c.id as any)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                    agriCrop === c.id
                      ? 'bg-harvest text-forest font-black border-harvest shadow-md'
                      : 'bg-white/10 text-cream border-white/15 hover:bg-white/18'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Switcher */}
          <div>
            <label className="block text-xs font-extrabold text-harvest uppercase tracking-wider mb-2">
              {isBn ? 'পরিমাপ একক' : 'Area Unit'}
            </label>
            <div className="flex rounded-xl p-1 bg-white/10 border border-white/15">
              <button
                type="button"
                onClick={() => setAgriUnit('bigha')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  agriUnit === 'bigha'
                    ? 'bg-harvest text-forest font-black shadow-xs'
                    : 'text-cream/80 hover:text-white'
                }`}
              >
                {isBn ? 'বিঘা (৩৩ শতক)' : 'Bigha (33 Decimal)'}
              </button>
              <button
                type="button"
                onClick={() => setAgriUnit('decimal')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  agriUnit === 'decimal'
                    ? 'bg-harvest text-forest font-black shadow-xs'
                    : 'text-cream/80 hover:text-white'
                }`}
              >
                {isBn ? 'শতক (Decimal)' : 'Decimal'}
              </button>
            </div>
          </div>

          {/* Area Input Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-extrabold text-harvest uppercase tracking-wider">
                {isBn ? 'জমির পরিমাণ' : 'Land Area'}
              </label>
              <span className="text-sm font-black text-white">
                {agriArea} {agriUnit === 'bigha' ? (isBn ? 'বিঘা' : 'Bigha') : (isBn ? 'শতক' : 'Decimal')}
              </span>
            </div>
            <input
              type="range"
              min={agriUnit === 'bigha' ? 0.5 : 5}
              max={agriUnit === 'bigha' ? 20 : 200}
              step={agriUnit === 'bigha' ? 0.5 : 5}
              value={agriArea}
              onChange={(e) => setAgriArea(parseFloat(e.target.value) || 1)}
              className="w-full accent-harvest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-cream/70 mt-1">
              <span>{agriUnit === 'bigha' ? '0.5' : '5'}</span>
              <span>{agriUnit === 'bigha' ? '10 বিঘা' : '100 শতক'}</span>
              <span>{agriUnit === 'bigha' ? '20' : '200'}</span>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="md:col-span-7 bg-white/10 rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-harvest">
                {isBn ? 'প্রয়োজনীয় সারের পরিমাণ' : 'Recommended Fertilizer Doses'}
              </span>
              <span className="text-xs text-cream/75">
                {agriArea} {agriUnit} ({decimalsCount} {isBn ? 'শতক' : 'decimals'})
              </span>
            </div>

            {/* Dosage Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-forest/80 border border-white/20 text-center shadow-xs">
                <span className="text-xs font-bold text-cream/80 block">ইউরিয়া (Urea)</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                  {currentAgri.urea}
                </span>
                <span className="text-[10px] text-cream/70 font-semibold uppercase">{isBn ? 'কেজি' : 'kg'}</span>
              </div>
              <div className="p-3 rounded-xl bg-forest/80 border border-white/20 text-center shadow-xs">
                <span className="text-xs font-bold text-cream/80 block">ডিএপি (DAP)</span>
                <span className="text-xl sm:text-2xl font-black text-harvest mt-1 block">
                  {currentAgri.dap}
                </span>
                <span className="text-[10px] text-cream/70 font-semibold uppercase">{isBn ? 'কেজি' : 'kg'}</span>
              </div>
              <div className="p-3 rounded-xl bg-forest/80 border border-white/20 text-center shadow-xs">
                <span className="text-xs font-bold text-cream/80 block">পটাশ (MOP)</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                  {currentAgri.mop}
                </span>
                <span className="text-[10px] text-cream/70 font-semibold uppercase">{isBn ? 'কেজি' : 'kg'}</span>
              </div>
              <div className="p-3 rounded-xl bg-forest/80 border border-white/20 text-center shadow-xs">
                <span className="text-xs font-bold text-cream/80 block">জিঙ্ক (Zinc)</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-300 mt-1 block">
                  {currentAgri.zinc}
                </span>
                <span className="text-[10px] text-cream/70 font-semibold uppercase">{isBn ? 'কেজি' : 'kg'}</span>
              </div>
            </div>

            {/* Split Schedule Note */}
            <div className="mt-4 p-3 rounded-xl bg-harvest/20 border border-harvest/40 text-xs text-cream leading-relaxed">
              <strong className="text-harvest">💡 {isBn ? 'প্রয়োগের সঠিক সময়:' : 'Application Schedule:'}</strong> {currentAgri.notes}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <a
              href={formatWhatsAppUrl(siteConfig.whatsapp, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-105 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>💬</span>
              <span>{isBn ? 'প্রেসক্রিপশন হোয়াটসঅ্যাপে পাঠান' : 'Send to WhatsApp'}</span>
            </a>
            <Link
              href="/book-test"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-harvest hover:text-amber-300 hover:underline"
            >
              <span>{isBn ? 'মাটি টেস্ট করিয়ে সঠিক রিপোর্ট নিন' : 'Verify with Soil Lab Test'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
