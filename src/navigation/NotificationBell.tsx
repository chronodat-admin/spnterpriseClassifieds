import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  CounterBadge,
  Text,
  Spinner
} from '@fluentui/react-components';
import { AlertRegular } from '@fluentui/react-icons';
import { ServiceContainer, SERVICE_KEYS } from '../services';
import { INotification } from '../interfaces';
import { useAppContext, useStrings } from '../hooks';
import { formatRelativeDate } from '../utilities';

interface INotificationService {
  getUnread(userId?: string): Promise<INotification[]>;
  markRead(id: number): Promise<INotification>;
  markAllRead(userId?: string): Promise<void>;
}

export const NotificationBell: React.FC = () => {
  const strings = useStrings();
  const navigate = useNavigate();
  const { userId, serviceContainerReady } = useAppContext();

  const [notifications, setNotifications] = React.useState<INotification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const getService = React.useCallback((): INotificationService | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<INotificationService>(SERVICE_KEYS.NotificationService);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  const loadNotifications = React.useCallback(async () => {
    const service = getService();
    if (!service) return;
    setLoading(true);
    try {
      const unread = await service.getUnread(userId);
      setNotifications(unread.slice(0, 10));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [getService, userId]);

  React.useEffect(() => {
    loadNotifications().catch(() => undefined);
    const interval = setInterval(() => { loadNotifications().catch(() => undefined); }, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  React.useEffect(() => {
    if (open) loadNotifications().catch(() => undefined);
  }, [open, loadNotifications]);

  const unreadCount = notifications.length;

  const handleMarkAllRead = async (): Promise<void> => {
    const service = getService();
    if (!service) return;
    await service.markAllRead(userId);
    setNotifications([]);
  };

  const handleNotificationClick = async (notification: INotification): Promise<void> => {
    const service = getService();
    if (service) {
      await service.markRead(notification.id);
    }
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setOpen(false);
    if (notification.linkUrl) {
      const path = notification.linkUrl.replace(/^#/, '');
      navigate(path);
    } else if (notification.relatedListingId) {
      navigate(`/listings/${notification.relatedListingId}`);
    }
  };

  return (
    <Menu open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<AlertRegular />}
          aria-label={`${strings.notifications.title}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          {unreadCount > 0 && (
            <CounterBadge count={unreadCount} size="small" aria-hidden="true" />
          )}
        </Button>
      </MenuTrigger>
      <MenuPopover style={{ minWidth: 320, maxWidth: 400 }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text weight="semibold">{strings.notifications.title}</Text>
          {unreadCount > 0 && (
            <Button appearance="subtle" size="small" onClick={handleMarkAllRead}>
              {strings.notifications.markAllAsRead}
            </Button>
          )}
        </div>
        <MenuDivider />
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Spinner size="small" label={strings.common.loading} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Text size={200}>{strings.notifications.noNotifications}</Text>
          </div>
        ) : (
          <MenuList>
            {notifications.map(notification => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
              >
                <Text weight="semibold" size={200}>{notification.title}</Text>
                <Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }}>
                  {notification.message}
                </Text>
                <Text size={100} style={{ color: 'var(--colorNeutralForeground4)' }}>
                  {formatRelativeDate(notification.created)}
                </Text>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </MenuPopover>
    </Menu>
  );
};
