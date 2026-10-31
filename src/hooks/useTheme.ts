import * as React from 'react';
import { ThemeContext, IThemeContextState } from '../contexts/ThemeContext';

export function useTheme(): IThemeContextState {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
