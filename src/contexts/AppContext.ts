import * as React from 'react';
import { IAppContext } from '../interfaces';

export interface IAppContextState extends IAppContext {
  serviceContainerReady: boolean;
}

export const defaultAppContext: IAppContextState = {
  webUrl: '',
  siteUrl: '',
  userId: '',
  userDisplayName: '',
  userEmail: '',
  isAdmin: false,
  isModerator: false,
  isApprover: false,
  locale: 'en-us',
  isRtl: false,
  isTeams: false,
  isDarkTheme: false,
  serviceContainerReady: false
};

export const AppContext = React.createContext<IAppContextState>(defaultAppContext);

export const AppContextUpdater = React.createContext<
  React.Dispatch<React.SetStateAction<IAppContextState>> | undefined
>(undefined);
