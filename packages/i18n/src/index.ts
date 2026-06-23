import {
  type Locale,
  type TranslationKey,
  type TranslationResource,
  type InterpolationParams,
  type I18nConfig,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  interpolate,
  resolveKey,
} from './types.js';
import { esES } from './locales/es-ES.js';
import { enUS } from './locales/en-US.js';

export * from './types.js';

const resources: Record<Locale, TranslationResource> = {
  'es-ES': esES,
  'en-US': enUS,
};

const defaultConfig: I18nConfig = {
  locale: DEFAULT_LOCALE,
  fallback: FALLBACK_LOCALE,
  resources,
};

/**
 * I18n translator: resolves keys in the active locale, falling back to es-ES.
 * Components should use the `useTranslation` hook from @avhos/ui which wraps this.
 */
export class I18nTranslator {
  private config: I18nConfig;

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = { ...defaultConfig, ...config, resources };
  }

  setLocale(locale: Locale): void {
    this.config.locale = locale;
  }

  getLocale(): Locale {
    return this.config.locale;
  }

  t(key: TranslationKey, params?: InterpolationParams): string {
    const localeResource = this.config.resources[this.config.locale];
    const fallbackResource = this.config.resources[this.config.fallback];

    const resolved =
      resolveKey(localeResource, key) ??
      resolveKey(fallbackResource, key) ??
      key;

    return interpolate(resolved, params);
  }

  /** Check if a key exists in the current locale (or fallback). */
  exists(key: TranslationKey): boolean {
    const localeResource = this.config.resources[this.config.locale];
    const fallbackResource = this.config.resources[this.config.fallback];
    return resolveKey(localeResource, key) !== null || resolveKey(fallbackResource, key) !== null;
  }

  /** Format a date according to locale. */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = this.config.locale;
    return d.toLocaleString(locale.replace('-', '_'));
  }

  /** Format a relative time string. */
  relativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffH / 24);

    if (diffMin < 1) return this.t('date.relative.justNow');
    if (diffMin < 60) return this.t('date.relative.minutesAgo', { count: diffMin });
    if (diffH < 24) return this.t('date.relative.hoursAgo', { count: diffH });
    return this.t('date.relative.daysAgo', { count: diffDays });
  }
}

/** Singleton instance for non-React contexts. */
let _instance: I18nTranslator | null = null;

export function getTranslator(): I18nTranslator {
  if (!_instance) {
    _instance = new I18nTranslator();
  }
  return _instance;
}

export function setLocale(locale: Locale): void {
  getTranslator().setLocale(locale);
}
