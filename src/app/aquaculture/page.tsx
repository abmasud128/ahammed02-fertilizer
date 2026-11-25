'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { formatWhatsAppUrl } from '@/lib/utils';
import {
  Fish,
  Droplets,
  Waves,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Phone,
  Layers,
  FlaskConical,
  AlertTriangle,
  Zap,
  Calculator,
  HelpCircle,
  Scale,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function DedicatedAquaculturePage() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  // Calculator State
  const [pondArea, setPondArea] = useState<number>(50); // 50 decimals
  const [pondDepth, setPondDepth] = useState<number>(4.5); // 4.5 feet
  const [cultureType, setCultureType] = useState<'imc' | 'catfish' | 'mixed'>('imc');

  // Interactive Troubleshooter State
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number>(0);

  // Calculations (1 decimal = 40.46 m², 1 ft = 0.3048 m, 1 m³ = 1000 L = 0.01 Lakh L)
  const pondWaterVolumeLakhLitre = Math.round(pondArea * 40.46 * pondDepth * 0.3048) / 100;
  
  // Fingerling stocking rules
  const fingerlingsPerDecimal = cultureType === 'imc' ? 40 : cultureType === 'catfish' ? 120 : 60;
  const totalFingerlings = Math.round(pondArea * fingerlingsPerDecimal);
  
  const speciesBreakdown = cultureType === 'imc' ? [
    { name: isBn ? 'রুই (Rohu)' : 'Rohu (Labeo rohita)', share: '35%', count: Math.round(totalFingerlings * 0.35) },
    { name: isBn ? 'কাতলা (Catla)' : 'Catla (Gibelion catla)', share: '25%', count: Math.round(totalFingerlings * 0.25) },
    { name: isBn ? 'মৃগেল (Mrigal)' : 'Mrigal (Cirrhinus mrigala)', share: '25%', count: Math.round(totalFingerlings * 0.25) },
    { name: isBn ? 'গ্রাস কার্প / সিলভার' : 'Grass / Silver Carp', share: '15%', count: Math.round(totalFingerlings * 0.15) },
  ] : [
    { name: isBn ? 'মাগুর ও শিঙি' : 'Magur & Singhi', share: '60%', count: Math.round(totalFingerlings * 0.60) },
    { name: isBn ? 'পাবদা ও গুলশা' : 'Pabda & Gulsha', share: '40%', count: Math.round(totalFingerlings * 0.40) },
  ];

  // Lime (Quicklime / Dolomite) requirement
  const limeRequiredKg = Math.round(pondArea * 1.5);
  // Monthly maintenance zeolite
  const zeoliteRequiredKg = Math.round(pondArea * 2.0);
  // Daily Feed estimate for 200g average biomass
  const dailyFeedKg = Math.round((totalFingerlings * 0.2 * 0.035) * 10) / 10;

  const troubleshooterIssues = [
    {
      id: 'hypoxia',
      title: isBn ? 'ভোরে মাছ ভেসে ওঠা ও খাবি খাওয়া' : 'Fish Gasping at Dawn (Hypoxia)',
      severity: 'critical',
      badge: isBn ? 'জরুরি বিপদ' : 'Critical Hazard',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      cause: isBn
        ? 'রাতের বেলা আলো না থাকায় সালোকসংশ্লেষণ বন্ধ হয়ে এবং অতিরিক্ত মাছ/শ্যাওলার কারণে দ্রবীভূত অক্সিজেন (DO) ২ mg/L এর নিচে নেমে যায়।'
        : 'Nighttime photosynthesis cessation combined with high density or dense algae causes Dissolved Oxygen (DO) to drop below 2.0 mg/L.',
      action: isBn
        ? 'তাৎক্ষণিক পদক্ষেপ: পুকুরের জল পাম্প দিয়ে উপর থেকে ছিটিয়ে বা এয়রেটর চালিয়ে অক্সিজেন বাড়ান। Oxy-Quick বা সোডিয়াম পারকার্বোনেট ট্যাবলেট শতকে ২৫-৩০ গ্রাম হারে ছিটান।'
        : 'Immediate action: Turn on paddle aerators or splash water with pumps. Broadcast Oxy-Quick effervescent tablets @ 25-30g/decimal.',
      product: isBn ? 'Oxy-Quick ট্যাবলেট ও প্যাডেল এয়ারেটর' : 'Oxy-Quick Tablets & Aerators',
    },
    {
      id: 'ammonia',
      title: isBn ? 'তলদেশে বিষাক্ত গ্যাস ও অ্যামোনিয়া বৃদ্ধি' : 'Bottom Toxic Ammonia Gas (NH3)',
      severity: 'high',
      badge: isBn ? 'উচ্চ ঝুঁকি' : 'High Risk',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      cause: isBn
        ? 'পুকুরের তলদেশে অতিরিক্ত না-খাওয়া খাবার, মাছের মল ও পচা পাতা জমে বিষাক্ত অ্যামোনিয়া (NH3 > 0.1 mg/L) তৈরি করে।'
        : 'Excess uneaten feed, accumulated fish excreta, and organic sludge decompose anaerobically, elevating toxic unionized ammonia.',
      action: isBn
        ? 'তাৎক্ষণিক পদক্ষেপ: খাদ্য প্রয়োগ ২৫% কমিয়ে দিন। প্রতি শতকে ২-৩ কেজি অ্যাক্টিভেটেড জিওলাইট ও উপকারি ব্যাক্টেরিয়া প্রোবায়োটিক প্রয়োগ করে গ্যাস নিষ্কাশন করুন।'
        : 'Immediate action: Cut feeding by 25%. Apply activated Zeolite granules @ 2-3 kg/decimal and broadcast beneficial probiotic bacteria.',
      product: isBn ? 'অ্যাক্টিভ জিওলাইট ও পুকুর প্রোবায়োটিক' : 'Activated Zeolite & Aqua Probiotics',
    },
    {
      id: 'algae',
      title: isBn ? 'অতিরিক্ত ঘন সবুজ জল ও শ্যাওলা স্তর' : 'Excessive Algal Bloom (Green Scum)',
      severity: 'moderate',
      badge: isBn ? 'সতর্কতা' : 'Warning',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      cause: isBn
        ? 'জলে অতিরিক্ত নাইট্রোজেন ও ফসফেটের কারণে নীল-সবুজ শ্যাওলার অতিবৃদ্ধি ঘটে, যা দিনের বেলা pH ১০ এর ওপরে নিয়ে যায়।'
        : 'Hyper-eutrophication from excess nutrients triggers blue-green cyanobacteria blooms, spiking afternoon pH above 9.5.',
      action: isBn
        ? 'তাৎক্ষণিক পদক্ষেপ: রাসায়নিক সার ও অতিরিক্ত ফিড দেওয়া সাময়িকভাবে বন্ধ রাখুন। শতকে ৩০০ গ্রাম চুন ও ২৫০ গ্রাম পটাশ দিন।'
        : 'Immediate action: Cease chemical fertilization. Apply agricultural gypsum or dolomite @ 300g/decimal and flush partial fresh water.',
      product: isBn ? 'ডলোমাইট চুন ও স্বচ্ছ জল কিট' : 'Dolomite Lime & Plankton Regulator',
    },
    {
      id: 'fin-rot',
      title: isBn ? 'লেজ-পাখনা পচা ও ক্ষতরোগ' : 'Fin Rot, Red Spot & Ulcer Disease',
      severity: 'high',
      badge: isBn ? 'জীবাণু সংক্রমণ' : 'Infection',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      cause: isBn
        ? 'জলের দুর্বল গুণমান এবং অ্যারোমোনাস ও সিউডোমোনাস ব্যাকটেরিয়ার সংক্রমণে মাছের গায়ে ক্ষত ও লালচে দাগ দেখা দেয়।'
        : 'Pathogenic bacterial attack (Aeromonas / Pseudomonas) exacerbated by poor water sanitation and seasonal cold-water stress.',
      action: isBn
        ? 'তাৎক্ষণিক পদক্ষেপ: প্রতি শতকে ৫-৮ মিলি BKC 80% বা পটাশিয়াম পারম্যাঙ্গানেট স্প্রে করে পুকুর জীবাণুমুক্ত করুন।'
        : 'Immediate action: Disinfect pond water with BKC 80% (Benzalkonium Chloride) @ 5-8 ml/decimal. Blend medicated feed if ulcers persist.',
      product: isBn ? 'BKC 80% ও সিপ্রোফ্লক্সাসিন অ্যান্টিবায়োটিক' : 'BKC 80% Sanitizer & Cipro Aqua',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest via-[#08291c] to-[#04160f] text-cream">
      
      {/* ── 1. DEDICATED AQUACULTURE HERO BANNER ── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 px-4 overflow-hidden border-b border-cyan-500/20">
        {/* Glow Orbs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 left-1/4 w-80 h-80 bg-leaf/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Headline & CTAs (Cols 1-7) */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md">
                <Waves className="w-4 h-4" />
                {isBn ? 'দক্ষিণ দিনাজপুর বৈজ্ঞানিক মৎস্য চাষ কেন্দ্র' : 'Scientific Aquaculture & Fishery Hub'}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {isBn ? (
                  <>
                    পুকুরের পানির গুণমান ও <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400">
                      মাছের দ্রুত বৃদ্ধির খাঁটি সমাধান
                    </span>
                  </>
                ) : (
                  <>
                    Precision Pond Science & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400">
                      High-Yield Aquaculture Inputs
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-cream/85 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {isBn
                  ? 'চাপমাটালি স্টোর থেকে সিপি ও গোদরেজের খাঁটি ভাসমান মাছের খাদ্য, জরুরি অক্সিজেন ট্যাবলেট, তলদেশের গ্যাস শোধক জিওলাইট ও পুকুরের জল পরীক্ষা সেবা।'
                  : 'Empowering fish farmers with premium floating feeds (28–32% protein), fast-acting emergency DO tablets, activated zeolite, and on-site pond water lab diagnostics.'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="/book-test"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-950/40 flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FlaskConical className="w-5 h-5" />
                  <span>{isBn ? 'পুকুরের জল টেস্ট বুক করুন' : 'Book Pond Water Test'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/farmer/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-md flex items-center gap-2 transition-colors"
                >
                  <Fish className="w-5 h-5 text-cyan-300" />
                  <span>{isBn ? 'চাষী মৎস্য পোর্টাল' : 'Farmer Aqua Portal'}</span>
                </Link>

                <a
                  href={`tel:${siteConfig.phone}`}
                  className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-cream font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-harvest" />
                  <span>{isBn ? 'জরুরি কল: ৯০৯১০১৭০৩৫' : `Call: ${siteConfig.phone}`}</span>
                </a>
              </div>

              {/* Quick Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-left border-t border-white/15">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-300">28–32%</div>
                  <div className="text-[11px] text-cream/70 font-medium">{isBn ? 'প্রোটিনযুক্ত খাদ্য' : 'Protein Feeds'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">24-48h</div>
                  <div className="text-[11px] text-cream/70 font-medium">{isBn ? 'ল্যাব টেস্ট রিপোর্ট' : 'DO & NH3 Lab'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-harvest">100%</div>
                  <div className="text-[11px] text-cream/70 font-medium">{isBn ? 'খাঁটি ব্র্যান্ড ফিড' : 'Certified Brands'}</div>
                </div>
              </div>
            </div>

            {/* Right Showcase: Real-Life Natural Photography (Cols 8-12) */}
            <div className="lg:col-span-5 relative flex flex-col gap-4">
              
              {/* Primary Real-Life Aerated Pond Image */}
              <div className="relative w-full h-[260px] sm:h-[320px] rounded-3xl overflow-hidden border-2 border-cyan-400/30 shadow-2xl group bg-black/40">
                <Image
                  src="/images/hero/aquaculture-fish-pond.jpg"
                  alt={isBn ? 'পশ্চিমবঙ্গের পরিষ্কার মিষ্টি পানির পুকুরে এয়ারেটর ও মাছের নিবিড় পরিচর্যা' : 'Scenic aerated freshwater fish farming pond with mechanical paddle wheel aerator in Bengal'}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/90 border border-cyan-400/40 text-xs font-bold text-cyan-300 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    {isBn ? 'সক্রিয় এয়ারেটর ও অক্সিজেন সমৃদ্ধ' : 'High Dissolved Oxygen'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold text-white drop-shadow">
                    {isBn ? 'বৈজ্ঞানিক মাছ চাষ ও নিয়মিত পরিচর্যা' : 'Modern Freshwater Carp & Catfish Farming'}
                  </h3>
                  <p className="text-xs text-cream/80 line-clamp-1 mt-0.5">
                    {isBn ? 'অক্সিজেন স্তর, পানির পিএইচ ও তলদেশের গ্যাস নিয়ন্ত্রণ' : 'Optimized DO, pH balance, and low ammonia levels for rapid FCR.'}
                  </p>
                </div>
              </div>

              {/* Secondary Real-Life Fish Harvest Photo Card */}
              <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden border border-white/20 shadow-xl group bg-black/40">
                <Image
                  src="/images/aqua/fish-harvest-bengal.jpg"
                  alt={isBn ? 'বাংলার পুকুরে জাল টেনে রুপালি রুই ও কাতলা মাছ আহরণ' : 'Freshwater fish harvest in Bengal pond showing healthy splashing carps in traditional drag nets'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-bold text-harvest block">
                      {isBn ? 'বাম্পার মাছের আহরণ' : 'Healthy Bumper Harvest'}
                    </span>
                    <span className="text-[11px] text-cream/80">
                      {isBn ? 'রুই, কাতলা ও মৃগেল মাছের খাঁটি ফলন' : 'High survival rates with balanced nutrition'}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-cyan-500/25 border border-cyan-400/40 text-cyan-200">
                    {isBn ? 'প্রমাণিত মান' : 'Verified'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 2. MOVED WIDGETS: AQUACULTURE PRODUCTS & SERVICES SHOWCASE ── */}
      <section className="py-16 px-4 bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {isBn ? 'মৎস্য উপকরণ ও জরুরি সমাধান' : 'Aqua Inputs & Emergency Solutions'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {isBn ? 'পুকুরের প্রতিটি সমস্যার সঠিক সমাধান' : 'Complete Aquaculture Management Hub'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-cream/75">
              {isBn
                ? 'সিপি ও গোদরেজের খাদ্য থেকে শুরু করে জরুরি অক্সিজেন ট্যাবলেট ও পানির টেস্ট কিট।'
                : 'Direct access to certified floating feeds, water conditioners, emergency DO chemicals, and lab testing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Fish,
                badge: isBn ? 'উচ্চ বৃদ্ধি' : 'High FCR',
                badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                title: isBn ? 'সুষম ভাসমান মাছের খাদ্য' : 'Floating Fish Feed (28%-32%)',
                desc: isBn
                  ? 'সিপি ও গোদরেজের উন্নত ভাসমান ফিড। জলে সহজে নষ্ট হয় না, দ্রুত ওজন বাড়ায় ও এফসিআর কমায়।'
                  : 'Premium floating extruded feed minimizing water waste and accelerating harvest weight.',
                tag: 'CP & Godrej Feeds',
              },
              {
                icon: Zap,
                badge: isBn ? 'জরুরি সুরক্ষা' : 'Emergency DO',
                badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                title: isBn ? 'জরুরি অক্সিজেন ও গ্যাস নাশক' : 'Emergency Oxygen & Zeolite',
                desc: isBn
                  ? 'ভোরে মাছ ভেসে উঠলে দ্রুত অক্সিজেন বুস্টার ট্যাবলেট এবং তলদেশের অ্যামোনিয়া শোধক জিওলাইট।'
                  : 'Rapid DO tablets for dawn hypoxia and natural activated zeolite for bottom gas relief.',
                tag: 'Oxy-Quick & Zeolite',
              },
              {
                icon: ShieldCheck,
                badge: isBn ? 'জীবাণুমুক্ত' : 'Bio-Security',
                badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                title: isBn ? 'পুকুর শোধন ও রোগ প্রতিরোধ' : 'Pond Sanitizer & BKC 80%',
                desc: isBn
                  ? 'মাছের ফুলকা পচা, লেজ-পাখনা পচা ও ক্ষতরোগ প্রতিরোধে প্রমাণিত ডিসইনফেক্ট্যান্ট ও প্রোবায়োটিক।'
                  : 'Broad-spectrum water sanitizers and beneficial probiotics preventing microbial diseases.',
                tag: 'BKC 80% & Probiotics',
              },
              {
                icon: FlaskConical,
                badge: isBn ? 'ল্যাব টেস্ট' : 'Lab Tested',
                badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                title: isBn ? 'ডিজিটাল জল ও অ্যামোনিয়া টেস্ট' : 'Digital Water Testing Lab',
                desc: isBn
                  ? 'ল্যাবে ডিজিটাল কিট দিয়ে পুকুরের pH, অ্যামোনিয়া (NH3), ক্ষারত্ব ও দ্রবীভূত অক্সিজেন পরীক্ষা।'
                  : 'Scientific parameter analysis (pH, DO, NH3, Alkalinity) with customized agronomic advice.',
                tag: '24h Water Report',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl bg-forest/80 border border-white/20 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-cyan-400/50 transition-all duration-300 group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-cream/75 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-harvest font-semibold">
                    <span>{card.tag}</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 3. MOVED WIDGET: INTERACTIVE AQUACULTURE DOSAGE & STOCKING CALCULATOR ── */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-[#062419] to-transparent">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-harvest/20 text-harvest border border-harvest/40 mb-3">
              <Calculator className="w-4 h-4" />
              {isBn ? 'মৎস্য বিজ্ঞান হিসাবযন্ত্র' : 'Scientific Aqua Calculator'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'পোনা মজুদ, চুন, জিওলাইট ও দৈনিক খাদ্যের হিসাব' : 'Pond Stocking, Lime, Zeolite & Feed Calculator'}
            </h2>
            <p className="text-sm text-cream/75 mt-2">
              {isBn
                ? 'পুকুরের আয়তন ও গভীরতা দিন — পোনা সংখ্যা, চুন ও খাদ্য চাহিদা স্বয়ংক্রিয়ভাবে জেনে নিন।'
                : 'Enter your pond area and water depth to calculate stocking ratios, lime dosages, and feeding requirements.'}
            </p>
          </div>

          <div className="rounded-3xl bg-forest/90 border border-white/20 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Controls Column (Cols 1-5) */}
              <div className="md:col-span-5 space-y-5">
                {/* Culture Type */}
                <div>
                  <label className="block text-xs font-bold text-cream/80 uppercase tracking-wider mb-2">
                    {isBn ? 'চাষের ধরণ' : 'Culture Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCultureType('imc')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left ${
                        cultureType === 'imc'
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                          : 'bg-white/5 text-cream/80 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      🐟 {isBn ? 'কার্প মাছ (IMC)' : 'Indian Major Carps'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCultureType('catfish')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left ${
                        cultureType === 'catfish'
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                          : 'bg-white/5 text-cream/80 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      🐡 {isBn ? 'ক্যাটফিশ / মাগুর' : 'Catfish / Singhi'}
                    </button>
                  </div>
                </div>

                {/* Pond Area Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-cream/80 uppercase tracking-wider">
                      {isBn ? 'পুকুরের আয়তন' : 'Pond Area'}
                    </label>
                    <span className="text-sm font-extrabold text-cyan-300">
                      {pondArea} {isBn ? 'শতক' : 'decimals'} ({(pondArea / 33).toFixed(1)} {isBn ? 'বিঘা' : 'bigha'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={pondArea}
                    onChange={(e) => setPondArea(parseInt(e.target.value) || 10)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-cream/50 mt-1">
                    <span>10 শতক</span>
                    <span>100 শতক (~3 বিঘা)</span>
                    <span>200 শতক</span>
                  </div>
                </div>

                {/* Water Depth Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-cream/80 uppercase tracking-wider">
                      {isBn ? 'পানির গড় গভীরতা' : 'Average Water Depth'}
                    </label>
                    <span className="text-sm font-extrabold text-cyan-300">
                      {pondDepth} {isBn ? 'ফুট' : 'feet'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    step={0.5}
                    value={pondDepth}
                    onChange={(e) => setPondDepth(parseFloat(e.target.value) || 3)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-cream/50 mt-1">
                    <span>3 ft</span>
                    <span>4.5 ft (আদর্শ)</span>
                    <span>8 ft</span>
                  </div>
                </div>
              </div>

              {/* Results Column (Cols 6-12) */}
              <div className="md:col-span-7 bg-white/5 rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {isBn ? 'হিসাবকৃত চাহিদা ও রেশনিং' : 'Calculated Requirements'}
                    </span>
                    <span className="text-xs text-cyan-300 font-semibold">
                      ~{pondWaterVolumeLakhLitre} {isBn ? 'লক্ষ লিটার পানি' : 'Lakh Litres Water'}
                    </span>
                  </div>

                  {/* 4 Stat Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-forest/80 border border-white/15 text-center">
                      <span className="text-[10px] text-cream/70 font-semibold uppercase block">পোনা সংখ্যা</span>
                      <span className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5 block">{totalFingerlings}</span>
                      <span className="text-[10px] text-cream/50">পিস (Pieces)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-forest/80 border border-white/15 text-center">
                      <span className="text-[10px] text-cream/70 font-semibold uppercase block">চুন চাহিদা</span>
                      <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">{limeRequiredKg}</span>
                      <span className="text-[10px] text-cream/50">কেজি (Dolomite)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-forest/80 border border-white/15 text-center">
                      <span className="text-[10px] text-cream/70 font-semibold uppercase block">জিওলাইট</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">{zeoliteRequiredKg}</span>
                      <span className="text-[10px] text-cream/50">কেজি (Zeolite)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-forest/80 border border-white/15 text-center">
                      <span className="text-[10px] text-cream/70 font-semibold uppercase block">দৈনিক ফিড</span>
                      <span className="text-xl sm:text-2xl font-black text-harvest mt-0.5 block">{dailyFeedKg}</span>
                      <span className="text-[10px] text-cream/50">কেজি / দিন</span>
                    </div>
                  </div>

                  {/* Species Breakdown */}
                  <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/10">
                    <span className="text-[11px] font-bold text-harvest block mb-2">
                      {isBn ? 'সুষম পোনা মজুদের অনুপাত (Carp Stocking Ratio):' : 'Recommended Species Ratio:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-cream/90">
                      {speciesBreakdown.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>• {s.name}:</span>
                          <span className="font-bold text-cyan-200">{s.count} টি ({s.share})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action */}
                <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={formatWhatsAppUrl(
                      siteConfig.whatsapp,
                      isBn
                        ? `নমস্কার! আহাম্মেদ ফার্টিলাইজারের মৎস্য ক্যালকুলেটরে আমার ${pondArea} শতক পুকুরের জন্য পোনা (${totalFingerlings} টি), চুন (${limeRequiredKg} কেজি) ও ভাসমান ফিডের বিষয়ে পরামর্শ চাই।`
                        : `Hello! I calculated requirements for my ${pondArea} decimal fish pond (Fingerlings: ${totalFingerlings}, Lime: ${limeRequiredKg} kg, Daily Feed: ${dailyFeedKg} kg). Please assist me with feed supply.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                  >
                    <span>💬</span>
                    <span>{isBn ? 'হোয়াটসঅ্যাপে ফিড ও চুন অর্ডার করুন' : 'Order Feed & Lime on WhatsApp'}</span>
                  </a>
                  <Link
                    href="/farmer/feed"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:underline"
                  >
                    <span>{isBn ? 'দৈনিক খাদ্য ট্র্যাক করুন' : 'Log Feed in Farmer Portal'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 4. POND EMERGENCIES & INTERACTIVE TROUBLESHOOTER ── */}
      <section className="py-16 md:py-24 px-4 bg-white/5 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-3">
              <AlertTriangle className="w-4 h-4" />
              {isBn ? 'পুকুরের জরুরি সমস্যা সমাধান' : 'Pond Emergencies & Diagnostics'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'মাছের রোগ ও জরুরি লক্ষণ নির্ণয়' : 'Troubleshooter & Instant Treatment Guide'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Issue Selector Tabs (Cols 1-5) */}
            <div className="md:col-span-5 flex flex-col gap-2.5">
              {troubleshooterIssues.map((issue, idx) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssueIndex(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedIssueIndex === idx
                      ? 'bg-forest border-cyan-400 shadow-lg text-white'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-cream/80'
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${issue.badgeColor} inline-block mb-1`}>
                      {issue.badge}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold truncate">
                      {issue.title}
                    </h4>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-cream/50" />
                </button>
              ))}
            </div>

            {/* Issue Detail Dossier (Cols 6-12) */}
            <div className="md:col-span-7 rounded-3xl bg-forest/90 border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {troubleshooterIssues[selectedIssueIndex].title}
                  </h3>
                  <span className="text-xs font-bold text-harvest uppercase tracking-wider">
                    {isBn ? 'সঠিক চিকিৎসা' : 'Treatment'}
                  </span>
                </div>

                <div className="mt-4 space-y-4 text-xs sm:text-sm">
                  <div>
                    <h5 className="font-bold text-cream/60 uppercase tracking-wider text-[11px] mb-1">
                      {isBn ? 'সমস্যার কারণ:' : 'Primary Root Cause:'}
                    </h5>
                    <p className="text-cream/90 leading-relaxed">
                      {troubleshooterIssues[selectedIssueIndex].cause}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h5 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-300" />
                      {isBn ? 'জরুরি পদক্ষেপ ও ডোজ:' : 'Immediate Action & Dosage:'}
                    </h5>
                    <p className="text-white leading-relaxed font-medium">
                      {troubleshooterIssues[selectedIssueIndex].action}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-harvest">
                    <strong>{isBn ? 'প্রস্তাবিত ঔষধ:' : 'Recommended Product:'}</strong>
                    <span>{troubleshooterIssues[selectedIssueIndex].product}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  href="/farmer/treatment"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{isBn ? 'চিকিৎসা রেজিস্টার করুন' : 'Log Treatment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="text-xs font-bold text-harvest hover:underline"
                >
                  📞 {isBn ? 'জরুরি পরামর্শ নিন' : 'Call Specialist'}
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. BOTTOM PORTAL GATEWAYS ── */}
      <section className="py-16 px-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-forest via-[#083323] to-forest border border-cyan-400/30 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isBn ? 'চাষী মৎস্য অ্যাকাউন্টে লগইন করে দৈনিক হিসাব রাখুন' : 'Manage Your Ponds With Farmer Aqua Passbook'}
            </h3>
            <p className="text-xs sm:text-sm text-cream/80 max-w-lg">
              {isBn
                ? 'পুকুর অনুযায়ী মাছ মজুদ, খাদ্য প্রয়োগ, পানির গুণমান পরীক্ষা, মাছের বৃদ্ধি ও বিক্রির লাভ-ক্ষতির সম্পূর্ণ ডিজিটাল খাতা।'
                : 'Free access to daily feed tracking, water quality log, mortality record, sampling growth, and harvest accounts.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/farmer/login"
              className="px-6 py-3 rounded-2xl bg-harvest hover:bg-harvest/90 text-forest font-bold text-sm shadow-xl transition-transform hover:-translate-y-0.5"
            >
              {isBn ? 'চাষী লগইন' : 'Farmer Login'} →
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-colors"
            >
              {isBn ? 'সার ও কৃষির হোমপেজ' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
