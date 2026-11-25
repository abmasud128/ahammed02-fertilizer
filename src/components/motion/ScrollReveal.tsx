'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // Determine directional offset
  const getInitialOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        return { x: 0, y: 20 };
      case 'down':
        return { x: 0, y: -20 };
      case 'left':
        return { x: 20, y: 0 };
      case 'right':
        return { x: -20, y: 0 };
      default:
        return { x: 0, y: 20 };
    }
  };

  const offset = getInitialOffset();

  return (
    <motion.div
      initial={{
        opacity: shouldReduceMotion ? 1 : 0,
        x: offset.x,
        y: offset.y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, amount: 'some' }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
