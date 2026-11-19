'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Custom hook to detect whether the user has enabled prefers-reduced-motion in their system preferences.
 * Safe for SSR and automatically updates when system settings change.
 *
 * @returns boolean true if prefers-reduced-motion is active
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export default usePrefersReducedMotion;
