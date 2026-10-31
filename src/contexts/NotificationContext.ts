import * as React from 'react';

export type ToastIntent = 'success' | 'error' | 'warning' | 'info';

export interface IToastNotification {
  id: string;
  title: string;
  message: string;
  intent: ToastIntent;
  durationMs: number;
  dismissible: boolean;
}

export interface INotificationContextState {
  toasts: IToastNotification[];
  showToast: (toast: Omit<IToastNotification, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

export const defaultNotificationContext: INotificationContextState = {
  toasts: [],
  showToast: () => '',
  dismissToast: () => undefined,
  clearToasts: () => undefined,
  success: () => '',
  error: () => '',
  warning: () => '',
  info: () => ''
};

export const NotificationContext = React.createContext<INotificationContextState>(
  defaultNotificationContext
);
