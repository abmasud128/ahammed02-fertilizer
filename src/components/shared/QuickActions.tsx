'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { formatPhoneUrl, formatWhatsAppUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n/provider';

interface QuickActionsProps {
  className?: string;
  variant?: 'floating' | 'embedded';
}

export function QuickActions({ className = '', variant = 'embedded' }: QuickActionsProps) {
  const { locale, t } = useLanguage();

  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const whatsappMsg = locale === 'bn' ? siteConfig.whatsappMessagebn : siteConfig.whatsappMessage;
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);
  const directionsUrl = siteConfig.directionsUrl;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`w-full max-w-4xl mx-auto ${className}`}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 rounded-2xl ${
          variant === 'floating'
            ? 'bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md shadow-xl border border-forest/10 dark:border-forest/30'
            : 'bg-white dark:bg-dark-surface/80 shadow-md border border-forest/10 dark:border-forest/20'
        }`}
      >
        {/* 1. Call Now Button */}
        <motion.a
          variants={itemVariants}
          href={phoneUrl}
          aria-label="Call Ahammed Fertilizer"
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-medium text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">
            {t('home.quickActions.call', 'Call Now')}
          </span>
        </motion.a>

        {/* 2. WhatsApp Button */}
        <motion.a
          variants={itemVariants}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Ahammed Fertilizer on WhatsApp"
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-leaf hover:bg-leaf/90 text-white font-medium text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 fill-current text-white"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">
            {t('home.quickActions.whatsapp', 'WhatsApp Chat')}
          </span>
        </motion.a>

        {/* 3. Get Directions Button */}
        <motion.a
          variants={itemVariants}
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get Directions to Ahammed Fertilizer"
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-harvest hover:bg-[#e0aa04] text-forest font-medium text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-forest"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">
            {t('home.quickActions.directions', 'Get Directions')}
          </span>
        </motion.a>
      </div>
    </motion.div>
  );
}

export default QuickActions;
