import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getTranslator, type Locale, type I18nTranslator } from '@avhos/i18n';

/**
 * i18n React context — provides the translator to all components.
 * Components use useTranslation() to get the t() function.
 */
interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  formatDate: (date: Date | string) => string;
  relativeTime: (date: Date | string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [translator] = useState<I18nTranslator>(() => getTranslator());
  const [locale, setLocaleState] = useState<Locale>(translator.getLocale());

  const setLocale = useCallback(
    (newLocale: Locale) => {
      translator.setLocale(newLocale);
      setLocaleState(newLocale);
    },
    [translator],
  );

  const value: I18nContextValue = {
    t: (key, params) => translator.t(key, params),
    locale,
    setLocale,
    formatDate: (date) => translator.formatDate(date),
    relativeTime: (date) => translator.relativeTime(date),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}
