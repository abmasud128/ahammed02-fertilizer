'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';

const STORAGE_KEY = 'ahammed_announcement_dismissed';

export function AnnouncementBar() {
  const { t, locale } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Graceful fallback
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 overflow-hidden bg-gradient-to-r from-forest via-[#0f4e3b] to-forest text-cream border-b border-harvest/30"
          role="region"
          aria-label="Announcement"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2.5 mx-auto truncate pr-6">
              <span className="flex h-2 w-2 shrink-0 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harvest opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-harvest" />
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-harvest/20 text-harvest font-bold text-[11px] tracking-wide uppercase shrink-0">
                {locale === 'bn' ? 'অফার' : 'Offer'}
              </span>
              <p className="truncate text-cream/90 font-medium">
                {t(
                  'nav.announcement',
                  'Seasonal offers available. Visit our shop at Nandair, Puliyapara, Chapmatali.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t('nav.announcementDismiss', 'Dismiss announcement')}
              className="p-1 rounded-md text-cream/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
