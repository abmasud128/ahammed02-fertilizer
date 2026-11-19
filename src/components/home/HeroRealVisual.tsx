'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

interface RealLifeSlide {
  id: string;
  category: string;
  categoryBn: string;
  tabLabel: string;
  tabLabelBn: string;
  icon: string;
  mainImage: string;
  mainAlt: string;
  mainAltBn: string;
  tag: string;
  tagBn: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  insetImage: string;
  insetLabel: string;
  insetLabelBn: string;
}

const REAL_LIFE_SLIDES: RealLifeSlide[] = [
  {
    id: 'agriculture',
    category: 'Crop Science & Farm Field',
    categoryBn: 'কৃষি বিজ্ঞান ও মাঠ ফসল',
    tabLabel: 'Agriculture',
    tabLabelBn: 'কৃষি ও ফসল',
    icon: '🌾',
    mainImage: '/images/hero/bengal-paddy-field.jpg',
    mainAlt: 'Lush green paddy crop field in rural West Bengal during golden morning sunrise',
    mainAltBn: 'সোনালী সকালে দক্ষিণ দিনাজপুরের সবুজে ভরা স্বাস্থ্যকর আমন ও বোরো ধানক্ষেত',
    tag: 'Bumper Harvest & Soil Nutrition',
    tagBn: 'উন্নত ফলন ও সুষম পুষ্টি ব্যবস্থাপনা',
    title: 'High-Yield Paddy & Field Crop Care',
    titleBn: 'আমন ও বোরো ধানের বৈজ্ঞানিক পরিচর্যা',
    description: 'Targeted N-P-K & micronutrient doses tailored per bigha for Bengal farmers.',
    descriptionBn: 'মাটির উর্বরতা ও বিঘাপ্রতি সঠিক সারের মাত্রায় কৃষকের ঘরে নিশ্চিত লাভ।',
    insetImage: '/images/hero/farmer-crop-advisory.jpg',
    insetLabel: 'Field Advisory',
    insetLabelBn: 'মাঠ পরামর্শ সেবা',
  },
  {
    id: 'aquaculture',
    category: 'Freshwater Aquaculture',
    categoryBn: 'বৈজ্ঞানিক মৎস্য চাষ',
    tabLabel: 'Aquaculture',
    tabLabelBn: 'মাছ চাষ ও পুকুর',
    icon: '🐟',
    mainImage: '/images/hero/aquaculture-fish-pond.jpg',
    mainAlt: 'Aerated freshwater fish pond with paddle aerator in rural Bengal',
    mainAltBn: 'পশ্চিমবঙ্গের পরিষ্কার মিষ্টি পানির পুকুরে এয়ারেটর ও মাছের নিবিড় পরিচর্যা',
    tag: 'Scientific Pond Management',
    tagBn: 'বৈজ্ঞানিক পুকুর ও পানির গুণমান',
    title: 'Aerated Ponds & Fast Fish Growth',
    titleBn: 'অক্সিজেন সমৃদ্ধ পুকুর ও স্বাস্থ্যবান মাছ',
    description: 'DO, pH, and ammonia monitoring paired with premium floating feeds.',
    descriptionBn: 'দ্রবীভূত অক্সিজেন, গ্যাস দূরীকরণ ও পুষ্টিকর খাবারের সুষম মেলবন্ধন।',
    insetImage: '/images/shop/pesticides-and-products.png',
    insetLabel: 'Pond Medicines',
    insetLabelBn: 'পুকুরের ওষুধ ও জিওলাইট',
  },
  {
    id: 'shop-stock',
    category: 'Govt. Licensed Inputs',
    categoryBn: 'সরকারি লাইসেন্সপ্রাপ্ত উপকরণ',
    tabLabel: 'Shop & Godown',
    tabLabelBn: 'দোকান ও গুদাম',
    icon: '🏪',
    mainImage: '/images/shop/warehouse-stock.png',
    mainAlt: 'Elevated dry fertilizer godown with stacked genuine bags of Urea, DAP and Potash',
    mainAltBn: 'চাপমাটালি স্টোরের প্রধান গুদামে সুরক্ষিতভাবে স্তূপীকৃত খাঁটি সারের ভাণ্ডার',
    tag: 'Govt. Authorized Retail Store',
    tagBn: 'সরকারি লাইসেন্সধারী খুচরা ও পাইকারি স্টোর',
    title: '100% Genuine Fertilizers & Medicines',
    titleBn: '১০০% খাঁটি ও সিলগালা সার এবং কীটনাশক',
    description: 'Urea, DAP, MOP, IFFCO complexes & certified crop protection sprays.',
    descriptionBn: 'সরাসরি অনুমোদিত কোম্পানি থেকে আসা সিলগালা সারের নির্ভরযোগ্য ঠিকানা।',
    insetImage: '/images/shop/fertilizer-sacks.png',
    insetLabel: 'Verified Quality',
    insetLabelBn: 'যাচাইকৃত বস্তা ও খুচরা সার',
  },
];

