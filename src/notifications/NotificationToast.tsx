import * as React from 'react';
import { Button, Text } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useNotifications } from '../hooks';
import { ToastIntent } from '../contexts/NotificationContext';
import styles from './NotificationToast.module.scss';

function getIntentClass(intent: ToastIntent): string {
  switch (intent) {
    case 'success':
      return styles.success;
    case 'error':
      return styles.error;
    case 'warning':
      return styles.warning;
    default:
      return styles.info;
  }
}

export const NotificationToast: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${styles.toast} ${getIntentClass(toast.intent)}`}
          role="alert"
        >
          <div className={styles.header}>
            <Text className={styles.title}>{toast.title}</Text>
            {toast.dismissible && (
              <Button
                appearance="subtle"
                size="small"
                icon={<DismissRegular />}
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
              />
            )}
          </div>
          {toast.message && <Text className={styles.message}>{toast.message}</Text>}
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
