import * as React from 'react';
import { Spinner } from '@fluentui/react-components';
import { useLocalization } from '../../hooks';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingPage } from '../../pages/Onboarding';

export interface IOnboardingGateProps {
  children: React.ReactNode;
}

export const OnboardingGate: React.FC<IOnboardingGateProps> = ({ children }) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { status, isLoading, lastResult } = useOnboarding();

  if (isLoading && !status) {
    return <Spinner size="large" label={s.onboarding.checkingStatus} />;
  }

  const onboardingComplete = lastResult?.success || Boolean(status && !status.required);

  if (status?.required && !onboardingComplete) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
};

export default OnboardingGate;
