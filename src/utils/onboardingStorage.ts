import { IOnboardingStepResult } from '../services/provisioning/types';

const STORAGE_KEY = 'enterprise-classifieds-provisioning-v1';

export interface IProvisioningScope {
  tenantId: string;
  siteUrl: string;
  userId: string;
}

function scopeKey(scope: IProvisioningScope): string {
  return `${STORAGE_KEY}:${scope.tenantId}:${scope.siteUrl}:${scope.userId}`;
}

export function hasCompletedProvisioning(scope: IProvisioningScope): boolean {
  try {
    return localStorage.getItem(scopeKey(scope)) === 'done';
  } catch {
    return false;
  }
}

export function markProvisioningComplete(scope: IProvisioningScope): void {
  try {
    localStorage.setItem(scopeKey(scope), 'done');
  } catch {
    /* storage unavailable */
  }
}

export function resetProvisioning(scope: IProvisioningScope): void {
  try {
    localStorage.removeItem(scopeKey(scope));
  } catch {
    /* storage unavailable */
  }
}

export function createInitialOnboardingSteps(): IOnboardingStepResult[] {
  return [
    { step: 'validate', label: 'Access verification', success: false, errors: [] },
    { step: 'groups', label: 'Security groups', success: false, errors: [] },
    { step: 'lists', label: 'Reference lists', success: false, errors: [] },
    { step: 'libraries', label: 'Document libraries', success: false, errors: [] },
    { step: 'settings', label: 'Finalize settings', success: false, errors: [] },
    { step: 'complete', label: 'Ready', success: false, errors: [] }
  ];
}

export function buildProvisioningScope(context: {
  pageContext: {
    aadInfo?: { tenantId?: { toString(): string } };
    web: { absoluteUrl: string };
    user: { loginName: string };
  };
}): IProvisioningScope {
  return {
    tenantId: context.pageContext.aadInfo?.tenantId?.toString() || 'local',
    siteUrl: context.pageContext.web.absoluteUrl,
    userId: context.pageContext.user.loginName || 'anonymous'
  };
}
