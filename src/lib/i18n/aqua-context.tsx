'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AQUA_DICTIONARY, AquaLocale } from '@/lib/i18n/aqua-dictionary';

interface AquaLanguageContextType {
  locale: AquaLocale;
  setLocale: (locale: AquaLocale) => void;
  toggleLocale: () => void;
  d: typeof AQUA_DICTIONARY['en'];
  isBn: boolean;
}

const STORAGE_KEYS = ['ahammed_language', 'ahammed_lang'];

function getInitialLocale(): AquaLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved === 'bn' || saved === 'en') {
        return saved as AquaLocale;
      }
    }
  } catch {}
  return 'en';
}

const AquaLanguageContext = createContext<AquaLanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  d: AQUA_DICTIONARY.en,
  isBn: false,
});

export function AquaLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AquaLocale>('en');

  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);

    const handleStorage = (e: StorageEvent) => {
      if (e.key && STORAGE_KEYS.includes(e.key) && (e.newValue === 'en' || e.newValue === 'bn')) {
        setLocaleState(e.newValue as AquaLocale);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLocale = (newLocale: AquaLocale) => {
    setLocaleState(newLocale);
    try {
      for (const key of STORAGE_KEYS) {
        localStorage.setItem(key, newLocale);
      }
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  const d = (AQUA_DICTIONARY[locale] || AQUA_DICTIONARY.en) as typeof AQUA_DICTIONARY['en'];
  const isBn = locale === 'bn';

  return (
    <AquaLanguageContext.Provider value={{ locale, setLocale, toggleLocale, d, isBn }}>
      {children}
    </AquaLanguageContext.Provider>
  );
}

export function useAquaLanguage() {
  const ctx = useContext(AquaLanguageContext);
  if (!ctx) {
    return {
      locale: 'en' as AquaLocale,
      setLocale: () => {},
      toggleLocale: () => {},
      d: AQUA_DICTIONARY.en,
      isBn: false,
    };
  }
  return ctx;
}
