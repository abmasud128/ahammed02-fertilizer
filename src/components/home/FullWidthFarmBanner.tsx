'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { ShieldCheck, Sparkles, FlaskConical, Phone, ArrowRight } from 'lucide-react';

export default function FullWidthFarmBanner() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  return (
    <section className="relative w-full h-[400px] sm:h-[480px] md:h-[560px] overflow-hidden my-4 sm:my-8 border-y-2 border-forest/30 shadow-2xl">
      {/* Real-Life Full-Width Panoramic Photograph */}
      <Image
        src="/images/backgrounds/bg-banner.jpg"
        alt={isBn ? 'দক্ষিণ দিনাজপুর ও বাংলার সোনালী সন্ধ্যায় সমৃদ্ধ ফসলের মাঠ' : 'Panoramic view of lush agricultural farmland in West Bengal during golden hour'}
        fill
        sizes="100vw"
        className="object-cover object-center transform hover:scale-102 transition-transform duration-1000 ease-out"
        priority
      />

      {/* Subtle localized vignette strictly behind text without color tinting the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/35 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-left text-white">
        
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          {isBn ? 'দক্ষিণ দিনাজপুরের কৃষির বিশ্বস্ত প্রতিষ্ঠান' : 'Govt. Licensed Agri-Consultancy • Since 2015'}
        </div>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl drop-shadow-lg">
          {isBn ? (
            <>
              খাঁটি সারের নিশ্চয়তা, <br className="hidden sm:inline" />
              <span className="text-harvest">কৃষকের ঘরে সর্বোচ্চ ফলন ও সমৃদ্ধি</span>
            </>
          ) : (
            <>
              Empowering Over 5,000+ Bengal Farmers <br className="hidden sm:inline" />
              <span className="text-harvest">With 100% Genuine Certified Inputs</span>
            </>
          )}
        </h2>

        {/* Subhead */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-cream/90 max-w-2xl leading-relaxed drop-shadow">
          {isBn
            ? 'চাপমাটালি স্টোর থেকে সরাসরি সরকারি ভর্তুকিযুক্ত সার, বালাইনাশক ও ডিজিটাল মাটি পরীক্ষার সমন্বয়ে আপনার প্রতিটি বিঘার ফলন বাড়ান।'
            : 'From seed germination to bumper harvest: genuine IFFCO fertilizers, targeted disease cures, and on-site soil testing tailored for Dakshin Dinajpur.'}
        </p>

        {/* 4 Feature Points Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
          {[
            { icon: '🌾', title: isBn ? '১০০% খাঁটি সার' : '100% Genuine' },
            { icon: '🔬', title: isBn ? '২৪ ঘণ্টায় টেস্ট' : '24h Soil Lab' },
            { icon: '🧑‍🌾', title: isBn ? '৫,০০০+ চাষী' : '5,000+ Farmers' },
            { icon: '📍', title: isBn ? 'চাপমাটালি স্টোর' : 'Chapmatali Store' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-forest/80 border border-white/20 backdrop-blur-md shadow-md"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</span>
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/book-test"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-harvest to-amber-500 hover:brightness-105 text-forest font-bold text-sm sm:text-base shadow-xl transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FlaskConical className="w-5 h-5" />
            {isBn ? 'মাটি পরীক্ষার স্লট বুক করুন' : 'Book Soil Health Test'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`tel:${siteConfig.phone}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-colors"
          >
            <Phone className="w-5 h-5 text-harvest" />
            {isBn ? 'সরাসরি দোকানে ফোন করুন' : `Call Store: ${siteConfig.phone}`}
          </a>
        </div>

      </div>
    </section>
  );
}
