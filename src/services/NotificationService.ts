import { WebPartContext } from '@microsoft/sp-webpart-base';
import { INotification, NotificationType } from '../interfaces';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationService {
  private _notificationRepo: NotificationRepository;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._notificationRepo = new NotificationRepository(context);
  }

  public async getByUser(userId?: string): Promise<INotification[]> {
    const id = userId ?? this._context.pageContext.user.loginName;
    return this._notificationRepo.getByUser(id);
  }

  public async getUnread(userId?: string): Promise<INotification[]> {
    const id = userId ?? this._context.pageContext.user.loginName;
    return this._notificationRepo.getUnreadByUser(id);
  }

  public async getUnreadCount(userId?: string): Promise<number> {
    const unread = await this.getUnread(userId);
    return unread.length;
  }

  public async create(notification: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    linkUrl?: string;
    relatedListingId?: number;
  }): Promise<INotification> {
    return this._notificationRepo.create({
      ...notification,
      isRead: false
    });
  }

  public async notifyListingApproved(userId: string, listingId: number, listingTitle: string): Promise<INotification> {
    return this.create({
      userId,
      title: 'Listing Approved',
      message: `Your listing "${listingTitle}" has been approved and is now live.`,
      type: 'Approval',
      relatedListingId: listingId,
      linkUrl: `#/listings/${listingId}`
    });
  }

  public async notifyNewMessage(
    recipientId: string,
    senderName: string,
    listingId?: number,
    listingTitle?: string
  ): Promise<INotification> {
    return this.create({
      userId: recipientId,
      title: 'New Message',
      message: `${senderName} sent you a message${listingTitle ? ` about "${listingTitle}"` : ''}.`,
      type: 'Message',
      relatedListingId: listingId,
      linkUrl: '#/messages'
    });
  }

  public async markRead(id: number): Promise<INotification> {
    return this._notificationRepo.markRead(id);
  }

  public async markAllRead(userId?: string): Promise<void> {
    const id = userId ?? this._context.pageContext.user.loginName;
    await this._notificationRepo.markAllRead(id);
  }

  public async delete(id: number): Promise<void> {
    await this._notificationRepo.delete(id);
  }
}
