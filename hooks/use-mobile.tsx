'use client';

import React, { useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  useEffect(() => {
    const initialMobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(initialMobile);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      const newMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(newMobile);
    };
    mql.addEventListener('change', onChange);

    const handleResize = () => {
      const newMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(newMobile);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mql.removeEventListener('change', onChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return !!isMobile;
}
