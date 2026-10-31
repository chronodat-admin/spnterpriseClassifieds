import * as React from 'react';
import {
  Button,
  Card,
  CardHeader,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  Title3
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  DismissCircleRegular
} from '@fluentui/react-icons';
import { useLocalization } from '../../hooks';
import { useOnboarding } from '../../hooks/useOnboarding';
import styles from './OnboardingPage.module.scss';

export const OnboardingPage: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const {
    status,
    isLoading,
    isRunning,
    steps,
    lastResult,
    error,
    runOnboarding
  } = useOnboarding();

  const handleRun = (): void => {
    runOnboarding().catch(() => undefined);
  };

  if (isLoading && !status) {
    return (
      <div className={styles.onboardingPage}>
        <Spinner size="large" label={s.onboarding.checkingStatus} />
      </div>
    );
  }

  const onboardingComplete = lastResult?.success ||
    (status?.complete && status.groupsProvisioned && status.listsProvisioned);
  const cannotRun = status && !status.canRunOnboarding;

  return (
    <div className={styles.onboardingPage}>
      <Card className={styles.card}>
        <CardHeader
          header={
            <div className={styles.header}>
              <Title3 className={styles.title}>{s.onboarding.title}</Title3>
              <Text className={styles.subtitle}>{s.onboarding.subtitle}</Text>
            </div>
          }
        />

        {error && (
          <MessageBar intent="error" className={styles.alert}>
            <MessageBarBody>{error.message}</MessageBarBody>
          </MessageBar>
        )}

        {cannotRun && (
          <MessageBar intent="warning" className={styles.alert}>
            <MessageBarBody>{status.message ?? s.onboarding.adminRequired}</MessageBarBody>
          </MessageBar>
        )}

        {!onboardingComplete && (
          <Text className={styles.subtitle}>{s.onboarding.wizard.groupsBody}</Text>
        )}

        {steps.length > 0 && (
          <div className={styles.steps} aria-live="polite">
            {steps.map(step => (
              <div key={step.step} className={styles.stepRow}>
                {step.success
                  ? <CheckmarkCircleRegular aria-hidden primaryFill="green" />
                  : <DismissCircleRegular aria-hidden primaryFill="red" />}
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

        {onboardingComplete && (
          <MessageBar intent="success" className={styles.alert}>
            <MessageBarBody>{s.onboarding.completeMessage}</MessageBarBody>
          </MessageBar>
        )}

        <div className={styles.actions}>
          {!onboardingComplete && (
            <Button
              appearance="primary"
              disabled={isRunning || cannotRun}
              icon={isRunning ? <Spinner size="tiny" /> : undefined}
              onClick={handleRun}
            >
              {isRunning ? s.onboarding.running : s.onboarding.startButton}
            </Button>
          )}
          {onboardingComplete && (
            <Button appearance="primary" onClick={() => window.location.reload()}>
              {s.onboarding.continueButton}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingPage;
