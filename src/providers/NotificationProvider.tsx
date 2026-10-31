import * as React from 'react';
import {
  NotificationContext,
  IToastNotification,
  INotificationContextState,
  ToastIntent
} from '../contexts/NotificationContext';
import { generateId } from '../utilities';

const DEFAULT_DURATION_MS = 5000;

export interface INotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<INotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<IToastNotification[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = React.useCallback((toast: Omit<IToastNotification, 'id'>): string => {
    const id = generateId();
    const fullToast: IToastNotification = {
      ...toast,
      id,
      durationMs: toast.durationMs ?? DEFAULT_DURATION_MS,
      dismissible: toast.dismissible ?? true
    };

    setToasts(prev => [...prev, fullToast]);

    if (fullToast.durationMs > 0) {
      const timer = setTimeout(() => dismissToast(id), fullToast.durationMs);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  const clearToasts = React.useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const createIntentHandler = React.useCallback(
    (intent: ToastIntent) => (title: string, message = ''): string =>
      showToast({ title, message, intent, durationMs: DEFAULT_DURATION_MS, dismissible: true }),
    [showToast]
  );

  const success = React.useMemo(() => createIntentHandler('success'), [createIntentHandler]);
  const error = React.useMemo(() => createIntentHandler('error'), [createIntentHandler]);
  const warning = React.useMemo(() => createIntentHandler('warning'), [createIntentHandler]);
  const info = React.useMemo(() => createIntentHandler('info'), [createIntentHandler]);

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const contextValue: INotificationContextState = React.useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      clearToasts,
      success,
      error,
      warning,
      info
    }),
    [toasts, showToast, dismissToast, clearToasts, success, error, warning, info]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
