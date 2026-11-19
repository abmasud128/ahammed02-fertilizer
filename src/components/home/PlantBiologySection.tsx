'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import {
  Sprout,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  FlaskConical,
  ShieldCheck,
  Info,
} from 'lucide-react';

type AnatomyPart = 'roots' | 'stem' | 'panicle';

interface AnatomyDetail {
  id: AnatomyPart;
  title: string;
  titleBn: string;
  tag: string;
  tagBn: string;
  badgeColor: string;
  functionSummary: string;
  functionSummaryBn: string;
  farmingImpact: string[];
  farmingImpactBn: string[];
  recommendedFertilizer: string;
  recommendedFertilizerBn: string;
}

const ANATOMY_DATA: Record<AnatomyPart, AnatomyDetail> = {
  stem: {
    id: 'stem',
    title: 'Stem, Culm & Tillering Stalks',
    titleBn: 'উদ্ভিদের কাণ্ড, কুশি ও পরিবহন নালী',
    tag: 'Nutrient Superhighway',
    tagBn: 'পুষ্টি ও খাদ্য সঞ্চালন',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    functionSummary:
      'Houses internal vascular bundles (Xylem & Phloem) that translocate moisture and dissolved N-P-K nutrients upward from roots to leaves and grains.',
    functionSummaryBn:
      'কাণ্ডের জাইলেম ও ফ্লোয়েম নালী মাটির আর্দ্রতা ও সার মূল থেকে দ্রুত উপরের পাতায় এবং তৈরি খাদ্য দানায় পরিবহন করে।',
    farmingImpact: [
      'Rapidly absorbs foliar spray boosters, chelated Zinc, and systemic protective fungicides.',
      'Potassium (MOP) strengthens stem cell walls, preventing lodging (falling flat) during monsoons.',
      'Active tillering requires timely Urea top-dressing at 15–20 days after transplanting.',
    ],
    farmingImpactBn: [
      'পাতায় স্প্রে করা অনুখাদ্য (জিঙ্ক, বোরণ) ও ছত্রাকনাশক মাত্র ২ ঘণ্টায় শোষণ করে গাছে ছড়িয়ে দেয়।',
      'পটাশ (MOP) সারের ব্যবহারে কাণ্ড শক্ত হয়, ফলে ঝড়-বৃষ্টিতে গাছ মাটিতে নুয়ে পড়া (লজিং) রোধ পায়।',
      'চারা রোপণের ১৫-২০ দিনের মধ্যে সঠিক ইউরিয়া টপ-ড্রেসিংয়ে সর্বোচ্চ কুশি বা টিলার তৈরি হয়।',
    ],
    recommendedFertilizer: 'Urea (46% N) + MOP (Potash) + Chelated Foliar Zinc',
    recommendedFertilizerBn: 'ইউরিয়া (টপ-ড্রেসিং) + পটাশ (শক্ত কাণ্ড) + চিলেটেড জিংক',
  },
  roots: {
    id: 'roots',
    title: 'Fibrous Root Crown & Micro-Root Hairs',
    titleBn: 'সুদৃঢ় মূল ও ফাইব্রাস শিকড় বিস্তার',
    tag: 'Foundation & Soil Anchor',
    tagBn: 'মাটি আঁকড়ে ধরা ও পুষ্টি শোষণ',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    functionSummary:
      'The multi-tiered fibrous root system anchors the plant deep in clay-loam soil while microscopic root hairs absorb dissolved minerals, phosphorus, and moisture.',
    functionSummaryBn:
      'মাটির গভীরে বিস্তার লাভ করে গাছকে শক্তভাবে ধরে রাখে এবং মাটির কণা থেকে ফসফরাস, নাইট্রোজেন ও প্রয়োজনীয় জল চুষে নেয়।',
    farmingImpact: [
      'Phosphorus (DAP) must be applied as basal fertilizer during final plowing so emerging roots can reach it immediately.',
      'Mycorrhiza bio-fertilizers symbiotically extend the root reach by up to 300% in local Dakshin Dinajpur soils.',
      'Deep, healthy roots protect crops against drought stress and intermittent dry spells during the season.',
    ],
    farmingImpactBn: [
      'ডিএপি (DAP) সার জমি তৈরির শেষ চাষেই প্রয়োগ করতে হবে, যাতে কচি শিকড় বের হওয়ামাত্রই ফসফরাস পায়।',
      'মাইকোরাইজা জৈব অনুখাদ্য প্রয়োগে শিকড়ের শাখা-প্রশাখা ৩০০% পর্যন্ত বৃদ্ধি পায় ও মাটি নরম রাখে।',
      'গভীর শিকড় খরা বা অনাবৃষ্টির সময় মাটির নিচ থেকে আর্দ্রতা ধরে রেখে ফসলকে সতেজ রাখে।',
    ],
    recommendedFertilizer: 'DAP (18:46:0) + Granular Mycorrhiza + Organic Bio-Compost',
    recommendedFertilizerBn: 'ডিএপি (মূল সার) + দানাদার মাইকোরাইজা + জৈব সার',
  },
  panicle: {
    id: 'panicle',
    title: 'Grain Panicle & Yield Maturation',
    titleBn: 'সোনালী ধানের শিষ ও দানা পুষ্টকরণ',
    tag: 'Harvest Yield Center',
    tagBn: 'সর্বোচ্চ ফলন ও দানার ওজন',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    functionSummary:
      'The reproductive terminal where photosynthetic starches accumulate to form full, heavy, golden grain kernels.',
    functionSummaryBn:
      'গাছের প্রধান ফলন অংশ, যেখানে সালোকসংশ্লেষণের পুষ্টি জমা হয়ে প্রতিটি দানা চকচকে, ভারী ও পুষ্ট হয়।',
    farmingImpact: [
      'Boron 20% foliar spray during pre-flowering prevents empty unfertilized grain chaff (চিটা দূরীকরণ).',
      'Prophylactic fungicide spray prevents destructive neck blast disease from cutting off nutrient flow to the panicle.',
      'Final top-dressing timing ensures higher 1,000-grain test weight and prime mandi market pricing.',
    ],
    farmingImpactBn: [
      'থোড় আসার সময় বোরণ ২০% স্প্রে করলে ধানে চিটা হওয়া বন্ধ হয় এবং দানার পুষ্টি নিশ্চিত হয়।',
      'শীষ আসার মুখে আগাম ছত্রাকনাশক স্প্রে ব্লাস্ট রোগ থেকে শিষের গোড়া পচে যাওয়া রক্ষা করে।',
      'সঠিক পুষ্টি ব্যবস্থাপনায় ধানের দানার ওজন ও চকচকে ভাব বেড়ে বাজারে সর্বোচ্চ দর পাওয়া যায়।',
    ],
    recommendedFertilizer: 'Soluble Boron 20% + 0:0:50 Potash Spray + Tricyclazole',
    recommendedFertilizerBn: 'সলিউবল বোরণ ২০% + ০:০:৫০ স্প্রে + ট্রাইসাইক্লাজোল',
  },
};

