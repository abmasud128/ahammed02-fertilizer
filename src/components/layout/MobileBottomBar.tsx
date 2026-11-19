'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { formatPhoneUrl, formatWhatsAppUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n/provider';

export function MobileBottomBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/farmer')) return null;

  const { locale, t } = useLanguage();

  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const whatsappMsg =
    locale === 'bn' ? siteConfig.whatsappMessagebn : siteConfig.whatsappMessage;
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);
  const directionsUrl = siteConfig.directionsUrl;

  return (
    <motion.aside
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-forest/90 dark:bg-[#061e16]/95 backdrop-blur-xl border-t border-white/15 shadow-[0_-8px_25px_rgba(0,0,0,0.3)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2.5 px-3"
      role="toolbar"
      aria-label="Quick contact actions"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* 1. Call Button */}
        <a
          href={phoneUrl}
          aria-label={`Call ${siteConfig.phoneFormatted}`}
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all border border-white/10 group"
        >
          <svg
            className="w-5 h-5 text-harvest group-hover:scale-110 transition-transform mb-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-[11px] font-bold text-cream tracking-tight">
            {locale === 'bn' ? 'কল করুন' : 'Call'}
          </span>
        </a>

        {/* 2. WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Ahammed Fertilizer on WhatsApp"
          className="relative flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 active:scale-95 text-white shadow-md shadow-green-900/40 transition-all border border-green-400/40 group overflow-hidden"
        >
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-white animate-ping" />
          <svg
            className="w-5 h-5 fill-current group-hover:scale-110 transition-transform mb-0.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span className="text-[11px] font-bold text-white tracking-tight">
            WhatsApp
          </span>
        </a>

        {/* 3. Directions Button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get Directions to shop"
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 rounded-xl bg-harvest hover:bg-amber-400 active:scale-95 text-forest transition-all border border-harvest shadow-md group"
        >
          <svg
            className="w-5 h-5 text-forest group-hover:scale-110 transition-transform mb-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[11px] font-black text-forest tracking-tight">
            {locale === 'bn' ? 'পথনির্দেশ' : 'Directions'}
          </span>
        </a>
      </div>
    </motion.aside>
  );
}

export default MobileBottomBar;
