import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ThemeConfig } from '@avhos/core';
import { darkTheme, lightTheme } from '../theme.js';

interface ThemeContextValue {
  theme: ThemeConfig;
  setThemeId: (id: string) => void;
  themeId: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>('dark');
  const theme = themeId === 'light' ? lightTheme : darkTheme;

  const value: ThemeContextValue = {
    theme,
    themeId,
    setThemeId,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
