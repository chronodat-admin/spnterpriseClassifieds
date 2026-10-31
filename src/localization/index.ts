import { ILocalizationStrings } from '../interfaces';
import { enUsStrings, IAppStrings } from './en-us';

export const DEFAULT_LOCALE = 'en-us';

export const SUPPORTED_LOCALES: readonly string[] = ['en-us'] as const;

const localeMap: Record<string, IAppStrings> = {
  'en-us': enUsStrings,
  'en': enUsStrings
};

export function getStrings(locale: string): ILocalizationStrings {
  const normalized = locale.toLowerCase();
  return localeMap[normalized] ?? enUsStrings;
}

export function getAppStrings(locale: string): IAppStrings {
  const normalized = locale.toLowerCase();
  return localeMap[normalized] ?? enUsStrings;
}

export function isSupportedLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale.toLowerCase());
}

export function formatLocalizedString(
  template: string,
  replacements?: Record<string, string | number>
): string {
  if (!replacements) return template;
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    template
  );
}

export * from './en-us';
