import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/site-users/web';
import { SPHttpClient } from '@microsoft/sp-http';
import { initializePnP } from './SharePointContextFactory';
import { ProvisioningService } from './ProvisioningService';
import { SettingRepository } from '../repositories/SettingRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import {
  IOnboardingResult,
  IOnboardingStatus,
  IOnboardingStepResult,
  IProvisioningSummary,
  ISecurityGroupsSchema,
  OnboardingStepId
} from './provisioning/types';
import { LIBRARIES_SCHEMA, LIST_SCHEMAS } from './provisioning/schemaRegistry';
import { LIST_NAMES, ONBOARDING_SETTINGS } from '../constants';
import {
  hasCompletedProvisioning,
  IProvisioningScope,
  markProvisioningComplete,
  resetProvisioning
} from '../utils/onboardingStorage';

import securityGroupsSchema from '../../provisioning/security/groups.json';

export type OnboardingProgressCallback = (step: IOnboardingStepResult) => void;

const yieldToUi = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0));

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return new Promise(resolve => {
    const timer = window.setTimeout(() => resolve(fallback), timeoutMs);
    promise.then(value => {
      window.clearTimeout(timer);
      resolve(value);
    }).catch(() => {
      window.clearTimeout(timer);
      resolve(fallback);
    });
  });
}

export class OnboardingService {
  private context: WebPartContext;
  private provisioningService: ProvisioningService;
  private settingRepository: SettingRepository;
  private activityLogRepository: ActivityLogRepository;
  private scope: IProvisioningScope;

  constructor(context: WebPartContext) {
    this.context = context;
    this.provisioningService = new ProvisioningService(context);
    this.settingRepository = new SettingRepository(context);
    this.activityLogRepository = new ActivityLogRepository(context);
    this.scope = {
      tenantId: context.pageContext.aadInfo?.tenantId?.toString() || 'local',
      siteUrl: context.pageContext.web.absoluteUrl,
      userId: context.pageContext.user.loginName || 'anonymous'
    };
  }

  public getScope(): IProvisioningScope {
    return this.scope;
  }

  public async getStatus(): Promise<IOnboardingStatus> {
    const canRunOnboarding = await withTimeout(this.canCurrentUserRunOnboarding(), 8000, false);
    let listsProvisioned = false;

    listsProvisioned = await withTimeout(this.provisioningService.isCoreListProvisioned(), 8000, false);

    if (hasCompletedProvisioning(this.scope)) {
      if (listsProvisioned) {
        return {
          required: false,
          complete: true,
          groupsProvisioned: true,
          listsProvisioned: true,
          canRunOnboarding,
          message: undefined
        };
      }
      resetProvisioning(this.scope);
    }

    let groupsProvisioned = false;
    let complete = false;

    groupsProvisioned = await withTimeout(this.provisioningService.areSecurityGroupsProvisioned(), 8000, false);

    if (listsProvisioned) {
      complete = await withTimeout(this.isOnboardingSettingComplete(true), 8000, false);
    }

    const required = !listsProvisioned || !complete;

    let message: string | undefined;
    if (!canRunOnboarding && required) {
      message = 'A site owner must complete onboarding before others can use the application.';
    }

    return {
      required,
      complete,
      groupsProvisioned,
      listsProvisioned,
      canRunOnboarding,
      message
    };
  }

  public async isOnboardingRequired(): Promise<boolean> {
    if (hasCompletedProvisioning(this.scope)) {
      return false;
    }
    const status = await this.getStatus();
    return status.required;
  }

