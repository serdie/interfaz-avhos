import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { ThemeConfig } from '@avhos/core';
import { darkTheme, lightTheme } from '../theme.js';

interface ThemeContextValue {
  theme: ThemeConfig;
  setThemeId: (id: string) => void;
  themeId: string;
  fontScale: number;
  setFontScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_THEME = 'avhos:theme';
const STORAGE_KEY_FONT_SCALE = 'avhos:fontScale';

function applyFontScale(base: ThemeConfig, scale: number): ThemeConfig {
  const px = (val: string) => `${Math.round(parseInt(val, 10) * scale)}px`;
  return {
    ...base,
    fontSizes: {
      xs: px(base.fontSizes.xs),
      sm: px(base.fontSizes.sm),
      base: px(base.fontSizes.base),
      lg: px(base.fontSizes.lg),
      xl: px(base.fontSizes.xl),
    },
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEY_THEME) ?? 'dark'; } catch { return 'dark'; }
  });
  const [fontScale, setFontScaleState] = useState<number>(() => {
    try { return parseFloat(localStorage.getItem(STORAGE_KEY_FONT_SCALE) ?? '1'); } catch { return 1; }
  });

  const baseTheme = themeId === 'light' ? lightTheme : darkTheme;
  const theme = useMemo(() => applyFontScale(baseTheme, fontScale), [baseTheme, fontScale]);

  const setThemeIdPersisted = (id: string) => {
    try { localStorage.setItem(STORAGE_KEY_THEME, id); } catch { /* ignore */ }
    setThemeId(id);
  };

  const setFontScale = (scale: number) => {
    try { localStorage.setItem(STORAGE_KEY_FONT_SCALE, String(scale)); } catch { /* ignore */ }
    setFontScaleState(scale);
  };

  const value: ThemeContextValue = {
    theme,
    themeId,
    setThemeId: setThemeIdPersisted,
    fontScale,
    setFontScale,
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
