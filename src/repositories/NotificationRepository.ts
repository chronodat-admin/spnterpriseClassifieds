import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { INotification } from '../interfaces';
import { mapNotificationItem, mapNotificationToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Notifications);
  }

  protected mapItem(item: ISharePointListItem): INotification {
    return mapNotificationItem(item);
  }

  protected mapToItem(entity: Partial<INotification>): ISharePointListItem {
    return mapNotificationToSharePoint(entity);
  }

  public async getByUser(userId: string): Promise<INotification[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}'`,
      orderBy: 'Created desc'
    });
  }

  public async getUnreadByUser(userId: string): Promise<INotification[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}' and EC365_IsRead eq false`,
      orderBy: 'Created desc'
    });
  }

  public async markRead(id: number): Promise<INotification> {
    return this.update(id, { isRead: true });
  }

  public async markAllRead(userId: string): Promise<void> {
    const unread = await this.getUnreadByUser(userId);
    await Promise.all(unread.map(notification => this.markRead(notification.id)));
  }
}
