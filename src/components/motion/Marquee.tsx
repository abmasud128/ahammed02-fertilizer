'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

export interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // duration in seconds
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  speed = 25,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, disable scroll animation
  if (shouldReduceMotion) {
    return (
      <div className={`flex overflow-x-auto gap-8 py-4 ${className}`}>
        {children}
      </div>
    );
  }

  const animationDirection = direction === 'right' ? 'reverse' : 'normal';

  return (
    <div
      className={`group relative flex overflow-hidden select-none w-full ${className}`}
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div
        className={`flex shrink-0 items-center justify-around gap-8 min-w-full ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marquee ${speed}s linear infinite ${animationDirection}`,
        }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-around gap-8 min-w-full ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marquee ${speed}s linear infinite ${animationDirection}`,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
