import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button,
  Tooltip
} from '@fluentui/react-components';
import {
  NavigationRegular,
  NavigationFilled,
  DismissRegular
} from '@fluentui/react-icons';
import { APP_NAME, ROUTES } from '../../constants';
import { IBreadcrumbItem, ICommandBarItem } from '../../interfaces';
import { useBreakpoint, useTheme, useStrings, useAppContext } from '../../hooks';
import { AppBrandIcon } from '../../components/Layout/AppBrandIcon';
import { LeftNavigation } from '../../navigation/LeftNavigation';
import { BreadcrumbNav } from '../../navigation/BreadcrumbNav';
import { TopCommandBar } from '../../navigation/TopCommandBar';
import { GlobalSearch } from '../../navigation/GlobalSearch';
import { NotificationBell } from '../../navigation/NotificationBell';
import { ProfileMenu } from '../../navigation/ProfileMenu';
import styles from './AppShell.module.scss';

export interface IAppShellProps {
  children: React.ReactNode;
  breadcrumbs?: IBreadcrumbItem[];
  commandBarItems?: ICommandBarItem[];
  hideCommandBar?: boolean;
  hideBreadcrumb?: boolean;
  setupComplete?: boolean;
  onRunSetup?: () => void;
}

function buildDefaultBreadcrumbs(pathname: string, strings: ReturnType<typeof useStrings>): IBreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: IBreadcrumbItem[] = [
    { key: 'home', text: strings.navigation.dashboard, path: ROUTES.Dashboard }
  ];

  if (segments.length === 0) {
    return items;
  }

  const routeMap: Record<string, { text: string; path: string }> = {
    listings: { text: strings.navigation.listings, path: ROUTES.Listings },
    create: { text: strings.navigation.createListing, path: ROUTES.CreateListing },
    edit: { text: strings.createWizard.editTitle, path: ROUTES.CreateListing },
    categories: { text: strings.navigation.categories, path: ROUTES.Categories },
    favorites: { text: strings.navigation.favorites, path: ROUTES.Favorites },
    wanted: { text: strings.navigation.wantedAds, path: ROUTES.WantedAds },
    'my-listings': { text: strings.navigation.myListings, path: ROUTES.MyListings },
    messages: { text: strings.navigation.messages, path: ROUTES.Messages },
    reviews: { text: strings.navigation.reviews, path: ROUTES.Reviews },
    reports: { text: strings.navigation.reports, path: ROUTES.Reports },
    admin: { text: strings.navigation.admin, path: ROUTES.Admin },
    search: { text: strings.navigation.search, path: ROUTES.Search },
    settings: { text: strings.navigation.settings, path: ROUTES.Settings },
    help: { text: strings.navigation.help, path: ROUTES.Help },
    privacy: { text: strings.navigation.privacy, path: ROUTES.Privacy },
    terms: { text: strings.navigation.terms, path: ROUTES.Terms },
    seller: { text: strings.navigation.sellerProfile, path: ROUTES.SellerProfile.replace(':id', segments[1] ?? '') }
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const mapped = routeMap[segment];
    if (mapped && index < segments.length - 1) {
      items.push({ key: segment, text: mapped.text, path: currentPath });
    } else if (mapped) {
      items.push({ key: segment, text: mapped.text });
    } else if (/^\d+$/.test(segment)) {
      items.push({ key: `id-${segment}`, text: `#${segment}` });
    } else {
      items.push({ key: segment, text: segment.charAt(0).toUpperCase() + segment.slice(1) });
    }
  });

  return items;
}

export const AppShell: React.FC<IAppShellProps> = ({
  children,
  breadcrumbs,
  commandBarItems,
  hideCommandBar = false,
  hideBreadcrumb = false,
  setupComplete = true,
  onRunSetup
}) => {
  const strings = useStrings();
  const { isMobile } = useBreakpoint();
  const { isTeams } = useAppContext();
  const { isDarkTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const drawerNav = isMobile || isTeams;

  const [navCollapsed, setNavCollapsed] = React.useState(isTeams);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (!drawerNav) {
      setMobileNavOpen(false);
    }
  }, [drawerNav]);

  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const resolvedBreadcrumbs = breadcrumbs ?? buildDefaultBreadcrumbs(location.pathname, strings);

  const handleNavToggle = (): void => {
    if (drawerNav) {
      setMobileNavOpen(prev => !prev);
    } else {
      setNavCollapsed(prev => !prev);
    }
  };

  const navExpanded = drawerNav ? mobileNavOpen : !navCollapsed;

  return (
    <div className={styles.shell} role="application" aria-label={APP_NAME}>
      {drawerNav && mobileNavOpen && (
        <div
          className={`${styles.navOverlay} ${styles.navOverlayVisible}`}
          onClick={() => setMobileNavOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setMobileNavOpen(false); }}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.navRegion} ${navExpanded ? styles.navRegionExpanded : styles.navRegionCollapsed} ${drawerNav && mobileNavOpen ? styles.navRegionMobileOpen : ''} ${drawerNav ? styles.navRegionDrawer : ''}`}
        aria-label={strings.navigation.dashboard}
      >
        <LeftNavigation
          collapsed={!navExpanded && !drawerNav}
          onNavigate={() => { if (drawerNav) setMobileNavOpen(false); }}
          setupComplete={setupComplete}
          onRunSetup={onRunSetup}
        />
      </aside>

      <div className={styles.main}>
        <header className={styles.header} role="banner">
          <div className={styles.headerStart}>
            <Tooltip
              content={navExpanded ? strings.common.close : 'Expand navigation'}
              relationship="label"
            >
              <Button
                appearance="subtle"
                icon={navExpanded ? <NavigationFilled /> : <NavigationRegular />}
                onClick={handleNavToggle}
                aria-label={navExpanded ? 'Collapse navigation' : 'Expand navigation'}
                aria-expanded={navExpanded}
                aria-controls="ec365-left-nav"
              />
            </Tooltip>
            <AppBrandIcon variant="inline" />
            <span className={styles.appTitle}>{APP_NAME}</span>
          </div>

          <div className={styles.headerCenter}>
            {setupComplete ? <GlobalSearch /> : null}
          </div>

          <div className={styles.headerEnd}>
            <Tooltip
              content={isDarkTheme ? strings.settings.themeLight : strings.settings.themeDark}
              relationship="label"
            >
              <Button
                appearance="subtle"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
              >
                {isDarkTheme ? '☀' : '☾'}
              </Button>
            </Tooltip>
            <NotificationBell />
            <ProfileMenu />
            {drawerNav && mobileNavOpen && (
              <Button
                appearance="subtle"
                icon={<DismissRegular />}
                onClick={() => setMobileNavOpen(false)}
                aria-label={strings.common.close}
              />
            )}
          </div>
        </header>

        {!hideBreadcrumb && resolvedBreadcrumbs.length > 1 && (
          <nav className={styles.breadcrumbRow} aria-label="Breadcrumb">
            <BreadcrumbNav items={resolvedBreadcrumbs} />
          </nav>
        )}

        {!hideCommandBar && commandBarItems && commandBarItems.length > 0 && (
          <div className={styles.commandBarRow} role="toolbar" aria-label={strings.common.actions}>
            <TopCommandBar items={commandBarItems} />
          </div>
        )}

        <main className={styles.content} id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
        <footer className={styles.footer}>Chronodat, LLC © {new Date().getFullYear()}</footer>
      </div>
    </div>
  );
};
