import { CHRONODAT_SUBSCRIPTION_API, PRODUCT_SLUG } from '../constants/store';

export type SubscriptionStatusValue = 'trialing' | 'active' | 'past_due' | 'expired' | 'canceled';

export interface ISubscriptionStatus {
  status: SubscriptionStatusValue;
  hasAccess: boolean;
  trialDaysTotal: number;
  trialDaysRemaining: number;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  customerEmail?: string;
}

export interface ISubscriptionHost {
  tenantId: string;
  siteUrl: string;
  siteTitle: string;
  userEmail: string;
  licenseKey?: string;
}

function api(path: string): string {
  return `${CHRONODAT_SUBSCRIPTION_API.replace(/\/+$/, '')}${path}`;
}

async function readError(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return body.error || `${fallback} (${response.status})`;
}

export async function getSubscriptionStatus(host: ISubscriptionHost): Promise<ISubscriptionStatus> {
  const query = new URLSearchParams({
    tenantId: host.tenantId,
    siteUrl: host.siteUrl,
    productSlug: PRODUCT_SLUG,
    siteTitle: host.siteTitle,
    userEmail: host.userEmail
  });
  if (host.licenseKey) {
    query.set('licenseKey', host.licenseKey);
  }
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);
  let response: Response;
  try {
    response = await fetch(api(`/api/subscription/status?${query.toString()}`), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === 'AbortError') {
      throw new Error('The subscription service did not respond.');
    }
    throw caught;
  } finally {
    window.clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(await readError(response, 'Subscription status failed'));
  }
  return (await response.json()) as ISubscriptionStatus;
}

export async function startSubscriptionCheckout(host: ISubscriptionHost, returnUrl: string): Promise<string> {
  const response = await fetch(api('/api/subscription/checkout'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: host.tenantId,
      siteUrl: host.siteUrl,
      siteTitle: host.siteTitle,
      userEmail: host.userEmail,
      productSlug: PRODUCT_SLUG,
      successUrl: returnUrl,
      cancelUrl: returnUrl
    })
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Checkout failed'));
  }
  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Checkout did not return a redirect URL.');
  }
  return data.url;
}

export function hostedSubscribeUrl(host: ISubscriptionHost, returnUrl: string): string {
  const query = new URLSearchParams({
    tenantId: host.tenantId,
    siteUrl: host.siteUrl,
    siteTitle: host.siteTitle,
    userEmail: host.userEmail,
    productSlug: PRODUCT_SLUG,
    returnUrl
  });
  return api(`/subscribe?${query.toString()}`);
}
