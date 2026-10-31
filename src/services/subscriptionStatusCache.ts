import { SUBSCRIPTION_STATUS_FRESH_MS, SUBSCRIPTION_STATUS_GRACE_MS } from '../constants/store';
import { ISubscriptionStatus } from './subscriptionClient';

const STORAGE_PREFIX = 'enterprise-classifieds-365-subscription-status-v1';
const LICENSE_KEY = 'enterprise-classifieds-365-license-key';

interface ICachedSubscriptionStatus {
  status: ISubscriptionStatus;
  cachedAt: number;
}

function storageKey(siteUrl: string, tenantId: string, productSlug: string): string {
  return `${STORAGE_PREFIX}:${tenantId.trim().toLowerCase()}:${siteUrl.trim().toLowerCase()}:${productSlug.trim().toLowerCase()}`;
}

export function writeCachedSubscriptionStatus(
  siteUrl: string,
  tenantId: string,
  productSlug: string,
  status: ISubscriptionStatus
): void {
  if (!siteUrl || typeof localStorage === 'undefined') return;
  try {
    const payload: ICachedSubscriptionStatus = { status, cachedAt: Date.now() };
    localStorage.setItem(storageKey(siteUrl, tenantId, productSlug), JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export interface ICachedStatusResult {
  status: ISubscriptionStatus;
  fresh: boolean;
  withinGrace: boolean;
}

export function readCachedSubscriptionStatus(
  siteUrl: string,
  tenantId: string,
  productSlug: string
): ICachedStatusResult | undefined {
  if (!siteUrl || typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(storageKey(siteUrl, tenantId, productSlug));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<ICachedSubscriptionStatus>;
    if (!parsed?.status || typeof parsed.cachedAt !== 'number' || typeof parsed.status.hasAccess !== 'boolean') {
      return undefined;
    }
    const ageMs = Date.now() - parsed.cachedAt;
    return {
      status: parsed.status,
      fresh: ageMs >= 0 && ageMs <= SUBSCRIPTION_STATUS_FRESH_MS,
      withinGrace: ageMs >= 0 && ageMs <= SUBSCRIPTION_STATUS_GRACE_MS
    };
  } catch {
    return undefined;
  }
}

export function readLicenseKey(): string {
  try {
    return localStorage.getItem(LICENSE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeLicenseKey(value: string): void {
  try {
    if (value.trim()) localStorage.setItem(LICENSE_KEY, value.trim());
    else localStorage.removeItem(LICENSE_KEY);
  } catch {
    /* ignore */
  }
}
