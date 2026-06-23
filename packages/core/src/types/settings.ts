import { UUID, ISODateString } from './branded.js';

/** Application-level settings stored locally. */
export interface AppSetting {
  id: UUID;
  key: string;
  value: unknown;
  category: 'appearance' | 'editor' | 'terminal' | 'models' | 'mcp' | 'agent' | 'general';
  description: string;
  updatedAt: ISODateString;
}

/** Theme definition for the dark-first design system. */
export interface ThemeConfig {
  id: string;
  name: string;
  base: 'dark' | 'light';
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgHover: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    danger: string;
    warning: string;
    success: string;
    info: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
}

/** Keyboard shortcut binding. */
export interface Keybinding {
  id: string;
  command: string;
  keys: string;
  when: string | null;
  description: string;
}