export default function HeroRealVisual() {
  const { t, locale } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isBn = locale === 'bn';
  const currentSlide = REAL_LIFE_SLIDES[activeIndex];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % REAL_LIFE_SLIDES.length);
  }, []);

  // Auto rotate every 5.5s unless paused
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, nextSlide]);

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── Soft Ambient Glow behind the card ── */}
      <div
        className="absolute -inset-2 bg-gradient-to-tr from-leaf/30 via-harvest/20 to-emerald-400/20 rounded-3xl blur-2xl opacity-75 pointer-events-none transform -rotate-1"
        aria-hidden="true"
      />

      {/* ── Main Showcase Container ── */}
      <div className="relative w-full max-w-[540px] rounded-3xl bg-forest/85 border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden p-2.5 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 transition-all duration-300">
        
        {/* Top Interactive Category Tabs */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 p-1 rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md relative z-20">
          {REAL_LIFE_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                data-testid={`hero-tab-${slide.id}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-1 py-1.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-cream/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-leaf to-emerald-600 border border-emerald-400/40 shadow-lg shadow-emerald-950/50"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 text-sm sm:text-base">{slide.icon}</span>
                <span className="relative z-10 whitespace-nowrap text-[11px] sm:text-xs">
                  {isBn ? slide.tabLabelBn : slide.tabLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Central Real-Life Photograph Display ── */}
        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[320px] rounded-2xl overflow-hidden border border-white/15 bg-black/40 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={currentSlide.mainImage}
                alt={isBn ? currentSlide.mainAltBn : currentSlide.mainAlt}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
                className="object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Cinematic Vignette & Bottom Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

              {/* Top Tag on Photo */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/85 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-harvest tracking-wide shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isBn ? currentSlide.tagBn : currentSlide.tag}
                </span>
              </div>

              {/* Bottom Details on Photo */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-left">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-2">
                  <span>{isBn ? currentSlide.titleBn : currentSlide.title}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-cream/90 font-medium leading-relaxed drop-shadow line-clamp-2 mt-0.5">
                  {isBn ? currentSlide.descriptionBn : currentSlide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Overlapping Secondary Real-Life Inset Badge (Bottom Right) */}
          <motion.div
            key={`inset-${currentSlide.id}`}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="absolute bottom-2.5 right-2.5 z-20 hidden xs:flex sm:flex items-center gap-2 p-1.5 rounded-xl bg-forest/90 border border-white/25 backdrop-blur-xl shadow-xl"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
              <Image
                src={currentSlide.insetImage}
                alt={isBn ? currentSlide.insetLabelBn : currentSlide.insetLabel}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="text-left pr-1.5">
              <div className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight leading-tight">
                {isBn ? currentSlide.insetLabelBn : currentSlide.insetLabel}
              </div>
              <div className="text-[9px] text-harvest font-medium">
                {isBn ? 'সরাসরি যাচাই' : 'Verified Real'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Carousel Progress & Manual Nav Dots ── */}
        <div className="flex items-center justify-between px-1 text-xs text-cream/70">
          <div className="flex items-center gap-1.5">
            {REAL_LIFE_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-6 bg-harvest shadow-sm'
                    : 'w-2 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-cream/75 font-medium">
            <span>{isBn ? 'বাস্তব চিত্র ও মাঠ প্রতিবেদন' : 'Real-Life Farm & Shop Imagery'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

      </div>

      {/* ── Floating Glass Trust Badge 1: Top Right (Desktop / Tablet) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="hidden sm:block absolute -top-8 sm:-top-10 -right-4 sm:-right-8 lg:-right-12 z-30 pointer-events-none max-w-[85vw]"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [-5, 5, -5],
                  rotate: [-0.5, 0.8, -0.5],
                }
          }
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
          }}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-forest/95 border border-white/25 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 sm:gap-3 text-left"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-leaf/25 border border-leaf/40 flex items-center justify-center text-base sm:text-lg shadow-inner">
            🌾
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {t('home.hero.cardGenuine')}
            </div>
            <div className="text-[10px] text-harvest font-semibold uppercase tracking-wider">
              {isBn ? 'সরকারি অনুমোদিত দোকান' : 'Govt. Authorized Shop'}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Floating Glass Trust Badge 2: Bottom Left (Desktop / Tablet) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="hidden sm:block absolute -bottom-8 sm:-bottom-10 -left-4 sm:-left-8 lg:-left-12 z-30 pointer-events-none max-w-[85vw]"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [5, -5, 5],
                  rotate: [0.8, -0.8, 0.8],
                }
          }
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-forest/95 border border-white/25 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 sm:gap-3 text-left"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-harvest/25 border border-harvest/40 flex items-center justify-center text-base sm:text-lg shadow-inner">
            🔬
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {t('home.hero.cardAdvice')}
            </div>
            <div className="text-[10px] text-green-300 font-semibold uppercase tracking-wider">
              {isBn ? 'বিঘা প্রতি সঠিক মাত্রা' : 'Precise Dosage per Bigha'}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Mobile-Only Compact Trust Badges Strip (Underneath card on small screens) ── */}
      <div className="sm:hidden flex items-center justify-between gap-2 w-full pt-1">
        <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-forest/90 border border-white/15 backdrop-blur-md flex items-center gap-2 text-left">
          <span className="text-sm">🌾</span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white truncate">
              {t('home.hero.cardGenuine')}
            </div>
            <div className="text-[8px] text-harvest font-medium truncate uppercase">
              Govt. Authorized
            </div>
          </div>
        </div>
        <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-forest/90 border border-white/15 backdrop-blur-md flex items-center gap-2 text-left">
          <span className="text-sm">🔬</span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white truncate">
              {t('home.hero.cardAdvice')}
            </div>
            <div className="text-[8px] text-green-300 font-medium truncate uppercase">
              Dosage per Bigha
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
