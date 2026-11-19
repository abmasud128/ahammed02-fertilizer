'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import {
  ShieldCheck,
  UserCheck,
  Waves,
  FlaskConical,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HeroActionPanel() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const actionItems = [
    {
      id: 'admin-login',
      href: '/admin/login',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/15 border-amber-400/30',
      title: isBn ? 'অ্যাডমিন লগইন' : 'Admin Login',
      badge: isBn ? 'স্টাফ পোর্টাল' : 'Staff Portal',
      subtitle: isBn ? 'পিওএস বিলিং, সিআরএম ও স্টক' : 'POS Billing, Staff CRM & Stock',
      accentBorder: 'border-white/10 hover:border-amber-400/50 hover:bg-white/10',
    },
    {
      id: 'farmer-login',
      href: '/farmer/login',
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/15 border-emerald-400/30',
      title: isBn ? 'চাষী লগইন' : 'Farmer Login',
      badge: isBn ? 'ডিজিটাল খাতা' : 'Farm Passbook',
      subtitle: isBn ? 'পুকুর, ফসল ও খরচের হিসাব' : 'Pond & Crop Digital Passbook',
      accentBorder: 'border-white/10 hover:border-emerald-400/50 hover:bg-white/10',
    },
    {
      id: 'continue-aqua',
      href: '/aquaculture',
      icon: Waves,
      iconColor: 'text-cyan-300',
      iconBg: 'bg-cyan-400/20 border-cyan-400/50',
      title: isBn ? 'মৎস্য পোর্টালে যান' : 'Continue to Aquaculture',
      badge: isBn ? 'নতুন পোর্টাল' : 'Dedicated Portal',
      subtitle: isBn ? 'মাছ চাষ, ভাসমান ফিড ও পুকুর যত্ন' : 'Dedicated Fish Farming, Feeds & Water Care',
      accentBorder: 'border-cyan-400/40 hover:border-cyan-300 bg-gradient-to-r from-cyan-950/40 to-teal-950/30 shadow-lg shadow-cyan-950/40',
      isAqua: true,
    },
    {
      id: 'book-test',
      href: '/book-test',
      icon: FlaskConical,
      iconColor: 'text-harvest',
      iconBg: 'bg-harvest/20 border-harvest/50',
      title: isBn ? 'টেস্ট বুক করুন' : 'Book a Test',
      badge: isBn ? 'মাটি ও জল' : 'Soil & Water',
      subtitle: isBn ? 'অন-সাইট ল্যাবরেটরি রিপোর্ট' : 'On-Site Diagnostic Soil & Water Lab',
      accentBorder: 'border-harvest/40 hover:border-harvest bg-gradient-to-r from-amber-950/30 to-emerald-950/30 shadow-lg shadow-amber-950/30',
      isTest: true,
    },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* ── Ambient Soft Glow behind Panel ── */}
      <div
        className="absolute -inset-2 bg-gradient-to-tr from-leaf/30 via-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-80 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Main Glassmorphism Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl bg-forest/80 dark:bg-[#071d15]/85 border border-white/20 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-cream"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harvest opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-harvest" />
            </span>
            <span className="text-xs sm:text-sm font-black text-white tracking-wider uppercase">
              {isBn ? 'দ্রুত সেবা ও পোর্টাল' : 'Action Panel'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-harvest text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3 h-3" />
            {isBn ? '৪টি বিকল্প' : '4 Portals'}
          </span>
        </div>

        {/* 4 Action Options */}
        <div className="flex flex-col gap-2.5">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative p-3 sm:p-3.5 rounded-2xl bg-white/5 border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${item.accentBorder}`}
              >
                <div className="flex items-center gap-3">
                  {/* Left Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl ${item.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                  >
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>

                  {/* Middle Text Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-sm sm:text-base font-extrabold text-white whitespace-nowrap group-hover:text-harvest transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-cream/90 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-cream/75 truncate mt-0.5 font-medium">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Right Arrow Indicator */}
                  <div className="shrink-0 text-cream/60 group-hover:text-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Panel Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cream/70 font-medium">
          <div className="flex items-center gap-1.5">
            <span>📞</span>
            <span>{isBn ? 'হেল্পলাইন: ৯০৯১০১৭০৩৫' : 'Helpline: 9091017035'}</span>
          </div>
          <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isBn ? 'খোলা আছে' : 'Open Today'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
