'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * A hook that manages dark/light mode theme
 */
export function useThemeManager(initialDarkMode = true) {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newIsDarkMode = !prev;
      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newIsDarkMode;
    });
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme };
}
