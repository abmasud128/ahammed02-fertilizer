'use client';

import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/i18n/provider';

interface LogoProps {
  className?: string;
  isTransparent?: boolean;
  onClick?: () => void;
}

/**
 * Modular Brand Logo Component
 * 
 * To replace this procedural/SVG logo with your custom image asset:
 * 1. Place your image in `/public/images/logo.png` (or `.svg`).
 * 2. Uncomment the Next/Image block below and comment out the SVG Mark block.
 */
export function Logo({ className = '', isTransparent = false, onClick }: LogoProps) {
  const { locale, t } = useLanguage();

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Ahammed Fertilizer Homepage"
      className={`group inline-flex items-center gap-2.5 transition-transform duration-200 active:scale-98 ${className}`}
    >
      {/* ── Sprout / Leaf Brand Mark ── */}
      {/* 
        [CUSTOM LOGO SWAP OPTION]:
        If you have a real image logo, swap with:
        <Image src="/images/logo.png" alt="Ahammed Fertilizer" width={40} height={40} className="object-contain" />
      */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-leaf to-forest shadow-md shadow-forest/20 group-hover:scale-105 group-hover:shadow-leaf/30 transition-all duration-300 border border-white/20 shrink-0">
        <svg
          className="w-5 h-5 text-harvest transform -rotate-6 group-hover:rotate-0 transition-transform duration-300"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Stylized Dual Leaf Sprout Icon */}
          <path d="M12 2C8 2 4 6 4 11c0 3.5 2 6.5 5 8v3h2v-3c5-.5 9-4.5 9-9.5 0-4-3-7.5-8-7.5zm-1 15c-3-1-4-4-4-7 0-3 2.5-5 5-5-1 4-1 9-1 12zm2-2c0-3.5 1-7.5 3-10 2.5 1 3.5 3 3.5 5.5 0 3.5-3 5.5-6.5 4.5z" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-harvest ring-2 ring-forest" />
      </div>

      {/* ── Typography & Tagline ── */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black text-base sm:text-lg tracking-tight transition-colors ${
              isTransparent
                ? 'text-white group-hover:text-harvest'
                : 'text-forest dark:text-cream group-hover:text-leaf'
            }`}
          >
            <span className="inline sm:hidden font-extrabold">AF</span>
            <span className="hidden sm:inline">
              {locale === 'bn' ? siteConfig.namebn : siteConfig.name}
            </span>
          </span>
        </div>

        <span
          className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase leading-tight mt-0.5 transition-colors ${
            isTransparent
              ? 'text-harvest/90'
              : 'text-leaf dark:text-harvest/80'
          }`}
        >
          {t('nav.tagline', 'Trusted Farm Solutions')}
        </span>
      </div>
    </Link>
  );
}

export default Logo;
