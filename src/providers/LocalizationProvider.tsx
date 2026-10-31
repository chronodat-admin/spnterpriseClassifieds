import * as React from 'react';
import {
  LocalizationContext,
  createLocalizationState,
  ILocalizationContextState
} from '../contexts/LocalizationContext';
import { getStrings, formatLocalizedString, DEFAULT_LOCALE } from '../localization';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { writeLocalStorage } from '../utilities';
import { ILocalizationStrings } from '../interfaces';

export interface ILocalizationProviderProps {
  locale?: string;
  children: React.ReactNode;
}

function resolveRtl(locale: string): boolean {
  const normalized = locale.toLowerCase();
  return normalized.startsWith('ar') ||
    normalized.startsWith('he') ||
    normalized.startsWith('fa') ||
    normalized.startsWith('ur');
}

export const LocalizationProvider: React.FC<ILocalizationProviderProps> = ({
  locale: initialLocale,
  children
}) => {
  const [locale, setLocaleState] = React.useState<string>(() => {
    if (initialLocale) return initialLocale.toLowerCase();
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.Locale);
      if (stored) return stored.toLowerCase();
    } catch {
      /* storage unavailable */
    }
    return DEFAULT_LOCALE;
  });

  const [strings, setStrings] = React.useState<ILocalizationStrings>(() => getStrings(locale));
  const [isRtl, setIsRtl] = React.useState<boolean>(() => resolveRtl(locale));

  React.useEffect(() => {
    if (initialLocale) {
      const normalized = initialLocale.toLowerCase();
      setLocaleState(normalized);
      setStrings(getStrings(normalized));
      setIsRtl(resolveRtl(normalized));
    }
  }, [initialLocale]);

  const setLocale = React.useCallback((newLocale: string) => {
    const normalized = newLocale.toLowerCase();
    setLocaleState(normalized);
    setStrings(getStrings(normalized));
    setIsRtl(resolveRtl(normalized));
    writeLocalStorage(LOCAL_STORAGE_KEYS.Locale, normalized);
  }, []);

  const formatString = React.useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      const parts = key.split('.');
      let current: string | ILocalizationStrings | undefined = strings;
      for (const part of parts) {
        if (typeof current === 'string' || current === undefined) break;
        current = current[part];
      }
      const template = typeof current === 'string' ? current : key;
      return formatLocalizedString(template, replacements);
    },
    [strings]
  );

  const contextValue: ILocalizationContextState = React.useMemo(
    () => ({
      locale,
      isRtl,
      strings,
      setLocale,
      formatString
    }),
    [locale, isRtl, strings, setLocale, formatString]
  );

  return (
    <LocalizationContext.Provider value={contextValue}>
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ height: '100%' }}>
        {children}
      </div>
    </LocalizationContext.Provider>
  );
};

export { createLocalizationState };
