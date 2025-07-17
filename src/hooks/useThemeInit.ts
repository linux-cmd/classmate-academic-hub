import { useEffect } from 'react';

export const useThemeInit = () => {
  useEffect(() => {
    // Initialize theme on app mount
    const savedTheme = localStorage.getItem('classmate-theme') || 'system';
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(savedTheme);
    }
  }, []);
};