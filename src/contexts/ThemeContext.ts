import * as React from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { readLocalStorage } from '../utilities';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface IThemeContextState {
  mode: ThemeMode;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const storedMode = readLocalStorage<ThemeMode>(LOCAL_STORAGE_KEYS.Theme, 'system');

export const defaultThemeContext: IThemeContextState = {
  mode: storedMode,
  isDarkTheme: resolveIsDark(storedMode),
  toggleTheme: () => undefined,
  setThemeMode: () => undefined
};

export const ThemeContext = React.createContext<IThemeContextState>(defaultThemeContext);
