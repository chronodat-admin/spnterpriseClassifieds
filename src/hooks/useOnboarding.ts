import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { useAppContext } from './useAppContext';
import {
  IOnboardingResult,
  IOnboardingStatus,
  IOnboardingStepResult,
  OnboardingService
} from '../services/OnboardingService';

export interface IUseOnboardingResult {
  status: IOnboardingStatus | undefined;
  isLoading: boolean;
  isRunning: boolean;
  steps: IOnboardingStepResult[];
  lastResult: IOnboardingResult | undefined;
  error: Error | undefined;
  refresh: () => Promise<void>;
  runOnboarding: () => Promise<IOnboardingResult | undefined>;
}

export function useOnboarding(): IUseOnboardingResult {
  const { serviceContainerReady } = useAppContext();
  const [status, setStatus] = React.useState<IOnboardingStatus | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<IOnboardingStepResult[]>([]);
  const [lastResult, setLastResult] = React.useState<IOnboardingResult | undefined>();
  const [error, setError] = React.useState<Error | undefined>();

  const getService = React.useCallback((): OnboardingService | undefined => {
    if (!serviceContainerReady) return undefined;
    return ServiceContainer.getInstance().resolve<OnboardingService>(SERVICE_KEYS.OnboardingService);
  }, [serviceContainerReady]);

  const refresh = React.useCallback(async (): Promise<void> => {
    const service = getService();
    if (!service) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    try {
      const nextStatus = await service.getStatus();
      setStatus(nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const runOnboarding = React.useCallback(async (): Promise<IOnboardingResult | undefined> => {
    const service = getService();
    if (!service) return undefined;

    setIsRunning(true);
    setSteps([]);
    setError(undefined);

    try {
      const result = await service.runOnboarding(step => {
        setSteps(prev => {
          const existingIndex = prev.findIndex(item => item.step === step.step);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = step;
            return updated;
          }
          return [...prev, step];
        });
      });

      setLastResult(result);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return undefined;
    } finally {
      setIsRunning(false);
    }
  }, [getService, refresh]);

  return {
    status,
    isLoading,
    isRunning,
    steps,
    lastResult,
    error,
    refresh,
    runOnboarding
  };
}
