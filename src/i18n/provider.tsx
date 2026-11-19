'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import en from './en.json';
import bn from './bn.json';

export type Locale = 'en' | 'bn';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Locale, Record<string, any>> = {
  en,
  bn,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ahammed_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === 'en' || stored === 'bn') {
        setLocaleState(stored);
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore storage errors
    }
    // Set document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const t = useMemo(() => {
    return (path: string, fallback?: string): string => {
      const dict = translations[locale] || translations.en;
      const keys = path.split('.');

      let current: any = dict;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          // Try English fallback if missing in current locale
          let fallbackVal: any = translations.en;
          for (const fk of keys) {
            if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
              fallbackVal = fallbackVal[fk];
            } else {
              fallbackVal = undefined;
              break;
            }
          }
          if (typeof fallbackVal === 'string') return fallbackVal;
          return fallback ?? path;
        }
      }

      if (typeof current === 'string') {
        return current;
      }

      return fallback ?? path;
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
