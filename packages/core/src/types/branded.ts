/**
 * Core identifiers and branded types used across all packages.
 * Using branded types prevents accidental mixing of IDs at compile time.
 */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UUID = Brand<string, 'UUID'>;

export type ISODateString = Brand<string, 'ISO'>;

export function uuid(raw: string): UUID {
  return raw as UUID;
}

export function isoNow(): ISODateString {
  return new Date().toISOString() as ISODateString;
}