export default function PlantBiologySection() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';
  const [selectedPart, setSelectedPart] = useState<AnatomyPart>('roots');

  const current = ANATOMY_DATA[selectedPart];

  return (
    <section
      className="relative py-10 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
      style={{ backgroundImage: `url('/images/backgrounds/bg-plant-biology.jpg')` }}
    >
      {/* Subtle edge vignette strictly for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header (Compact & Proportional) */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-harvest/20 text-harvest border border-harvest/40 mb-2 backdrop-blur-md">
            <Sprout className="w-3.5 h-3.5 text-harvest" />
            {isBn ? 'উদ্ভিদ শারীরবিদ্যা ও সার বিজ্ঞান' : 'Educational Plant Biology & Crop Science'}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {isBn ? (
              <>
                শিকড় থেকে সোনালী শিষ — <span className="text-harvest">সঠিক সারে সুস্থ উদ্ভিদের বিকাশ</span>
              </>
            ) : (
              <>
                Roots, Stems & Grains — <span className="text-harvest">The Biology of Higher Yields</span>
              </>
            )}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-cream/90 leading-relaxed max-w-2xl mx-auto">
            {isBn
              ? 'নিচের ছবিতে শিকড় ও কাণ্ডের ওপর ক্লিক করে দেখুন কিভাবে সার ও পুষ্টি উপাদান ফসলের বিভিন্ন অংশে কাজ করে ফলন বহুগুণ বাড়ায়।'
              : 'Explore the anatomy of a real crop plant. Learn how specific fertilizers target the root network vs. stem foliage to maximize your farm yield.'}
          </p>
        </div>

        {/* 2-Column Clean Educational Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: Uncropped Real-Life Botanical Crop Photograph with Visual Pointers (Cols 1-6) ── */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-[420px] rounded-2xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl shadow-2xl p-2.5 sm:p-3 overflow-hidden">
              
              {/* Botanical Specimen Image Container (Viewport-optimized height) */}
              <div className="relative w-full h-[320px] sm:h-[350px] md:h-[380px] lg:h-[400px] rounded-xl overflow-hidden bg-white/95 border border-white/20 flex items-center justify-center">
                <Image
                  src="/images/education/plant-anatomy-crop.jpg"
                  alt={isBn ? 'সম্পূর্ণ সুস্থ ধান গাছের বাস্তব উদ্ভিদ শারীরবিদ্যা' : 'Complete uncropped botanical specimen photograph of healthy agricultural rice plant showing panicle, stem, and root network'}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-contain p-2"
                />

                {/* ── Visual Callout Pin 1: Grain Panicle (Top) ── */}
                <div className="absolute top-[10%] right-[8%] sm:right-[12%] z-20">
                  <button
                    type="button"
                    onClick={() => setSelectedPart('panicle')}
                    className={`group relative flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl border backdrop-blur-md shadow-xl transition-all cursor-pointer ${
                      selectedPart === 'panicle'
                        ? 'bg-forest text-white border-harvest scale-105 ring-2 ring-harvest'
                        : 'bg-white/90 text-forest border-gray-300 hover:border-harvest'
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
                      🌾 {isBn ? 'শিষ ও দানা' : 'Grain Panicle'}
                    </span>
                  </button>
                  {/* Visual Indicator Line to Grain Head */}
                  <div className="w-8 sm:w-10 h-0.5 bg-yellow-400/80 transform -rotate-12 -translate-x-6 sm:-translate-x-8 mt-1 pointer-events-none" />
                </div>

                {/* ── Visual Callout Pin 2: Stem & Foliage (Middle) ── */}
                <div className="absolute top-[44%] left-[5%] sm:left-[8%] z-20">
                  <button
                    type="button"
                    onClick={() => setSelectedPart('stem')}
                    className={`group relative flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl border backdrop-blur-md shadow-xl transition-all cursor-pointer ${
                      selectedPart === 'stem'
                        ? 'bg-forest text-white border-emerald-400 scale-105 ring-2 ring-emerald-400'
                        : 'bg-white/90 text-forest border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
                      🌿 {isBn ? 'কাণ্ড ও কুশি' : 'Stem & Stalk'}
                    </span>
                  </button>
                  {/* Visual Indicator Line to Stem */}
                  <div className="w-8 sm:w-12 h-0.5 bg-emerald-400/80 transform rotate-6 translate-x-16 sm:translate-x-24 -mt-1 pointer-events-none" />
                </div>

                {/* ── Visual Callout Pin 3: Roots (Bottom) ── */}
                <div className="absolute bottom-[8%] right-[6%] sm:right-[10%] z-20">
                  <button
                    type="button"
                    onClick={() => setSelectedPart('roots')}
                    className={`group relative flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl border backdrop-blur-md shadow-xl transition-all cursor-pointer ${
                      selectedPart === 'roots'
                        ? 'bg-forest text-white border-amber-400 scale-105 ring-2 ring-amber-400'
                        : 'bg-white/90 text-forest border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
                      🌰 {isBn ? 'সুদৃঢ় মূল' : 'Root System'}
                    </span>
                  </button>
                  {/* Visual Indicator Line to Roots */}
                  <div className="w-8 sm:w-10 h-0.5 bg-amber-500/80 transform -rotate-15 -translate-x-6 sm:-translate-x-10 mt-1 pointer-events-none" />
                </div>

              </div>

              {/* Plant Card Footer */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-cream/75 px-1.5">
                <span>📸 {isBn ? 'বাস্তব শস্য চিত্র' : 'Uncropped Crop Specimen'}</span>
                <span className="text-harvest font-semibold">
                  {isBn ? 'ক্লিক করে দেখুন' : 'Click labels to inspect'}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Detailed Biology & Farming Impact Dossier (Cols 7-12) ── */}
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            
            {/* Quick Part Switcher Tabs */}
            <div className="flex rounded-xl p-1 bg-forest/80 dark:bg-[#071d15]/85 border border-white/20 backdrop-blur-md shadow-md">
              {(['roots', 'stem', 'panicle'] as AnatomyPart[]).map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => setSelectedPart(part)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedPart === part
                      ? 'bg-harvest text-forest font-black shadow-md shadow-amber-950/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {part === 'roots'
                    ? (isBn ? '🌰 শিকড় ও মূল' : 'Root Network')
                    : part === 'stem'
                    ? (isBn ? '🌿 কাণ্ড ও কুশি' : 'Stem & Foliage')
                    : (isBn ? '🌾 শিষ ও দানা' : 'Panicle & Grain')}
                </button>
              ))}
            </div>

            {/* Dynamic Educational Content Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 shadow-2xl text-white"
              >
                {/* Header of Active Part */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${current.badgeColor} mb-1`}>
                      {isBn ? current.tagBn : current.tag}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {isBn ? current.titleBn : current.title}
                    </h3>
                  </div>
                </div>

                {/* Biological Function */}
                <div className="mt-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-harvest mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-harvest" />
                    {isBn ? 'উদ্ভিদ বিজ্ঞান ও কার্যপ্রণালী' : 'Biological Function & Mechanism'}
                  </h4>
                  <p className="text-xs sm:text-sm text-cream/90 leading-relaxed font-normal">
                    {isBn ? current.functionSummaryBn : current.functionSummary}
                  </p>
                </div>

                {/* How It Helps in the Farming Process */}
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {isBn ? 'চাষের প্রক্রিয়ায় এর ভূমিকা ও সার প্রয়োগ' : 'How This Impacts the Farming Process'}
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-[13px] text-cream/90">
                    {(isBn ? current.farmingImpactBn : current.farmingImpact).map((impact, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-harvest/20 text-harvest border border-harvest/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Fertilizers & Inputs Card */}
                <div className="mt-3.5 p-3 rounded-xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-harvest block">
                      {isBn ? 'অনুমোদিত সার ও উপকরণ:' : 'Targeted Agri-Input Strategy:'}
                    </span>
                    <span className="text-xs sm:text-[13px] font-extrabold text-white">
                      {isBn ? current.recommendedFertilizerBn : current.recommendedFertilizer}
                    </span>
                  </div>
                  <Link
                    href="/products"
                    className="px-3 py-1.5 rounded-lg bg-harvest hover:bg-harvest/90 text-forest font-black text-xs shadow-md transition-all whitespace-nowrap shrink-0"
                  >
                    {isBn ? 'পণ্য দেখুন' : 'View Products'} →
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