  public async runOnboarding(onProgress?: OnboardingProgressCallback): Promise<IOnboardingResult> {
    const steps: IOnboardingStepResult[] = [];

    const emit = async (step: OnboardingStepId, label: string, success: boolean, message?: string, errors: string[] = []): Promise<void> => {
      const result: IOnboardingStepResult = { step, label, success, message, errors };
      steps.push(result);
      onProgress?.(result);
      await yieldToUi();
    };

    const canRun = await this.canCurrentUserRunOnboarding();
    await emit(
      'validate',
      'Access verification',
      canRun,
      canRun ? 'Site owner verified.' : 'Current user cannot manage this site.',
      canRun ? [] : ['Site owner permissions are required.']
    );

    if (!canRun) {
      return { required: true, success: false, steps };
    }

    const schema = securityGroupsSchema as unknown as ISecurityGroupsSchema;
    const groupResults = await this.provisioningService.provisionSecurityGroups(schema, {
      skipExisting: true,
      seedMembers: true
    });
    const groupErrors = groupResults.flatMap(r => r.errors);
    await emit(
      'groups',
      'Create security groups',
      groupErrors.length === 0,
      `${groupResults.filter(r => r.created).length} created, ${groupResults.filter(r => r.skipped).length} already existed.`,
      groupErrors
    );

    const listErrors: string[] = [];
    let listsCreated = 0;
    let listsSkipped = 0;

    for (const listSchema of LIST_SCHEMAS) {
      const result = await this.provisioningService.provisionList(listSchema, {
        skipExisting: true,
        seedData: true
      });
      if (result.created) listsCreated++;
      if (result.skipped) listsSkipped++;
      listErrors.push(...result.errors);
      await yieldToUi();
    }

    await emit(
      'lists',
      'Provision SharePoint lists',
      listErrors.length === 0,
      `${listsCreated} created, ${listsSkipped} skipped.`,
      listErrors
    );

    const libraryErrors: string[] = [];
    let librariesCreated = 0;

    for (const library of LIBRARIES_SCHEMA.libraries) {
      const result = await this.provisioningService.provisionLibrary(library, { skipExisting: true });
      if (result.created) librariesCreated++;
      libraryErrors.push(...result.errors);
      await yieldToUi();
    }

    await emit(
      'libraries',
      'Provision document libraries',
      libraryErrors.length === 0,
      `${librariesCreated} libraries created.`,
      libraryErrors
    );

    const settingsErrors = await this.markOnboardingComplete();
    await emit(
      'settings',
      'Finalize settings',
      settingsErrors.length === 0,
      'Onboarding settings updated.',
      settingsErrors
    );

    await this.logOnboardingActivity(steps);

    const listsReady = listErrors.length === 0 && libraryErrors.length === 0 && settingsErrors.length === 0;
    const summary: IProvisioningSummary = {
      lists: [],
      libraries: [],
      groups: groupResults,
      success: listsReady
    };
    if (listsReady) {
      markProvisioningComplete(this.scope);
    }

    await emit(
      'complete',
      'Onboarding complete',
      listsReady,
      listsReady
        ? 'Enterprise Classifieds 365 is ready to use.'
        : 'Setup finished with errors. Review the steps above and try again.',
      listsReady ? [] : steps.flatMap(step => step.errors)
    );

    return { required: !listsReady, success: listsReady, steps, summary };
  }

  private async canCurrentUserRunOnboarding(): Promise<boolean> {
    const manageWeb = 1073741824;
    try {
      const { sp } = initializePnP(this.context);
      const currentUser = await sp.web.currentUser.select('IsSiteAdmin')();
      if (currentUser.IsSiteAdmin) {
        return true;
      }
      const response = await this.context.spHttpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/effectivebasepermissions`,
        SPHttpClient.configurations.v1,
        { headers: { accept: 'application/json;odata=nometadata' } }
      );
      if (!response.ok) {
        return false;
      }
      const permissions = await response.json() as { Low?: number | string };
      return (Number(permissions.Low) & manageWeb) === manageWeb;
    } catch {
      return false;
    }
  }

  private async isOnboardingSettingComplete(listKnownToExist = false): Promise<boolean> {
    if (!listKnownToExist && !await this.provisioningService.isCoreListProvisioned()) {
      return false;
    }
    try {
      const setting = await this.settingRepository.getByKey(ONBOARDING_SETTINGS.Complete);
      return setting?.value === 'true';
    } catch {
      return false;
    }
  }

  private async markOnboardingComplete(): Promise<string[]> {
    const errors: string[] = [];
    const now = new Date().toISOString();
    const userLogin = this.context.pageContext.user.loginName;

    const updates: Array<{ key: string; value: string; category: 'General'; description: string }> = [
      {
        key: ONBOARDING_SETTINGS.Complete,
        value: 'true',
        category: 'General',
        description: 'Whether initial onboarding and provisioning has completed.'
      },
      {
        key: ONBOARDING_SETTINGS.CompletedOn,
        value: now,
        category: 'General',
        description: 'Timestamp when onboarding completed.'
      },
      {
        key: ONBOARDING_SETTINGS.CompletedBy,
        value: userLogin,
        category: 'General',
        description: 'User who completed onboarding.'
      },
      {
        key: ONBOARDING_SETTINGS.Version,
        value: '1.0.0',
        category: 'General',
        description: 'Onboarding schema version applied.'
      }
    ];

    if (!await this.provisioningService.isCoreListProvisioned()) {
      return ['Settings list is not available yet.'];
    }

    for (const update of updates) {
      try {
        const existing = await this.settingRepository.getByKey(update.key);
        if (existing) {
          await this.settingRepository.update(existing.id, { value: update.value });
        } else {
          await this.settingRepository.create({
            key: update.key,
            value: update.value,
            category: update.category,
            description: update.description
          });
        }
      } catch (error) {
        errors.push(`${update.key}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return errors;
  }

  private async logOnboardingActivity(steps: IOnboardingStepResult[]): Promise<void> {
    if (!await this.provisioningService.isCoreListProvisioned()) {
      return;
    }

    try {
      await this.activityLogRepository.log({
        userId: this.context.pageContext.user.loginName,
        userDisplayName: this.context.pageContext.user.displayName,
        action: 'OnboardingCompleted',
        entityType: LIST_NAMES.Settings,
        entityId: 0,
        details: JSON.stringify(steps.map(step => ({
          step: step.step,
          success: step.success,
          message: step.message
        })))
      });
    } catch {
      /* best effort */
    }
  }
}

export type { OnboardingStepId, IOnboardingStepResult, IOnboardingStatus, IOnboardingResult };
