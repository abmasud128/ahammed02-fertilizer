'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';

export interface SectionHeadingProps {
  title: string;
  titlebn?: string;
  subtitle?: string;
  subtitlebn?: string;
  centered?: boolean;
  className?: string;
  id?: string;
  light?: boolean;
}

/**
 * Animated Section Heading with bilingual English/Bengali support and
 * viewport-triggered entrance animation.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  titlebn,
  subtitle,
  subtitlebn,
  centered = true,
  className = '',
  id,
  light = false,
}) => {
  const { locale } = useLanguage();

  const isBengali = locale === 'bn';
  const displayTitle = isBengali && titlebn ? titlebn : title;
  const displaySubtitle = isBengali && subtitlebn ? subtitlebn : subtitle;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`mb-12 ${centered ? 'text-center flex flex-col items-center' : 'text-left'} ${className}`}
    >
      {/* Main Title */}
      <h2
        className={`text-3xl md:text-5xl font-black tracking-tight ${
          light ? 'text-white drop-shadow-md' : 'text-forest dark:text-leaf'
        } ${isBengali ? 'font-bengali' : 'font-sans'}`}
      >
        {displayTitle}
      </h2>

      {/* Decorative accent bar */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 64 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className={`h-1.5 rounded-full mt-3.5 mb-2 ${light ? 'bg-harvest' : 'bg-leaf'}`}
      />

      {/* Optional Subtitle */}
      {displaySubtitle && (
        <p
          className={`text-base sm:text-lg mt-2 max-w-2xl leading-relaxed ${
            light ? 'text-cream/90 drop-shadow' : 'text-gray-600 dark:text-gray-400'
          } ${isBengali ? 'font-bengali' : 'font-sans'}`}
        >
          {displaySubtitle}
        </p>
      )}
    </motion.div>
  );
};

SectionHeading.displayName = 'SectionHeading';
export default SectionHeading;
