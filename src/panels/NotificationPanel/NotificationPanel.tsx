import * as React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  Text,
  Badge,
  Spinner
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useStrings } from '../../hooks';
import { INotification, NotificationType } from '../../interfaces';
import { formatRelativeDate } from '../../helpers';
import { AppIcons } from '../../icons';
import styles from './NotificationPanel.module.scss';

export interface INotificationPanelProps {
  open: boolean;
  notifications: INotification[];
  loading?: boolean;
  onDismiss: () => void;
  onNotificationClick: (notification: INotification) => void;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: number) => void;
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

export const NotificationPanel: React.FC<INotificationPanelProps> = ({
  open,
  notifications,
  loading = false,
  onDismiss,
  onNotificationClick,
  onMarkAllRead,
  onMarkRead
}) => {
  const strings = useStrings();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClick = (notification: INotification): void => {
    if (!notification.isRead) {
      onMarkRead?.(notification.id);
    }
    onNotificationClick(notification);
  };

  return (
    <Drawer
      type="overlay"
      separator
      open={open}
      onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}
      position="end"
      size="medium"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label={strings.common.close}
              icon={<DismissRegular />}
              onClick={onDismiss}
            />
          }
        >
          {strings.notifications.title}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.panel}>
          <div className={styles.header}>
            <Text weight="semibold">
              {unreadCount > 0 ? `${unreadCount} ${strings.messages.unread}` : strings.notifications.noNotifications}
            </Text>
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
            <div className={styles.list} role="list">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  type="button"
                  className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                  onClick={() => handleClick(notification)}
                  role="listitem"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getNotificationIcon(notification.type)}
                    <Text weight="semibold" size={200}>{notification.title}</Text>
                    <Badge appearance="outline" size="small" className={styles.typeBadge}>
                      {getNotificationTypeLabel(notification.type, strings)}
                    </Badge>
                  </div>
                  <Text size={100}>{notification.message}</Text>
                  <Text size={100} className={styles.meta}>
                    {formatRelativeDate(notification.created)}
                  </Text>
                </button>
              ))}
            </div>
          )}
        </div>
      </DrawerBody>
    </Drawer>
  );
};

export default NotificationPanel;
