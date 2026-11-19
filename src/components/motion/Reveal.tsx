'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

export interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

/**
 * Reusable scroll reveal component powered by Framer Motion.
 * Adapts seamlessly to user's motion preferences (skips translation if prefers-reduced-motion is true).
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.55,
  distance = 28,
  className = '',
  once = true,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getInitialPosition = () => {
    if (prefersReducedMotion || direction === 'none') return { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialPosition(),
  };

  const variants: Variants = {
    hidden: initial,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
