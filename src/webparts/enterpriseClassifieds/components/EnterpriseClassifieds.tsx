import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { DisplayMode } from '@microsoft/sp-core-library';
import { AppProvider } from '../../../providers';
import { AppShell } from '../../../layouts';
import { AppRouter } from '../../../pages/AppRouter';
import { ErrorBoundary } from '../../../controls';
import { AppLoader, ProvisioningOnboarding } from '../../../components/Onboarding';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { OnboardingService } from '../../../services/OnboardingService';
import { IOnboardingStatus, IOnboardingStepResult } from '../../../services/provisioning/types';
import {
  buildProvisioningScope,
  createInitialOnboardingSteps,
  hasCompletedProvisioning
} from '../../../utils/onboardingStorage';
import { removeAppLoadingState, removeBootstrapLoader } from '../../../utils/loadAppStyles';
import { useLocalization, useAppContext } from '../../../hooks';
import { SubscriptionGate } from '../../../components/Subscription/SubscriptionGate';
import { useSubscriptionAccess } from '../../../hooks/useSubscriptionAccess';
import type { IEnterpriseClassifiedsProps } from './IEnterpriseClassifiedsProps';
import styles from './EnterpriseClassifieds.module.scss';

const HOST_SELECTOR = '.ec365-webpart-host';

const EnterpriseClassifiedsApp: React.FC<IEnterpriseClassifiedsProps> = ({
  context,
  isDarkTheme,
  hasTeamsContext,
  displayMode
}) => {
  const { strings } = useLocalization();
  const { serviceContainerReady } = useAppContext();
  const s = strings as import('../../../localization/en-us').IAppStrings;

  const [bootstrapped, setBootstrapped] = React.useState(false);
  const [status, setStatus] = React.useState<IOnboardingStatus | undefined>();
  const [visibleSteps, setVisibleSteps] = React.useState<IOnboardingStepResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [provisioningError, setProvisioningError] = React.useState('');
  const [statusLoading, setStatusLoading] = React.useState(true);

  const scope = React.useMemo(() => buildProvisioningScope(context), [context]);
  const subscriptionHost = React.useMemo(() => ({
    tenantId: context.pageContext.aadInfo?.tenantId?.toString() ?? '',
    siteUrl: context.pageContext.web.absoluteUrl,
    siteTitle: context.pageContext.web.title,
    userEmail: context.pageContext.user.email
  }), [context]);

  const setupComplete = React.useMemo(
    () => hasCompletedProvisioning(scope) || Boolean(status && !status.required),
    [scope, status]
  );
  const subscriptionAccess = useSubscriptionAccess(subscriptionHost, bootstrapped && setupComplete);

  const shellSetupComplete = React.useMemo(
    () => (status ? !status.required : setupComplete),
    [status, setupComplete]
  );

  React.useEffect(() => {
    setBootstrapped(true);
  }, []);

  React.useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    const host = document.querySelector(HOST_SELECTOR) as HTMLElement | null;
    removeAppLoadingState(host ?? undefined);
    if (host) {
      removeBootstrapLoader(host);
    }
  }, [bootstrapped]);

  const refreshStatus = React.useCallback(async (options?: { showLoading?: boolean }): Promise<void> => {
    if (options?.showLoading !== false) {
      setStatusLoading(true);
    }
    try {
      const service = ServiceContainer.getInstance().resolve<OnboardingService>(SERVICE_KEYS.OnboardingService);
      const nextStatus = await service.getStatus();
      setStatus(nextStatus);
    } catch {
      setStatus({
        required: true,
        complete: false,
        groupsProvisioned: false,
        listsProvisioned: false,
        canRunOnboarding: false,
        message: s.onboarding.adminRequired
      });
    } finally {
      setStatusLoading(false);
    }
  }, [s.onboarding.adminRequired]);

  React.useEffect(() => {
    if (!bootstrapped || !serviceContainerReady) {
      return;
    }
    refreshStatus().catch(() => undefined);
  }, [bootstrapped, serviceContainerReady, refreshStatus]);

  const onboardingProps = React.useMemo(() => ({
    steps: visibleSteps,
    isRunning,
    error: provisioningError,
    canRun: status?.canRunOnboarding ?? false,
    adminRequiredMessage: status?.message ?? s.onboarding.adminRequired,
    title: s.onboarding.title,
    subtitle: s.onboarding.subtitle,
    startLabel: s.onboarding.startButton,
    runningLabel: s.onboarding.running,
    isTeamsHost: hasTeamsContext,
    isSiteOwner: status?.canRunOnboarding ?? false
  }), [
    visibleSteps,
    isRunning,
    provisioningError,
    status,
    s,
    hasTeamsContext
  ]);

  const handleRunSetup = React.useCallback((): void => {
    setIsRunning(true);
    setProvisioningError('');
    setVisibleSteps(createInitialOnboardingSteps());

    try {
      const service = ServiceContainer.getInstance().resolve<OnboardingService>(SERVICE_KEYS.OnboardingService);
      service.runOnboarding(step => {
        setVisibleSteps(prev => {
          const index = prev.findIndex(item => item.step === step.step);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = step;
            return updated;
          }
          return [...prev, step];
        });
      }).then(async result => {
        if (!result.success) {
          setProvisioningError(s.onboarding.setupFailed);
          return refreshStatus();
        }

        if (hasCompletedProvisioning(scope)) {
          setStatus({
            required: false,
            complete: true,
            groupsProvisioned: true,
            listsProvisioned: true,
            canRunOnboarding: true,
            message: undefined
          });
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        return refreshStatus({ showLoading: false });
      }).catch(err => {
        setProvisioningError(err instanceof Error ? err.message : s.onboarding.setupFailed);
      }).finally(() => {
        setIsRunning(false);
      });
    } catch (err) {
      setIsRunning(false);
      setProvisioningError(err instanceof Error ? err.message : s.onboarding.setupFailed);
    }
  }, [refreshStatus, s.onboarding.setupFailed, scope]);

  if (!bootstrapped || !serviceContainerReady || statusLoading) {
    return (
      <div className={styles.enterpriseClassifieds} data-app="enterprise-classifieds-365">
        <AppLoader label={s.onboarding.checkingStatus} />
      </div>
    );
  }

  if (!setupComplete) {
    return (
      <div
        className={`${styles.enterpriseClassifieds} ${styles.setupMode} ${hasTeamsContext ? styles.teams : ''}`}
        data-app="enterprise-classifieds-365"
        data-setup-mode="true"
      >
        <ProvisioningOnboarding
          {...onboardingProps}
          isPageEditMode={displayMode === DisplayMode.Edit}
          onStart={handleRunSetup}
          onCompleteSetup={handleRunSetup}
        />
      </div>
    );
  }

  return (
    <SubscriptionGate access={subscriptionAccess} host={subscriptionHost}>
      <div
        className={`${styles.enterpriseClassifieds} ${hasTeamsContext ? styles.teams : ''}`}
        data-app="enterprise-classifieds-365"
      >
        <HashRouter>
          <AppShell setupComplete={shellSetupComplete} onRunSetup={handleRunSetup}>
            <AppRouter />
          </AppShell>
        </HashRouter>
      </div>
    </SubscriptionGate>
  );
};

const EnterpriseClassifieds: React.FC<IEnterpriseClassifiedsProps> = (props) => (
  <ErrorBoundary>
    <AppProvider
      context={props.context}
      isDarkTheme={props.isDarkTheme}
      isTeams={props.hasTeamsContext}
    >
      <EnterpriseClassifiedsApp {...props} />
    </AppProvider>
  </ErrorBoundary>
);

export default EnterpriseClassifieds;
