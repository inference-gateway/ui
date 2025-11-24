'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

// Subscribe to window resize and media query changes
function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', callback);
  window.addEventListener('resize', callback);

  return () => {
    mql.removeEventListener('change', callback);
    window.removeEventListener('resize', callback);
  };
}

// Get current mobile state from window
function getSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

// Server snapshot - assume not mobile on server
function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
