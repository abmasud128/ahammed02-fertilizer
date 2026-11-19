'use client';

import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export interface AnimatedCounterProps {
  target: number;
  label: string;
  labelbn?: string;
  icon?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  label,
  labelbn,
  icon,
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 80,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    }
  }, [isInView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (numberRef.current) {
        const rounded = Math.floor(latest);
        numberRef.current.textContent = rounded.toLocaleString();
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  const displayLabel = language === 'bn' && labelbn ? labelbn : label;

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/60 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {icon && (
        <span className="text-3xl mb-3 select-none" role="img" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="flex items-baseline text-4xl sm:text-5xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
        <span ref={numberRef}>0</span>
        <span className="text-emerald-600 dark:text-emerald-400 ml-1">+</span>
      </div>
      <p className="mt-2 text-sm sm:text-base font-medium text-stone-600 dark:text-stone-300 text-center">
        {displayLabel}
      </p>
    </div>
  );
}
