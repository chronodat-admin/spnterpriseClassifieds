import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IConversation, IMessage } from '../interfaces';
import { MessageRepository } from '../repositories/MessageRepository';
import { ListingRepository } from '../repositories/ListingRepository';
import { NotificationService } from './NotificationService';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { TELEMETRY_EVENTS } from '../constants';
import { generateId } from '../utilities';
import { TelemetryService } from './TelemetryService';

export class MessageService {
  private _messageRepo: MessageRepository;
  private _listingRepo: ListingRepository;
  private _notificationService: NotificationService;
  private _activityLogRepo: ActivityLogRepository;
  private _telemetry: TelemetryService;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._messageRepo = new MessageRepository(context);
    this._listingRepo = new ListingRepository(context);
    this._notificationService = new NotificationService(context);
    this._activityLogRepo = new ActivityLogRepository(context);
    this._telemetry = new TelemetryService(context);
  }

  public async getConversations(userId?: string): Promise<IConversation[]> {
    const id = userId ?? this._context.pageContext.user.loginName;
    return this._messageRepo.getConversations(id);
  }

  public async getByConversation(conversationId: string): Promise<IMessage[]> {
    return this._messageRepo.getByConversation(conversationId);
  }

  public async send(message: {
    recipientId: string;
    recipientDisplayName?: string;
    body: string;
    listingId?: number;
    conversationId?: string;
    attachmentUrl?: string;
  }): Promise<IMessage> {
    const senderId = this._context.pageContext.user.loginName;
    const senderDisplayName = this._context.pageContext.user.displayName;

    let listingTitle: string | undefined;
    if (message.listingId) {
      const listing = await this._listingRepo.getById(message.listingId);
      listingTitle = listing?.title;
    }

    const conversationId =
      message.conversationId ??
      this.buildConversationId(message.listingId, senderId, message.recipientId);

    const created = await this._messageRepo.create({
      conversationId,
      senderId,
      senderDisplayName,
      recipientId: message.recipientId,
      recipientDisplayName: message.recipientDisplayName,
      listingId: message.listingId,
      listingTitle,
      body: message.body,
      isRead: false,
      attachmentUrl: message.attachmentUrl
    });

    if (message.listingId) {
      const listing = await this._listingRepo.getById(message.listingId);
      if (listing) {
        await this._listingRepo.update(message.listingId, {
          messageCount: listing.messageCount + 1
        });
      }
    }

    await this._notificationService.notifyNewMessage(
      message.recipientId,
      senderDisplayName,
      message.listingId,
      listingTitle
    );

    await this._activityLogRepo.log({
      userId: senderId,
      userDisplayName: senderDisplayName,
      action: 'MessageSent',
      entityType: 'Message',
      entityId: created.id,
      details: conversationId
    });

    this._telemetry.trackEvent({
      name: TELEMETRY_EVENTS.MessageSent,
      properties: {
        listingId: message.listingId ?? 0,
        conversationId
      }
    });

    return created;
  }

  public async markConversationRead(conversationId: string, userId?: string): Promise<void> {
    const currentUserId = userId ?? this._context.pageContext.user.loginName;
    const messages = await this._messageRepo.getByConversation(conversationId);

    await Promise.all(
      messages
        .filter(m => m.recipientId === currentUserId && !m.isRead)
        .map(m => this._messageRepo.update(m.id, { isRead: true }))
    );
  }

  public async getUnreadCount(userId?: string): Promise<number> {
    const id = userId ?? this._context.pageContext.user.loginName;
    return this._messageRepo.getUnreadCount(id);
  }

  private buildConversationId(
    listingId: number | undefined,
    userA: string,
    userB: string
  ): string {
    const participants = [userA, userB].sort().join('-');
    const prefix = listingId ? `${listingId}-` : '';
    return `${prefix}${participants}-${generateId()}`;
  }
}
