'use client';

import React from 'react';
import Link from 'next/link';
import {
  Fish,
  Droplets,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Activity,
  Layers,
  Phone,
  Waves,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/i18n/provider';

export default function AquacultureShowcase() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const features = [
    {
      icon: Fish,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      badge: isBn ? 'উচ্চ বৃদ্ধি' : 'High FCR',
      title: isBn ? 'সুষম ভাসমান মাছের খাদ্য' : 'Floating Fish Feed (28%-32%)',
      desc: isBn
        ? 'সিপি ও গোদরেজের উন্নত ভাসমান ফিড। জলে সহজে নষ্ট হয় না, দ্রুত ওজন বাড়ায় ও এফসিআর কমায়।'
        : 'Premium floating extruded feed minimizing water waste and accelerating harvest weight.',
    },
    {
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: isBn ? 'জরুরি সুরক্ষা' : 'Emergency DO',
      title: isBn ? 'জরুরি অক্সিজেন ও গ্যাস নাশক' : 'Emergency Oxygen & Zeolite',
      desc: isBn
        ? 'ভোরে মাছ ভেসে উঠলে দ্রুত অক্সিজেন বুস্টার ট্যাবলেট এবং তলদেশের অ্যামোনিয়া শোধক জিওলাইট।'
        : 'Rapid DO tablets for dawn hypoxia and natural activated zeolite for bottom gas relief.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: isBn ? 'জীবাণুমুক্ত' : 'Bio-Security',
      title: isBn ? 'পুকুর শোধন ও রোগ প্রতিরোধ' : 'Pond Sanitizer & BKC 80%',
      desc: isBn
        ? 'মাছের ফুলকা পচা, লেজ-পাখনা পচা ও ক্ষতরোগ প্রতিরোধে প্রমাণিত ডিসইনফেক্ট্যান্ট ও প্রোবায়োটিক।'
        : 'Broad-spectrum water sanitizers and beneficial probiotics preventing microbial diseases.',
    },
    {
      icon: FlaskConical,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badge: isBn ? 'ল্যাব টেস্ট' : 'Lab Tested',
      title: isBn ? 'ডিজিটাল জল ও অ্যামোনিয়া টেস্ট' : 'Digital Water Testing Lab',
      desc: isBn
        ? 'ল্যাবে ডিজিটাল কিট দিয়ে পুকুরের pH, অ্যামোনিয়া (NH3), ক্ষারত্ব ও দ্রবীভূত অক্সিজেন পরীক্ষা।'
        : 'Scientific parameter analysis (pH, DO, NH3, Alkalinity) with customized agronomic advice.',
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#061811] via-[#09251b] to-[#061811] text-white relative overflow-hidden">
      {/* Background aquatic ambient glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Waves className="w-4 h-4" />
            {isBn ? 'আধুনিক মৎস্য প্রযুক্তি ও সমাধান' : 'Aquaculture Intelligence & Supplies'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {isBn ? 'আধুনিক মাছ চাষ ও পুকুর পরিচর্যা হাব' : 'Modern Aquaculture & Pond Care Hub'}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {isBn
              ? 'দক্ষিণ দিনাজপুরের মৎস্য চাষীদের জন্য উন্নত ভাসমান ফিড, জরুরি অক্সিজেন, জিওলাইট এবং বৈজ্ঞানিক ল্যাব টেস্টিং পরিষেবা।'
              : 'Empowering fish farmers with high-protein feeds, emergency hypoxia tablets, bottom detoxifiers, and digital water analysis.'}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-300/80 leading-relaxed mt-2">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-bold">
                  <span>{isBn ? 'দোকানে স্টক আছে' : 'Available in Store'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#0a3526] to-cyan-950/60 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Fish className="w-5 h-5 text-cyan-400" />
              {isBn ? 'পুকুরের মাছ চাষ সংক্রান্ত কোনো সমস্যা?' : 'Experiencing Pond Water or Fish Health Issues?'}
            </h4>
            <p className="text-xs text-gray-300 max-w-xl">
              {isBn
                ? 'আমাদের মৎস্য পরামর্শকেন্দ্রে যোগাযোগ করুন বা ল্যাব টেস্টের জন্য নমুনা বুক করুন।'
                : 'Consult our store aquaculture specialists or book a digital water parameter test today.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/aquaculture"
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#071d15] text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isBn ? 'মাছ চাষ গাইড দেখুন' : 'Aquaculture Hub'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/book-test"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              {isBn ? 'জল টেস্ট বুক করুন' : 'Book Water Test'}
            </Link>
            <Link
              href="/farmer/login"
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {isBn ? '🐟 চাষী লগইন' : 'Farmer Login'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
