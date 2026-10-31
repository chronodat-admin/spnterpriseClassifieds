import * as React from 'react';
import { LocalizationContext, ILocalizationContextState } from '../contexts/LocalizationContext';
import { IAppStrings } from '../localization';

export function useLocalization(): ILocalizationContextState {
  const context = React.useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

export function useStrings(): IAppStrings {
  const { strings } = useLocalization();
  return strings as IAppStrings;
}
