import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CounterBadge, Tooltip } from '@fluentui/react-components';
import {
  HomeRegular,
  HomeFilled,
  GridRegular,
  GridFilled,
  AddRegular,
  FolderRegular,
  FolderFilled,
  HeartRegular,
  HeartFilled,
  SearchRegular,
  SearchFilled,
  ChatRegular,
  ChatFilled,
  StarRegular,
  StarFilled,
  FlagRegular,
  FlagFilled,
  ShieldRegular,
  ShieldFilled,
  SettingsRegular,
  SettingsFilled,
  QuestionCircleRegular,
  QuestionCircleFilled,
  DocumentRegular,
  DocumentFilled
} from '@fluentui/react-icons';
import { APP_NAME, ROUTES, ROLES } from '../constants';
import { INavigationItem } from '../interfaces';
import { useStrings, usePermissions } from '../hooks';
import { AppBrandIcon } from '../components/Layout/AppBrandIcon';
import styles from './LeftNavigation.module.scss';

export interface ILeftNavigationProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  messageBadge?: number;
  reportBadge?: number;
  setupComplete?: boolean;
  onRunSetup?: () => void;
}

type NavIconComponent = React.FC<{ filled?: boolean }>;

const ICON_MAP: Record<string, { regular: NavIconComponent; filled: NavIconComponent }> = {
  Home: { regular: () => <HomeRegular />, filled: () => <HomeFilled /> },
  Grid: { regular: () => <GridRegular />, filled: () => <GridFilled /> },
  Add: { regular: () => <AddRegular />, filled: () => <AddRegular /> },
  Folder: { regular: () => <FolderRegular />, filled: () => <FolderFilled /> },
  Heart: { regular: () => <HeartRegular />, filled: () => <HeartFilled /> },
  Search: { regular: () => <SearchRegular />, filled: () => <SearchFilled /> },
  Chat: { regular: () => <ChatRegular />, filled: () => <ChatFilled /> },
  Star: { regular: () => <StarRegular />, filled: () => <StarFilled /> },
  Flag: { regular: () => <FlagRegular />, filled: () => <FlagFilled /> },
  Shield: { regular: () => <ShieldRegular />, filled: () => <ShieldFilled /> },
  Settings: { regular: () => <SettingsRegular />, filled: () => <SettingsFilled /> },
  Help: { regular: () => <QuestionCircleRegular />, filled: () => <QuestionCircleFilled /> },
  Document: { regular: () => <DocumentRegular />, filled: () => <DocumentFilled /> }
};

function NavIcon({ name, active }: { name?: string; active: boolean }): React.ReactElement {
  const entry = name ? ICON_MAP[name] : undefined;
  if (!entry) return <GridRegular />;
  return active ? <entry.filled /> : <entry.regular />;
}

function isPathActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === ROUTES.Dashboard) {
    return currentPath === '/' || currentPath === '';
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function canViewItem(
  item: INavigationItem,
  permissions: ReturnType<typeof usePermissions>,
  hasRole: (role: string) => boolean
): boolean {
  if (!item.roles || item.roles.length === 0) return true;

  return item.roles.some(role => {
    if (role === ROLES.Owner) return permissions.canAdmin;
    if (role === ROLES.Moderator) return permissions.canModerate;
    if (role === ROLES.Approver) return permissions.canApprove;
    return hasRole(role);
  });
}

export const LeftNavigation: React.FC<ILeftNavigationProps> = ({
  collapsed = false,
  onNavigate,
  messageBadge = 0,
  reportBadge = 0,
  setupComplete = true,
  onRunSetup
}) => {
  const strings = useStrings();
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions();

  const navItems = React.useMemo((): INavigationItem[] => [
    { key: 'dashboard', label: strings.navigation.dashboard, icon: 'Home', path: ROUTES.Dashboard },
    { key: 'listings', label: strings.navigation.listings, icon: 'Grid', path: ROUTES.Listings },
    { key: 'create', label: strings.navigation.createListing, icon: 'Add', path: ROUTES.CreateListing },
    { key: 'my-listings', label: strings.navigation.myListings, icon: 'Document', path: ROUTES.MyListings },
    { key: 'categories', label: strings.navigation.categories, icon: 'Folder', path: ROUTES.Categories },
    { key: 'favorites', label: strings.navigation.favorites, icon: 'Heart', path: ROUTES.Favorites },
    { key: 'wanted', label: strings.navigation.wantedAds, icon: 'Search', path: ROUTES.WantedAds },
    { key: 'messages', label: strings.navigation.messages, icon: 'Chat', path: ROUTES.Messages, badge: messageBadge },
    { key: 'reviews', label: strings.navigation.reviews, icon: 'Star', path: ROUTES.Reviews },
    {
      key: 'reports',
      label: strings.navigation.reports,
      icon: 'Flag',
      path: ROUTES.Reports,
      badge: reportBadge,
      roles: [ROLES.Moderator, ROLES.Owner]
    },
    {
      key: 'admin',
      label: strings.navigation.admin,
      icon: 'Shield',
      path: ROUTES.Admin,
      roles: [ROLES.Owner]
    },
    { key: 'settings', label: strings.navigation.settings, icon: 'Settings', path: ROUTES.Settings },
    { key: 'help', label: strings.navigation.help, icon: 'Help', path: ROUTES.Help }
  ], [strings, messageBadge, reportBadge]);

  const visibleItems = React.useMemo(
    () => navItems.filter(item => canViewItem(item, permissions, permissions.hasRole)),
    [navItems, permissions]
  );

  const handleNavigate = (path: string): void => {
    navigate(path);
    onNavigate?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent, path: string): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate(path);
    }
  };

  return (
    <nav
      id="ec365-left-nav"
      className={`${styles.nav} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main navigation"
    >
      <div className={styles.brand}>
        <AppBrandIcon variant="nav" className={styles.brandIcon} />
        {!collapsed && <span className={styles.brandText}>{APP_NAME}</span>}
      </div>

      <ul className={styles.navList} role="list">
        {!setupComplete ? (
          <li className={styles.navItem} role="listitem">
            {!collapsed && (
              <div className={styles.sectionHeader}>{strings.onboarding.completeSetup.toUpperCase()}</div>
            )}
            <div className={styles.navLinkWrapper}>
              <button
                type="button"
                className={`${styles.navLink} ${styles.navLinkActive}`}
                onClick={() => onRunSetup?.()}
                aria-current="page"
                aria-label={collapsed ? strings.onboarding.completeSetup : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <SettingsRegular />
                </span>
                <span className={styles.navLabel}>{strings.onboarding.completeSetup}</span>
              </button>
            </div>
          </li>
        ) : visibleItems.map(item => {
          const active = isPathActive(location.pathname, item.path);
          const linkContent = (
            <>
              <span className={styles.navIcon} aria-hidden="true">
                <NavIcon name={item.icon} active={active} />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <CounterBadge
                  className={styles.badge}
                  count={item.badge}
                  size="small"
                  aria-label={`${item.badge} unread`}
                />
              )}
            </>
          );

          const link = (
            <div className={styles.navLinkWrapper}>
              <button
                type="button"
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                onClick={() => handleNavigate(item.path)}
                onKeyDown={(e) => handleKeyDown(e, item.path)}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                {linkContent}
              </button>
            </div>
          );

          return (
            <li key={item.key} className={styles.navItem} role="listitem">
              {collapsed ? (
                <Tooltip content={item.label} relationship="label" positioning="after">
                  {link}
                </Tooltip>
              ) : link}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
