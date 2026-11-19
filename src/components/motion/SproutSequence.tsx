'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useLanguage } from '@/i18n/provider';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

// Register ScrollTrigger plugin on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SproutSequence() {
  const { locale } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const plantContainerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      title: '1. Quality Seed & Treatment',
      titlebn: '১. উন্নত বীজ ও বীজ শোধন',
      desc: 'Certified high-germination seeds treated with bio-fungicides to ensure disease resistance.',
      descbn: 'রোগ প্রতিরোধ ক্ষমতা বাড়াতে ছত্রাকনাশক দ্বারা শোধিত ১০০% খাঁটি বীজ।',
      icon: '🌰',
      badge: '98% Germination',
      badgebn: '৯৮% অঙ্কুরোদগম',
    },
    {
      title: '2. Deep Root Foundation',
      titlebn: '২. সুদৃঢ় শিকড় বিস্তার',
      desc: 'Phosphorus (DAP) & mycorrhiza stimulate extensive root networks to tap deep nutrients.',
      descbn: 'ডিএপি ও অনুখাদ্য প্রয়োগে গভীরে শিকড়ের বিস্তার এবং মাটি থেকে সার গ্রহণ।',
      icon: '🌱',
      badge: 'Strong Taproot',
      badgebn: 'মজবুত শিকড়',
    },
    {
      title: '3. Vigorous Vegetative Spurt',
      titlebn: '৩. দ্রুত উদ্ভিজ্জ বৃদ্ধি',
      desc: 'Balanced NPK 19:19:19 and Zinc Plus ignite lush green tillering and strong stalks.',
      descbn: 'সুষম এনপিকে ১৯:১৯:১৯ ও জিঙ্ক প্লাসের ব্যবহারে দ্রুত শাখা-প্রশাখা ও বৃদ্ধি।',
      icon: '🌿',
      badge: 'Active Tillering',
      badgebn: 'দ্রুত কুশি গঠন',
    },
    {
      title: '4. Bountiful Golden Harvest',
      titlebn: '৪. উন্নত ফলন ও সমৃদ্ধি',
      desc: 'Targeted crop protection and micronutrients deliver plump grains and maximum market profit.',
      descbn: 'সঠিক সময়ে বালাইনাশক ও অনুখাদ্য প্রয়োগে পুষ্ট সোনালী দানা ও সর্বোচ্চ লাভ।',
      icon: '🌾',
      badge: 'Maximum Yield',
      badgebn: 'সর্বোচ্চ ফলন',
    },
  ];

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Main scrub timeline linked to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1.2,
          onUpdate: (self) => {
            const progress = self.progress;
            const stageIndex = Math.min(
              stages.length - 1,
              Math.floor(progress * stages.length)
            );
            setActiveStage(stageIndex);
          },
        },
      });

      // Stage 1: Seed pulsates in soil
      tl.fromTo(
        '.sprout-seed',
        { scale: 0.8, opacity: 0.4 },
        { scale: 1.1, opacity: 1, duration: 1.5, ease: 'power1.out' }
      );

      // Stage 2: Roots grow downward
      tl.fromTo(
        ['.sprout-root-1', '.sprout-root-2'],
        { strokeDashoffset: 120, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 2, stagger: 0.4, ease: 'power2.inOut' },
        '+=0.2'
      );

      // Stage 3: Stem erupts upward through the soil line
      tl.fromTo(
        '.sprout-stem',
        { scaleY: 0, transformOrigin: 'bottom center', opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 2.5, ease: 'power2.out' },
        '+=0.2'
      );

      // Stage 4: Leaves unfold
      tl.fromTo(
        ['.sprout-leaf-left', '.sprout-leaf-right'],
        { scale: 0, opacity: 0, transformOrigin: 'bottom center' },
        { scale: 1, opacity: 1, duration: 2, stagger: 0.3, ease: 'back.out(1.7)' },
        '+=0.1'
      );

      // Stage 5: Crown shoots and golden grain glow
      tl.fromTo(
        '.sprout-leaf-top',
        { scale: 0, opacity: 0, transformOrigin: 'bottom center' },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' }
      );

      tl.fromTo(
        '.sprout-grain',
        { scale: 0, opacity: 0, transformOrigin: 'center center' },
        { scale: 1.15, opacity: 1, duration: 1.8, ease: 'power2.out' },
        '-=0.5'
      );

      tl.fromTo(
        '.sprout-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 0.85, scale: 1.3, duration: 2, ease: 'sine.inOut' },
        '-=1'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, stages.length]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-cream via-[#F7EFE3] to-cream dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-leaf/10 text-leaf border border-leaf/20 mb-3">
            ✨ {locale === 'bn' ? 'ফসল চক্র ও পুষ্টি বিজ্ঞান' : 'Signature Growth Journey'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-forest dark:text-white tracking-tight">
            {locale === 'bn'
              ? 'বীজ থেকে সোনালী ফসল — প্রতিটি ধাপে সঠিক সার'
              : 'From Seed to Bountiful Harvest'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {locale === 'bn'
              ? 'স্ক্রোল করে দেখুন কিভাবে আমাদের উন্নত সার ও পরামর্শ আপনার ফলন বহুগুণ বৃদ্ধি করে।'
              : 'Scroll down to experience the journey of balanced nutrition from germination to full yield.'}
          </p>
        </div>

        {/* Interactive 2-Column Sprout Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Signature Sprouting Botanical SVG Canvas */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              ref={plantContainerRef}
              className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-3xl bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md border border-forest/15 dark:border-leaf/20 shadow-xl p-6 flex flex-col items-center justify-between overflow-hidden"
            >
              {/* Radial Golden Sun / Glow Background */}
              <div
                className="sprout-glow absolute top-10 w-44 h-44 rounded-full bg-harvest/20 dark:bg-harvest/15 blur-2xl pointer-events-none transition-all duration-700"
                style={{ opacity: prefersReducedMotion ? 0.8 : undefined }}
              />

              {/* Sunbeam Atmosphere */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 dark:bg-white/5 border border-forest/10 dark:border-white/10 text-xs font-semibold text-forest dark:text-cream">
                <span className="w-2 h-2 rounded-full bg-harvest animate-ping" />
                <span>{locale === 'bn' ? 'সক্রিয় বৃদ্ধি' : 'Healthy Growth'}</span>
              </div>

              {/* Detailed Botanical Sprout SVG Illustration */}
              <svg
                viewBox="0 0 300 400"
                className="w-full h-full max-h-[340px] relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ── Ground Horizon & Fertile Soil Line ── */}
                <line
                  x1="20"
                  y1="260"
                  x2="280"
                  y2="260"
                  stroke="#5C4033"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeOpacity="0.6"
                />
                <rect
                  x="20"
                  y="262"
                  width="260"
                  height="125"
                  rx="12"
                  fill="#382013"
                  fillOpacity="0.08"
                />

                {/* Soil Mineral & Compost Granules */}
                <circle cx="80" cy="290" r="4" fill="#F2B705" fillOpacity="0.4" />
                <circle cx="210" cy="305" r="5" fill="#2E9E4F" fillOpacity="0.3" />
                <circle cx="150" cy="340" r="3.5" fill="#F2B705" fillOpacity="0.5" />
                <circle cx="95" cy="355" r="4.5" fill="#5C4033" fillOpacity="0.3" />
                <circle cx="225" cy="360" r="4" fill="#2E9E4F" fillOpacity="0.35" />

                {/* ── Underground Roots (Stage 2) ── */}
                <path
                  className="sprout-root-1"
                  d="M150 270 Q130 300 115 345 Q105 365 85 375"
                  stroke="#A77A58"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 120,
                    strokeDashoffset: prefersReducedMotion ? 0 : undefined,
                  }}
                />
                <path
                  className="sprout-root-2"
                  d="M150 270 Q170 305 185 340 Q195 360 215 370"
                  stroke="#A77A58"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 120,
                    strokeDashoffset: prefersReducedMotion ? 0 : undefined,
                  }}
                />

                {/* Micro root hairs */}
                <path
                  d="M135 305 Q120 315 110 320"
                  stroke="#A77A58"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
                <path
                  d="M165 310 Q180 320 195 325"
                  stroke="#A77A58"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />

                {/* ── Dormant & Germinating Seed (Stage 1) ── */}
                <ellipse
                  className="sprout-seed"
                  cx="150"
                  cy="265"
                  rx="14"
                  ry="10"
                  fill="#8B5A2B"
                  stroke="#F2B705"
                  strokeWidth="2"
                />

                {/* ── Main Plant Stem (Stage 3) ── */}
                <path
                  className="sprout-stem"
                  d="M150 260 Q150 190 150 110"
                  stroke="#2E9E4F"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* ── First Foliage Leaves (Stage 4) ── */}
                {/* Left Leaf */}
                <path
                  className="sprout-leaf-left"
                  d="M150 200 C110 190 80 160 85 130 C115 135 145 170 150 195 Z"
                  fill="#2E9E4F"
                  stroke="#0B3D2E"
                  strokeWidth="1.5"
                />
                {/* Right Leaf */}
                <path
                  className="sprout-leaf-right"
                  d="M150 175 C190 165 220 135 215 105 C185 110 155 145 150 170 Z"
                  fill="#38B35F"
                  stroke="#0B3D2E"
                  strokeWidth="1.5"
                />

                {/* Top Leaf Cluster */}
                <path
                  className="sprout-leaf-top"
                  d="M150 120 C135 85 140 60 150 45 C160 60 165 85 150 120 Z"
                  fill="#4ADE80"
                  stroke="#2E9E4F"
                  strokeWidth="1.5"
                />

                {/* ── Golden Harvest Grain Cluster (Stage 5) ── */}
                <g className="sprout-grain">
                  {/* Grain spikes */}
                  <ellipse cx="140" cy="50" rx="5" ry="9" fill="#F2B705" transform="rotate(-20 140 50)" />
                  <ellipse cx="160" cy="50" rx="5" ry="9" fill="#F2B705" transform="rotate(20 160 50)" />
                  <ellipse cx="145" cy="35" rx="5" ry="9" fill="#F2B705" transform="rotate(-15 145 35)" />
                  <ellipse cx="155" cy="35" rx="5" ry="9" fill="#F2B705" transform="rotate(15 155 35)" />
                  <ellipse cx="150" cy="22" rx="4.5" ry="8" fill="#FCD34D" />
                  {/* Golden Sparkle dewdrops */}
                  <circle cx="150" cy="20" r="2" fill="#FFFFFF" />
                  <circle cx="162" cy="46" r="1.5" fill="#FFFFFF" />
                </g>
              </svg>

              {/* Dynamic Bottom Label of Active Stage */}
              <div className="w-full text-center pt-2 border-t border-forest/10 dark:border-white/10">
                <span className="text-xs font-bold text-forest dark:text-harvest">
                  {locale === 'bn' ? stages[activeStage].badgebn : stages[activeStage].badge}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Milestone Timeline Progression Cards */}
          <div className="lg:col-span-7 space-y-4">
            {stages.map((stage, idx) => {
              const isCurrent = activeStage === idx;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl transition-all duration-300 border ${
                    isCurrent
                      ? 'bg-white dark:bg-dark-surface border-leaf shadow-lg translate-x-1 sm:translate-x-2'
                      : 'bg-white/50 dark:bg-dark-surface/40 border-forest/10 dark:border-forest/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0 p-2.5 rounded-xl bg-cream dark:bg-dark-bg border border-forest/10 dark:border-forest/30">
                      {stage.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={`text-base sm:text-lg font-bold ${
                            isCurrent
                              ? 'text-leaf dark:text-leaf'
                              : 'text-forest dark:text-white'
                          }`}
                        >
                          {locale === 'bn' ? stage.titlebn : stage.title}
                        </h3>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-harvest text-forest font-extrabold'
                              : 'bg-forest/5 dark:bg-white/5 text-muted-foreground'
                          }`}
                        >
                          {locale === 'bn' ? stage.badgebn : stage.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {locale === 'bn' ? stage.descbn : stage.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SproutSequence;
