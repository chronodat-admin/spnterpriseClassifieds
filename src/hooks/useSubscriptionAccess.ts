import * as React from 'react';
import { PRODUCT_SLUG } from '../constants/store';
import {
  ISubscriptionHost,
  ISubscriptionStatus,
  getSubscriptionStatus,
  startSubscriptionCheckout
} from '../services/subscriptionClient';
import {
  readCachedSubscriptionStatus,
  readLicenseKey,
  writeCachedSubscriptionStatus,
  writeLicenseKey
} from '../services/subscriptionStatusCache';

export interface ISubscriptionAccess {
  checking: boolean;
  error: string;
  status: ISubscriptionStatus | undefined;
  connectivityError: boolean;
  hasAccess: boolean;
  licenseKey: string;
  refresh: () => Promise<void>;
  checkout: () => Promise<void>;
  saveLicenseKey: (value: string) => void;
}

export function useSubscriptionAccess(host: ISubscriptionHost, enabled: boolean): ISubscriptionAccess {
  const stableHost = React.useMemo(() => host, [host.tenantId, host.siteUrl, host.siteTitle, host.userEmail, host.licenseKey]);
  const [checking, setChecking] = React.useState(true);
  const [error, setError] = React.useState('');
  const [status, setStatus] = React.useState<ISubscriptionStatus | undefined>();
  const [connectivityError, setConnectivityError] = React.useState(false);
  const [licenseKey, setLicenseKey] = React.useState(readLicenseKey);

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!enabled) return;
    if (!stableHost.tenantId || !stableHost.siteUrl) {
      setConnectivityError(true);
      setError('Unable to determine the Microsoft 365 tenant or SharePoint site for the subscription check.');
      setChecking(false);
      return;
    }
    const cached = readCachedSubscriptionStatus(stableHost.siteUrl, stableHost.tenantId, PRODUCT_SLUG);
    setChecking(true);
    setError('');
    try {
      const next = await getSubscriptionStatus({ ...stableHost, licenseKey: licenseKey || undefined });
      setStatus(next);
      setConnectivityError(false);
      writeCachedSubscriptionStatus(stableHost.siteUrl, stableHost.tenantId, PRODUCT_SLUG, next);
    } catch (caught) {
      if (cached?.withinGrace) {
        setStatus(cached.status);
        setConnectivityError(false);
        setError('');
      } else {
        setStatus(undefined);
        setConnectivityError(true);
        setError(caught instanceof Error ? caught.message : 'Failed to load subscription status.');
      }
    } finally {
      setChecking(false);
    }
  }, [enabled, licenseKey, stableHost]);

  React.useEffect(() => {
    if (!enabled) return undefined;
    const cached = readCachedSubscriptionStatus(stableHost.siteUrl, stableHost.tenantId, PRODUCT_SLUG);
    if (cached?.fresh) {
      setStatus(cached.status);
      setConnectivityError(false);
      setChecking(false);
      return undefined;
    }
    refresh().catch(() => undefined);
    return undefined;
  }, [enabled, refresh, stableHost]);

  const checkout = React.useCallback(async (): Promise<void> => {
    const url = await startSubscriptionCheckout(stableHost, window.location.href);
    window.location.assign(url);
  }, [stableHost]);

  const saveLicenseKey = React.useCallback((value: string): void => {
    writeLicenseKey(value);
    setLicenseKey(value.trim());
  }, []);

  return {
    checking: enabled && checking,
    error,
    status,
    connectivityError,
    hasAccess: Boolean(status?.hasAccess),
    licenseKey,
    refresh,
    checkout,
    saveLicenseKey
  };
}
