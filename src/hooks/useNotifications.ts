import * as React from 'react';
import { NotificationContext, INotificationContextState } from '../contexts/NotificationContext';

export function useNotifications(): INotificationContextState {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
