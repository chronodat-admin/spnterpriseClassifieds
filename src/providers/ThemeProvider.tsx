import * as React from 'react';
import {
  FluentProvider,
  IdPrefixProvider,
  teamsDarkTheme,
  teamsLightTheme,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';
import { patchTabsterInstance, TabsterGuard } from '../utils/patchTabster';
import { ThemeContext, ThemeMode, IThemeContextState } from '../contexts/ThemeContext';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { writeLocalStorage } from '../utilities';

export interface IThemeProviderProps {
  initialDarkTheme?: boolean;
  isTeams?: boolean;
  children: React.ReactNode;
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const ThemeProvider: React.FC<IThemeProviderProps> = ({
  initialDarkTheme = false,
  isTeams = false,
  children
}) => {

  const [mode, setMode] = React.useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.Theme);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      /* storage unavailable */
    }
    return initialDarkTheme ? 'dark' : 'system';
  });

  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(() =>
    initialDarkTheme || resolveIsDark(mode)
  );

  React.useEffect(() => {
    setIsDarkTheme(resolveIsDark(mode));
  }, [mode]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => {
      if (mode === 'system') {
        setIsDarkTheme(mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  const setThemeMode = React.useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    writeLocalStorage(LOCAL_STORAGE_KEYS.Theme, newMode);
    setIsDarkTheme(resolveIsDark(newMode));
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeMode(isDarkTheme ? 'light' : 'dark');
  }, [isDarkTheme, setThemeMode]);

  const themeValue: IThemeContextState = React.useMemo(
    () => ({ mode, isDarkTheme, toggleTheme, setThemeMode }),
    [mode, isDarkTheme, toggleTheme, setThemeMode]
  );

  const fluentTheme = isTeams
    ? (isDarkTheme ? teamsDarkTheme : teamsLightTheme)
    : (isDarkTheme ? webDarkTheme : webLightTheme);

  patchTabsterInstance();

  return (
    <ThemeContext.Provider value={themeValue}>
      <TabsterGuard>
        <IdPrefixProvider value="ec365-">
          <FluentProvider
            id="ec365-fluent-root"
            theme={fluentTheme}
            dir={undefined}
            targetDocument={typeof document !== 'undefined' ? document : undefined}
            applyStylesToPortals={true}
          >
            {children}
          </FluentProvider>
        </IdPrefixProvider>
      </TabsterGuard>
    </ThemeContext.Provider>
  );
};
