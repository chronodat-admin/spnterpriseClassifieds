import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { registerServices } from '../services/ServiceRegistration';
import { PermissionChecker } from '../permissions/PermissionChecker';
import { AppContext, AppContextUpdater, defaultAppContext, IAppContextState } from '../contexts/AppContext';
import { ThemeProvider } from './ThemeProvider';
import { LocalizationProvider } from './LocalizationProvider';
import { NotificationProvider } from './NotificationProvider';

export interface IAppProviderProps {
  context: WebPartContext;
  isDarkTheme?: boolean;
  isTeams?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  isApprover?: boolean;
  locale?: string;
  children: React.ReactNode;
}

interface IPermissionService {
  checker: PermissionChecker;
}

export const AppProvider: React.FC<IAppProviderProps> = ({
  context,
  isDarkTheme = false,
  isTeams = false,
  isAdmin = false,
  isModerator = false,
  isApprover = false,
  locale,
  children
}) => {
  const resolvedLocale = locale ?? context.pageContext.cultureInfo.currentUICultureName.toLowerCase();

  const [appState, setAppState] = React.useState<IAppContextState>(() => ({
    ...defaultAppContext,
    webUrl: context.pageContext.web.absoluteUrl,
    siteUrl: context.pageContext.site.absoluteUrl,
    userId: context.pageContext.user.loginName,
    userDisplayName: context.pageContext.user.displayName,
    userEmail: context.pageContext.user.email,
    isAdmin,
    isModerator,
    isApprover,
    locale: resolvedLocale,
    isRtl: false,
    isTeams: isTeams || !!context.sdks.microsoftTeams,
    isDarkTheme,
    serviceContainerReady: false
  }));

  React.useEffect(() => {
    registerServices(context);

    const container = ServiceContainer.getInstance();
    const permissionService = container.resolve<IPermissionService>(SERVICE_KEYS.PermissionService);
    permissionService.checker?.updateContext({
      isAdmin,
      isModerator,
      isApprover,
      userId: context.pageContext.user.loginName
    });

    setAppState(prev => ({ ...prev, serviceContainerReady: true }));

    return () => {
      container.dispose();
    };
  }, [context, isAdmin, isModerator, isApprover]);

  React.useEffect(() => {
    setAppState(prev => ({
      ...prev,
      isDarkTheme,
      isAdmin,
      isModerator,
      isApprover,
      isTeams: isTeams || !!context.sdks.microsoftTeams
    }));
  }, [isDarkTheme, isAdmin, isModerator, isApprover, isTeams, context]);

  return (
    <AppContext.Provider value={appState}>
      <AppContextUpdater.Provider value={setAppState}>
        <ThemeProvider initialDarkTheme={isDarkTheme} isTeams={appState.isTeams}>
          <LocalizationProvider locale={resolvedLocale}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AppContextUpdater.Provider>
    </AppContext.Provider>
  );
};
