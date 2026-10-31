import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Button,
  Card,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  Title3
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  CircleRegular,
  DismissCircleRegular,
  DismissRegular,
  PlayRegular
} from '@fluentui/react-icons';
import { IOnboardingStepResult } from '../../services/provisioning/types';
import { useLocalization } from '../../hooks';
import { WizardStepper } from '../../controls';
import { AppBrandIcon } from '../Layout/AppBrandIcon';
import { AppLoader } from './AppLoader';
import styles from './ProvisioningOnboarding.module.scss';

const SETUP_PORTAL_CLASS = 'ec365-setup-portal';

export interface IProvisioningOnboardingProps {
  steps: IOnboardingStepResult[];
  isRunning: boolean;
  error?: string;
  canRun: boolean;
  adminRequiredMessage: string;
  title: string;
  subtitle: string;
  startLabel: string;
  runningLabel: string;
  onStart: () => void;
  variant?: 'page' | 'modal';
  isTeamsHost?: boolean;
  isSiteOwner?: boolean;
  showSetupNotifications?: boolean;
  onClose?: () => void;
  onCompleteSetup?: () => void;
  onOpenSettings?: () => void;
  isPageEditMode?: boolean;
}

function getStepVisual(
  step: IOnboardingStepResult,
  isRunning: boolean,
  activeStepId?: string
): React.ReactNode {
  if (step.success) {
    return <CheckmarkCircleRegular aria-hidden primaryFill="green" />;
  }
  if (step.errors.length > 0) {
    return <DismissCircleRegular aria-hidden primaryFill="red" />;
  }
  if (isRunning && step.step === activeStepId) {
    return <Spinner size="tiny" aria-label={step.label} />;
  }
  return <CircleRegular aria-hidden />;
}

export const ProvisioningOnboarding: React.FC<IProvisioningOnboardingProps> = ({
  steps,
  isRunning,
  error,
  canRun,
  adminRequiredMessage,
  title,
  subtitle,
  startLabel,
  runningLabel,
  onStart,
  variant = 'page',
  onClose,
  isPageEditMode = false
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  const hasStarted = steps.length > 0;
  const allDone = steps.some(step => step.step === 'complete' && step.success);
  const hasStepError = steps.some(step => step.errors.length > 0);
  const showProgressSteps = hasStarted && (isRunning || allDone || hasStepError);
  const activeStepId = isRunning
    ? steps.find(step => !step.success && step.errors.length === 0)?.step
    : undefined;
  const [wizardStep, setWizardStep] = React.useState(0);
  const setupStepIndex = 2;

  React.useEffect(() => {
    if (isRunning || hasStarted) {
      setWizardStep(setupStepIndex);
    }
  }, [isRunning, hasStarted]);

  const wizardSteps = [
    { key: 'welcome', label: s.onboarding.wizard.welcome },
    { key: 'groups', label: s.onboarding.wizard.groups },
    { key: 'setup', label: s.onboarding.wizard.setup }
  ];

  React.useEffect(() => {
    if (variant === 'modal' && typeof document !== 'undefined') {
      setPortalTarget(document.body);
    }
  }, [variant]);

  const panel = (
    <Card className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <AppBrandIcon variant="tile" className={styles.brandIcon} />
          <div>
            <Title3 className={styles.title}>{title}</Title3>
            <Text className={styles.subtitle}>{subtitle}</Text>
          </div>
        </div>
        {variant === 'modal' && onClose && !isRunning && (
          <Button
            appearance="subtle"
            icon={<DismissRegular />}
            aria-label={s.onboarding.close}
            onClick={onClose}
          />
        )}
      </div>

      {isPageEditMode ? (
        <MessageBar intent="info" className={styles.alert}>
          <MessageBarBody>{s.onboarding.editModeCanSetup}</MessageBarBody>
        </MessageBar>
      ) : null}

      <WizardStepper steps={wizardSteps} currentStep={wizardStep} />

      {!canRun && (
        <MessageBar intent="warning" className={styles.alert}>
          <MessageBarBody>{adminRequiredMessage}</MessageBarBody>
        </MessageBar>
      )}

      {error && (
        <MessageBar intent="error" className={styles.alert}>
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {wizardStep === 0 && !hasStarted && (
        <Text className={styles.summary}>{s.onboarding.wizard.welcomeBody}</Text>
      )}

      {wizardStep === 1 && !hasStarted && (
        <Text className={styles.summary}>{s.onboarding.wizard.groupsBody}</Text>
      )}

      {wizardStep === setupStepIndex && !hasStarted && (
        <Text className={styles.summary}>{s.onboarding.wizard.readyBody}</Text>
      )}

      {(isRunning || allDone) && (
        <AppLoader
          variant="inline"
          label={allDone ? s.onboarding.setupCompleteLoading : runningLabel}
          detail={isRunning ? s.onboarding.setupMayTakeTimeProgress : undefined}
        />
      )}

      {showProgressSteps && (
        <div className={styles.steps} aria-live="polite">
          {steps.map(step => (
            <div key={step.step} className={styles.stepRow}>
              {getStepVisual(step, isRunning, activeStepId)}
              <div className={styles.stepContent}>
                <div className={styles.stepLabel}>{step.label}</div>
                {step.message && <div className={styles.stepMessage}>{step.message}</div>}
                {step.errors.length > 0 && (
                  <div className={styles.stepErrors}>
                    {step.errors.map(err => <div key={err}>{err}</div>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {wizardStep > 0 && !isRunning && !allDone && !hasStarted && (
          <Button
            appearance="secondary"
            icon={<ChevronLeftRegular />}
            onClick={() => setWizardStep(step => Math.max(0, step - 1))}
          >
            {s.onboarding.wizard.back}
          </Button>
        )}
        {wizardStep < setupStepIndex && !hasStarted && (
          <Button
            appearance="primary"
            icon={<ChevronRightRegular />}
            iconPosition="after"
            onClick={() => setWizardStep(step => Math.min(setupStepIndex, step + 1))}
          >
            {s.onboarding.wizard.next}
          </Button>
        )}
        {wizardStep === setupStepIndex && !allDone && (
          <Button
            appearance="primary"
            disabled={isRunning || !canRun}
            icon={isRunning ? <Spinner size="tiny" /> : <PlayRegular />}
            onClick={onStart}
          >
            {isRunning ? runningLabel : startLabel}
          </Button>
        )}
      </div>
    </Card>
  );

  if (variant === 'modal' && portalTarget) {
    return ReactDOM.createPortal(
      <div
        className={`${styles.modalBackdrop} ${SETUP_PORTAL_CLASS}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget && onClose && !isRunning) {
            onClose();
          }
        }}
      >
        <div className={styles.modalPanel}>{panel}</div>
      </div>,
      portalTarget
    );
  }

  return (
    <div className={styles.page} data-setup-mode="true">
      {panel}
    </div>
  );
};

export default ProvisioningOnboarding;
