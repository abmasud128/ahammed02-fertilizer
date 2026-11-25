'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useSpring, useMotionValue, type Variants } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';
import { formatWhatsAppUrl } from '@/lib/utils';
import HeroActionPanel from './HeroActionPanel';

// Magnetic Button Wrapper
function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  target,
  rel,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 150, mass: 0.2 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // Mild magnetic pull
    x.set((clientX - centerX) * 0.18);
    y.set((clientY - centerY) * 0.18);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex group ${className}`}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} aria-label={ariaLabel} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className="inline-block">
      {content}
    </button>
  );
}

// Mini Trust Counter Component
function TrustCounterItem({
  value,
  label,
  suffix = '+',
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-2xl sm:text-3xl font-extrabold text-harvest tracking-tight">
        {value.toLocaleString()}
        <span>{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-cream/75 font-medium leading-tight mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { t, locale } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Animated Word Reveal Helper
  const wordsPart1 = (locale === 'bn' ? 'উন্নত ফলন শুরু হয়' : 'Better Crops Start With').split(' ');
  const wordsPart2 = (locale === 'bn' ? 'কৃষি উপকরণে' : 'Inputs').split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 110,
      },
    },
  };

  const whatsappMessage =
    locale === 'bn'
      ? 'নমস্কার! আমি আহাম্মেদ ফার্টিলাইজারে ফসলের পুষ্টি ও বালাইনাশক পরামর্শের জন্য যোগাযোগ করছি।'
      : 'Hello Ahammed Fertilizer! I would like expert advice on crop nutrients and protection.';

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden text-cream"
    >
      {/* ── Fixed Real-Life Agricultural Photograph Background (Full Viewport Top) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:bg-fixed pointer-events-none z-0"
        style={{
          backgroundImage: `url('/images/hero/panoramic-bengal-farms.jpg')`,
        }}
        aria-hidden="true"
      >
        {/* Subtle localized edge vignette strictly for text readability without washing out photography */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* ── Main Hero Content Grid ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 lg:pt-36 pb-8 flex-1 flex flex-col justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: Typography, CTAs & Trust Strip (Cols 1-7) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left"
          >
            {/* 1. Small Trust Badge */}
            <motion.div variants={wordVariants} className="inline-flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold text-cream shadow-sm transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-leaf" />
                </span>
                <span>{t('home.hero.badge')}</span>
              </div>
            </motion.div>

            {/* 2. Headline with Animated Reveal & Highlight Word */}
            <div className="space-y-1">
              <h1 className="text-fluid-hero font-black tracking-tight text-white drop-shadow-md">
                {/* Line 1 */}
                <span className="block mb-1 sm:mb-2">
                  {wordsPart1.map((w, idx) => (
                    <motion.span
                      key={idx}
                      variants={wordVariants}
                      className="inline-block mr-2"
                    >
                      {w}
                    </motion.span>
                  ))}
                </span>

                {/* Line 2 with Highlight Word and Part 2 */}
                <span className="inline-block">
                  <motion.span
                    variants={wordVariants}
                    className="relative inline-block mr-2.5 text-transparent bg-clip-text bg-gradient-to-r from-harvest via-amber-300 to-yellow-400 font-black drop-shadow-sm"
                  >
                    {t('home.hero.highlightWord')}
                  </motion.span>

                  {wordsPart2.map((w, idx) => (
                    <motion.span
                      key={idx}
                      variants={wordVariants}
                      className="inline-block mr-2"
                    >
                      {w}
                    </motion.span>
                  ))}
                </span>
              </h1>
            </div>

            {/* 3. Sub-headline */}
            <motion.p
              variants={wordVariants}
              className="text-base sm:text-lg md:text-xl text-cream/90 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            {/* 4. Two Magnetic Action Buttons */}
            <motion.div
              variants={wordVariants}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {/* WhatsApp Enquiry Button */}
              <MagneticButton
                href={formatWhatsAppUrl(siteConfig.whatsapp, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel="Enquire on WhatsApp"
                className="w-full sm:w-auto"
              >
                <div className="relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold text-base shadow-lg shadow-green-900/30 border border-green-400/40 hover:brightness-105 transition-all">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{t('home.hero.ctaWhatsApp')}</span>
                </div>
              </MagneticButton>

              {/* Call Shop Button */}
              <MagneticButton
                href={`tel:+91${siteConfig.phone}`}
                ariaLabel={`Call ${siteConfig.phone}`}
                className="w-full sm:w-auto"
              >
                <div className="relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-white/10 hover:bg-white/18 text-cream font-bold text-base border-2 border-harvest/80 shadow-md backdrop-blur-md transition-all">
                  <svg className="w-5 h-5 text-harvest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{t('home.hero.ctaCall')}</span>
                </div>
              </MagneticButton>
            </motion.div>

            {/* 5. Trust Metrics Strip Underneath */}
            <motion.div
              variants={wordVariants}
              className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left"
            >
              <TrustCounterItem
                value={siteConfig.stats.yearsOfService}
                label={t('home.hero.statYears')}
                suffix="+"
              />
              <TrustCounterItem
                value={siteConfig.stats.happyFarmers}
                label={t('home.hero.statFarmers')}
                suffix="+"
              />
              <TrustCounterItem
                value={siteConfig.stats.productsAvailable}
                label={t('home.hero.statProducts')}
                suffix="+"
              />
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN: Hero Action Panel Overlaid on Background (Cols 8-12) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end py-4 lg:py-2"
          >
            <HeroActionPanel />
          </motion.div>

        </div>
      </div>

      {/* ── Bouncing Scroll Down Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 pb-4 flex flex-col items-center justify-center gap-1.5 text-cream/60 hover:text-cream transition-colors cursor-pointer"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight * 0.9,
            behavior: 'smooth',
          });
        }}
      >
        <span className="text-[11px] font-medium tracking-wider uppercase">
          {t('home.hero.scrollDown')}
        </span>
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-harvest"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
