'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * Global Lenis smooth scrolling provider.
 * - Automatically disabled if user prefers reduced motion.
 * - Kept on desktop/tablet while allowing native touch momentum on small screens
 *   to ensure ultra-high 60fps performance on budget mobile devices.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Respect user's reduced motion system preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Skip Lenis for admin routes or touch devices under 768px to ensure instant touch response
    const isMobile = window.innerWidth < 768;
    if (isMobile || window.location.pathname.startsWith('/admin')) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
    });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
