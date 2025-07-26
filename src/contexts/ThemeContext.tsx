import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  resolvedColorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');
  const [resolvedColorScheme, setResolvedColorScheme] = useState<'light' | 'dark'>('light');
  const { setColorScheme: setMantineColorScheme } = useMantineColorScheme();

  // Load color scheme from localStorage on mount
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme;
    if (savedColorScheme && ['light', 'dark', 'auto'].includes(savedColorScheme)) {
      setColorSchemeState(savedColorScheme);
    }
  }, []);

  // Resolve the actual color scheme (handles 'auto' mode)
  useEffect(() => {
    const resolveColorScheme = () => {
      if (colorScheme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return colorScheme;
    };

    const updateResolvedScheme = () => {
      const resolved = resolveColorScheme();
      setResolvedColorScheme(resolved);
      setMantineColorScheme(resolved);
    };

    updateResolvedScheme();

    // Listen for system theme changes when in auto mode
    if (colorScheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedScheme);
      return () => mediaQuery.removeEventListener('change', updateResolvedScheme);
    }
  }, [colorScheme, setMantineColorScheme]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem('colorScheme', scheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, resolvedColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 