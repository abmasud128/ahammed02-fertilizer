'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for media query matching.
 * SSR safe: returns false during server-side rendering until mounted on client.
 *
 * @param query CSS media query string, e.g. '(min-width: 768px)'
 * @returns boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older Safari/browsers
      (mediaQueryList as any).addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        (mediaQueryList as any).removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
