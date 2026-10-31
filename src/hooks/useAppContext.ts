import * as React from 'react';
import { AppContext, AppContextUpdater, IAppContextState } from '../contexts/AppContext';

export function useAppContext(): IAppContextState {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function useAppContextUpdater(): React.Dispatch<React.SetStateAction<IAppContextState>> {
  const updater = React.useContext(AppContextUpdater);
  if (!updater) {
    throw new Error('useAppContextUpdater must be used within an AppProvider');
  }
  return updater;
}
