'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Fish,
  Calculator,
  Droplets,
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

export default function AgriAquaCalculator() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [activeTab, setActiveTab] = useState<'agri' | 'aqua'>('agri');

  // Agri Calculator State
  const [agriCrop, setAgriCrop] = useState<'paddy' | 'mustard' | 'potato' | 'maize'>('paddy');
  const [agriUnit, setAgriUnit] = useState<'bigha' | 'decimal'>('bigha');
  const [agriArea, setAgriArea] = useState<number>(1);

  // Aqua Calculator State
  const [aquaArea, setAquaArea] = useState<number>(40); // 40 decimal pond
  const [aquaDepth, setAquaDepth] = useState<number>(4.5); // 4.5 ft

  // Calculations
  const decimalsCount = agriUnit === 'bigha' ? agriArea * 33 : agriArea;

  // Agri Dosage rules per 33 decimal (1 Bigha)
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
      dap: Math.round(decimalsCount * (40 / 33)),
      mop: Math.round(decimalsCount * (40 / 33)),
      zinc: Math.round(decimalsCount * (5 / 33)),
      notes: isBn
        ? 'আলুতে প্রচুর পটাশ প্রয়োজন। দানা বাঁধতে বোরন ও ম্যাগনেসিয়াম স্প্রে ফলন বাড়ায়।'
        : 'High potash requirement. Supplement with Boron and Magnesium foliar spray during tuberization.',
    },
    maize: {
      urea: Math.round(decimalsCount * (35 / 33)),
      dap: Math.round(decimalsCount * (25 / 33)),
      mop: Math.round(decimalsCount * (20 / 33)),
      zinc: Math.round(decimalsCount * (4 / 33)),
      notes: isBn
        ? 'ভুট্টার গোড়া বাঁধার সময় দ্বিতীয় কিস্তি ইউরিয়া প্রয়োগ ও মাটি তুলে দেওয়া আবশ্যক।'
        : 'Apply second dose of urea at knee-high stage and earth-up the soil around roots.',
    },
  };

  const agriResult = agriDosageMap[agriCrop];

  // Aqua Dosage rules for pond (per decimal)
  const limeRequired = Math.round(aquaArea * 1.2); // ~1.2 kg per decimal
  const fingerlingsTotal = Math.round(aquaArea * 35); // 35 fingerlings per decimal
  const surfaceFish = Math.round(fingerlingsTotal * 0.25); // Catla/Silver (25%)
  const columnFish = Math.round(fingerlingsTotal * 0.45); // Rohu (45%)
  const bottomFish = Math.round(fingerlingsTotal * 0.3); // Mrigal/Kalbaush (30%)
  const dailyFeedKg = (aquaArea * 0.12).toFixed(1); // Approximate daily feed in kg

  const agriWhatsAppMsg = isBn
    ? `নমস্কার! আমি আহাম্মেদ ফার্টিলাইজারের ক্যালকুলেটরে ${agriArea} ${agriUnit === 'bigha' ? 'বিঘা' : 'শতক'} ${agriCrop} ফসলের জন্য সারের হিসাব পেয়েছি। এই সারগুলি সংগ্রহ করতে চাই।`
    : `Hello! I used the crop calculator for ${agriArea} ${agriUnit} of ${agriCrop}. I would like to purchase these inputs.`;

  const aquaWhatsAppMsg = isBn
    ? `নমস্কার! আমি ${aquaArea} শতক পুকুরের জন্য পোনা ও চুন-খাদ্যের হিসাব পেয়েছি। আধুনিক মৎস্য খাদ্য ও পরামর্শের জন্য যোগাযোগ করছি।`
    : `Hello! I calculated fingerlings and feed for my ${aquaArea} decimal pond. Please share available feed stock.`;

  return (
    <div className="w-full bg-white dark:bg-[#071d15] rounded-3xl border border-forest/15 dark:border-white/10 shadow-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-forest to-[#0e4b37] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5 text-harvest" />
              {isBn ? 'কৃষক ও চাষীদের ডিজিটাল টুল' : 'Instant Agronomy & Aquaculture Estimator'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isBn ? 'জমি ও পুকুরের সার-পোনা ক্যালকুলেটর' : 'Smart Farm & Pond Calculator'}
            </h2>
            <p className="text-xs sm:text-sm text-cream/80 mt-1 max-w-xl">
              {isBn
                ? 'আপনার জমি বা পুকুরের পরিমাণ লিখুন — সঙ্গে সঙ্গে সারের সঠিক কেজি ও পোনার অনুপাত জেনে নিন।'
                : 'Enter your field or pond area to calculate scientific fertilizer dosage, lime, and stocking ratios.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('agri')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'agri'
                  ? 'bg-harvest text-forest shadow-md scale-102'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Sprout className="w-4 h-4" />
              {isBn ? 'ফসলি জমি (Crops)' : 'Crop Field'}
            </button>
            <button
              onClick={() => setActiveTab('aqua')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'aqua'
                  ? 'bg-cyan-400 text-[#071d15] shadow-md scale-102'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Fish className="w-4 h-4" />
              {isBn ? 'মাছের পুকুর (Fish)' : 'Fish Pond'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body: Agri Mode ── */}
      {activeTab === 'agri' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
            <div>
              <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1.5">
                {isBn ? 'ফসল নির্বাচন করুন' : 'Select Crop'}
              </label>
              <select
                value={agriCrop}
                onChange={(e) => setAgriCrop(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/30 text-sm font-bold focus:ring-2 focus:ring-forest"
              >
                <option value="paddy">{isBn ? 'ধান (Aman / Boro Paddy)' : 'Paddy (Rice)'}</option>
                <option value="mustard">{isBn ? 'সরিষা (Mustard / Toria)' : 'Mustard'}</option>
                <option value="potato">{isBn ? 'আলু (Potato)' : 'Potato'}</option>
                <option value="maize">{isBn ? 'ভুট্টা (Maize / Corn)' : 'Maize'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1.5">
                {isBn ? 'জমির পরিমাপ একক' : 'Area Unit'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAgriUnit('bigha')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    agriUnit === 'bigha'
                      ? 'border-forest bg-forest text-white'
                      : 'border-forest/20 bg-sand/30 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isBn ? 'বিঘা (Bigha)' : 'Bigha (~33 dec)'}
                </button>
                <button
                  type="button"
                  onClick={() => setAgriUnit('decimal')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    agriUnit === 'decimal'
                      ? 'border-forest bg-forest text-white'
                      : 'border-forest/20 bg-sand/30 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isBn ? 'শতক (Decimal)' : 'Decimal'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1.5">
                {isBn ? 'জমির পরিমাণ' : 'Land Size'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={agriArea}
                  onChange={(e) => setAgriArea(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/30 text-sm font-bold focus:ring-2 focus:ring-forest"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {agriUnit === 'bigha' ? (isBn ? 'বিঘা' : 'Bigha') : (isBn ? 'শতক' : 'Decimal')}
                </span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest dark:text-leaf uppercase tracking-wider">
                {isBn ? 'প্রস্তাবিত সারের পরিমাণ (Recommended Fertilizer Dose)' : 'Scientific Fertilizer Dosage'}:
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {agriArea} {agriUnit} ({decimalsCount.toFixed(1)} {isBn ? 'শতক সমতুল্য' : 'decimals'})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-sand/40 dark:bg-white/5 border border-forest/10 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">ইউরিয়া (Urea)</span>
                <span className="text-2xl font-black text-forest dark:text-white mt-1 block">
                  {agriResult.urea} <span className="text-xs font-normal">কেজি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">নাইট্রোজেন (N)</span>
              </div>

              <div className="p-4 rounded-2xl bg-sand/40 dark:bg-white/5 border border-forest/10 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">ডিএপি (DAP)</span>
                <span className="text-2xl font-black text-forest dark:text-white mt-1 block">
                  {agriResult.dap} <span className="text-xs font-normal">কেজি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">ফসফরাস ও নাইট্রোজেন</span>
              </div>

              <div className="p-4 rounded-2xl bg-sand/40 dark:bg-white/5 border border-forest/10 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">পটাশ (MOP)</span>
                <span className="text-2xl font-black text-forest dark:text-white mt-1 block">
                  {agriResult.mop} <span className="text-xs font-normal">কেজি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">দানা মজবুত ও ওজন</span>
              </div>

              <div className="p-4 rounded-2xl bg-sand/40 dark:bg-white/5 border border-forest/10 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">জিঙ্ক সালফেট (Zinc)</span>
                <span className="text-2xl font-black text-harvest mt-1 block">
                  {agriResult.zinc} <span className="text-xs font-normal">কেজি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">খায়রা রোগ ও কুশি বৃদ্ধি</span>
              </div>
            </div>

            {/* Practical Field Note */}
            <div className="p-4 rounded-2xl bg-forest/5 dark:bg-white/5 border border-forest/15 text-xs text-charcoal/80 dark:text-gray-300 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-forest dark:text-leaf shrink-0 mt-0.5" />
              <p className="leading-relaxed">{agriResult.notes}</p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/book-test"
                className="text-xs text-forest dark:text-leaf font-bold hover:underline flex items-center gap-1"
              >
                মাটির সঠিক pH ও উপাদানের জন্য টেস্ট বুক করুন &rarr;
              </Link>

              <a
                href={formatWhatsAppUrl(siteConfig.whatsapp, agriWhatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold shadow flex items-center justify-center gap-2 transition-all"
              >
                হোয়াটসঅ্যাপে এই সারের অর্ডার করুন
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Body: Aqua Mode ── */}
      {activeTab === 'aqua' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
            <div>
              <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1.5">
                {isBn ? 'পুকুরের জলের আয়তন (Area in Decimal)' : 'Pond Area (Decimal)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={aquaArea}
                  onChange={(e) => setAquaArea(Math.max(1, parseFloat(e.target.value) || 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cyan-500/30 dark:border-white/15 bg-sand/30 dark:bg-black/30 text-sm font-bold focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {isBn ? 'শতক' : 'Decimal'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1.5">
                {isBn ? 'জলের গড় গভীরতা (Water Depth)' : 'Average Depth'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={2}
                  max={12}
                  step={0.5}
                  value={aquaDepth}
                  onChange={(e) => setAquaDepth(Math.max(1, parseFloat(e.target.value) || 4))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cyan-500/30 dark:border-white/15 bg-sand/30 dark:bg-black/30 text-sm font-bold focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {isBn ? 'ফুট' : 'Feet'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                {isBn ? 'বৈজ্ঞানিক পোনা মজুত ও চুন প্রয়োগের মাত্রা' : 'Fingerling Stocking & Liming Ratio'}:
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {aquaArea} {isBn ? 'শতক পুকুর' : 'decimal pond'} ({aquaDepth} ft {isBn ? 'গভীরতা' : 'depth'})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-white/5 border border-cyan-500/20 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">কলিচুন (Lime)</span>
                <span className="text-2xl font-black text-cyan-800 dark:text-cyan-300 mt-1 block">
                  {limeRequired} <span className="text-xs font-normal">কেজি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">pH ও তলা শোধন</span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-white/5 border border-cyan-500/20 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">মোট পোনা (Seed)</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                  {fingerlingsTotal} <span className="text-xs font-normal">টি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">শতকে ৩৫টি আদর্শ</span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-white/5 border border-cyan-500/20 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">রুই মাছ (Column)</span>
                <span className="text-2xl font-black text-cyan-800 dark:text-cyan-300 mt-1 block">
                  {columnFish} <span className="text-xs font-normal">টি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">মাঝারি স্তরের খাদ্য</span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-white/5 border border-cyan-500/20 text-center">
                <span className="text-[11px] font-bold text-gray-500 block">কাতলা ও মৃগেল</span>
                <span className="text-2xl font-black text-forest dark:text-leaf mt-1 block">
                  {surfaceFish + bottomFish} <span className="text-xs font-normal">টি</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">উপরিভাগ ও তলার খাদ্য</span>
              </div>
            </div>

            {/* Daily Feed & Care Advice */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-charcoal/80 dark:text-gray-300 flex items-start gap-3">
              <Droplets className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>দৈনিক ভাসমান খাবারের প্রাক্কলন:</strong> বড় মাছে দৈনিক প্রায় <strong>{dailyFeedKg} কেজি</strong> ২৮% প্রোটিন যুক্ত ভাসমান খাদ্য দুই কিস্তিতে দিন। প্রতি ১৫ দিন পর পর অ্যামোনিয়া ও অক্সিজেনের মাত্রা পরীক্ষা করুন।
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/book-test"
                className="text-xs text-cyan-700 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                পুকুরের জল ও অ্যামোনিয়া টেস্ট বুক করুন (₹৩০০) &rarr;
              </Link>

              <a
                href={formatWhatsAppUrl(siteConfig.whatsapp, aquaWhatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold shadow flex items-center justify-center gap-2 transition-all"
              >
                মাছের খাদ্য ও ওষুধের জন্য যোগাযোগ করুন
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
