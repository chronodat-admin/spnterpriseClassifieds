import * as React from 'react';
import { Button, Text, Badge, Spinner } from '@fluentui/react-components';
import { useStrings } from '../hooks';
import { INotification, NotificationType } from '../interfaces';
import { formatRelativeDate } from '../helpers';
import { AppIcons } from '../icons';
import styles from './NotificationCenter.module.scss';

export interface INotificationCenterProps {
  notifications: INotification[];
  loading?: boolean;
  onNotificationClick?: (notification: INotification) => void;
  onMarkRead?: (id: number) => void;
  onMarkAllRead?: () => void;
  maxHeight?: number;
}

function getNotificationTypeLabel(type: NotificationType, strings: ReturnType<typeof useStrings>): string {
  const labels: Record<NotificationType, string> = {
    Message: strings.notifications.types.message,
    Approval: strings.notifications.types.approval,
    Expiration: strings.notifications.types.expiration,
    Match: strings.notifications.types.match,
    Review: strings.notifications.types.review,
    System: strings.notifications.types.system,
    Sold: strings.notifications.types.sold,
    Reserved: strings.notifications.types.reserved
  };
  return labels[type] ?? type;
}

function getNotificationIcon(type: NotificationType): React.ReactElement {
  switch (type) {
    case 'Message':
      return <AppIcons name="Chat" />;
    case 'Approval':
      return <AppIcons name="Shield" />;
    case 'Match':
      return <AppIcons name="Search" />;
    case 'Review':
      return <AppIcons name="Star" />;
    case 'Sold':
    case 'Reserved':
      return <AppIcons name="Heart" />;
    default:
      return <AppIcons name="Alert" />;
  }
}

export const NotificationCenter: React.FC<INotificationCenterProps> = ({
  notifications,
  loading = false,
  onNotificationClick,
  onMarkRead,
  onMarkAllRead,
  maxHeight = 480
}) => {
  const strings = useStrings();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClick = (notification: INotification): void => {
    if (!notification.isRead) {
      onMarkRead?.(notification.id);
    }
    onNotificationClick?.(notification);
  };

  return (
    <div className={styles.center} role="region" aria-label={strings.notifications.title}>
      <div className={styles.header}>
        <Text weight="semibold">{strings.notifications.title}</Text>
        {unreadCount > 0 && onMarkAllRead && (
          <Button appearance="subtle" size="small" onClick={onMarkAllRead}>
            {strings.notifications.markAllAsRead}
          </Button>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="small" label={strings.common.loading} />
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <AppIcons name="Alert" aria-hidden />
          <Text size={200}>{strings.notifications.noNotifications}</Text>
        </div>
      ) : (
        <div className={styles.list} style={{ maxHeight }} role="list">
          {notifications.map(notification => (
            <button
              key={notification.id}
              type="button"
              className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => handleClick(notification)}
              role="listitem"
            >
              <div className={styles.itemHeader}>
                {getNotificationIcon(notification.type)}
                <Text weight="semibold" size={200}>{notification.title}</Text>
                <Badge appearance="outline" size="small">
                  {getNotificationTypeLabel(notification.type, strings)}
                </Badge>
              </div>
              <Text size={100}>{notification.message}</Text>
              <div className={styles.meta}>
                <Text size={100}>{formatRelativeDate(notification.created)}</Text>
                {!notification.isRead && (
                  <Badge appearance="filled" color="brand" size="small">
                    {strings.messages.unread}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
