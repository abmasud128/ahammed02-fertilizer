'use client';

import React from 'react';
import { useLanguage } from '@/i18n/provider';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  isTransparent?: boolean;
}

export function LanguageToggle({ className = '', isTransparent = false }: LanguageToggleProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={`header-lang-btn shrink-0 inline-flex items-center px-1.5 py-1 rounded-2xl border transition-all duration-200 shadow-xs whitespace-nowrap ${
        isTransparent
          ? 'bg-white/12 border-white/25 backdrop-blur-md text-white'
          : 'bg-forest/5 dark:bg-white/5 border-forest/15 dark:border-white/15 text-forest dark:text-cream'
      } ${className}`}
    >
      <div className="flex items-center pl-1.5 pr-2 text-leaf dark:text-harvest" title="Select Language">
        <Globe className="w-3.5 h-3.5 shrink-0" />
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-harvest text-forest shadow-xs'
              : isTransparent
              ? 'text-white/80 hover:text-white hover:bg-white/10'
              : 'text-forest/70 dark:text-cream/70 hover:text-forest dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          aria-pressed={locale === 'en'}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale('bn')}
          className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
            locale === 'bn'
              ? 'bg-harvest text-forest shadow-xs'
              : isTransparent
              ? 'text-white/80 hover:text-white hover:bg-white/10'
              : 'text-forest/70 dark:text-cream/70 hover:text-forest dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          aria-pressed={locale === 'bn'}
        >
          বাংলা
        </button>
      </div>
    </div>
  );
}

export default LanguageToggle;
