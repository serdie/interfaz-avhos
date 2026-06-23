/**
 * i18n core: type-safe translation key system.
 * Translation resources are kept separate from executable code.
 * es-ES is the default and fully implemented language.
 * Additional languages can be added by providing another resource file.
 */

export type Locale = 'es-ES' | 'en-US';

export const DEFAULT_LOCALE: Locale = 'es-ES';
export const FALLBACK_LOCALE: Locale = 'es-ES';

/** A flat key structure for translations: "panel.memory.title" etc. */
export type TranslationKey = string;

/** Translation resource: nested object of key -> string. */
export type TranslationResource = Record<string, string>;

/** Interpolation parameters for dynamic values in translations. */
export type InterpolationParams = Record<string, string | number>;

export interface I18nConfig {
  locale: Locale;
  fallback: Locale;
  resources: Record<Locale, TranslationResource>;
}

/** Format a translation string with {param} interpolation. */
export function interpolate(
  template: string,
  params: InterpolationParams | undefined,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

/** Resolve a key in a resource, returning null if not found. */
export function resolveKey(
  resource: TranslationResource,
  key: TranslationKey,
): string | null {
  return resource[key] ?? null;
}
