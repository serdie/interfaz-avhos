import type { ThemeConfig } from '@avhos/core';

/**
 * Dark-first theme: the default and primary theme for AVHOS.
 * Designed for long coding sessions: high contrast, muted backgrounds,
 * no gimmicky gradients. Inspired by modern IDE dark themes.
 */
export const darkTheme: ThemeConfig = {
  id: 'dark',
  name: 'AVHOS Dark',
  base: 'dark',
  colors: {
    bgPrimary: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#1c2128',
    bgHover: '#21262d',
    border: '#30363d',
    textPrimary: '#e6edf3',
    textSecondary: '#9198a1',
    textMuted: '#6e7681',
    accent: '#2f81f7',
    accentHover: '#1f6feb',
    danger: '#f85149',
    warning: '#d29922',
    success: '#3fb950',
    info: '#2f81f7',
  },
  fontSizes: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    lg: '15px',
    xl: '18px',
  },
};

/** Light theme — secondary, for future use. Not fully polished yet. */
export const lightTheme: ThemeConfig = {
  id: 'light',
  name: 'AVHOS Light',
  base: 'light',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f6f8fa',
    bgTertiary: '#eaeef2',
    bgHover: '#d8dee4',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textSecondary: '#59636e',
    textMuted: '#818b98',
    accent: '#0969da',
    accentHover: '#0550ae',
    danger: '#cf222e',
    warning: '#9a6700',
    success: '#1a7f37',
    info: '#0969da',
  },
  fontSizes: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    lg: '15px',
    xl: '18px',
  },
};

export const themes: Record<string, ThemeConfig> = {
  dark: darkTheme,
  light: lightTheme,
};
