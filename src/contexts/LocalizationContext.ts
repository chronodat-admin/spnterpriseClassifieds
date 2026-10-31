import * as React from 'react';
import { ILocalizationStrings } from '../interfaces';
import { getStrings, DEFAULT_LOCALE } from '../localization';

export interface ILocalizationContextState {
  locale: string;
  isRtl: boolean;
  strings: ILocalizationStrings;
  setLocale: (locale: string) => void;
  formatString: (key: string, replacements?: Record<string, string | number>) => string;
}

function resolveRtl(locale: string): boolean {
  const normalized = locale.toLowerCase();
  return normalized.startsWith('ar') ||
    normalized.startsWith('he') ||
    normalized.startsWith('fa') ||
    normalized.startsWith('ur');
}

export function createLocalizationState(locale: string = DEFAULT_LOCALE): ILocalizationContextState {
  return {
    locale,
    isRtl: resolveRtl(locale),
    strings: getStrings(locale),
    setLocale: () => undefined,
    formatString: (key: string) => key
  };
}

export const defaultLocalizationContext = createLocalizationState();

export const LocalizationContext = React.createContext<ILocalizationContextState>(
  defaultLocalizationContext
);
