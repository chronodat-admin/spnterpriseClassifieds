import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IConversation, IMessage } from '../interfaces';
import { mapMessageItem, mapMessageToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class MessageRepository extends BaseRepository<IMessage> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Messages);
  }

  protected mapItem(item: ISharePointListItem): IMessage {
    return mapMessageItem(item);
  }

  protected mapToItem(entity: Partial<IMessage>): ISharePointListItem {
    return mapMessageToSharePoint(entity);
  }

  public async getByConversation(conversationId: string): Promise<IMessage[]> {
    return this.getAll({
      filter: `EC365_ConversationId eq '${escapeODataString(conversationId)}'`,
      orderBy: 'Created asc'
    });
  }

  public async getConversations(userId: string): Promise<IConversation[]> {
    const escapedUserId = escapeODataString(userId);
    const messages = await this.getAll({
      filter: `(EC365_SenderId eq '${escapedUserId}' or EC365_RecipientId eq '${escapedUserId}')`,
      orderBy: 'Created desc'
    });

    const conversationMap = new Map<string, IConversation>();

    messages.forEach(message => {
      const existing = conversationMap.get(message.conversationId);
      const otherParticipant =
        message.senderId === userId ? message.recipientId : message.senderId;
      const isUnread = message.recipientId === userId && !message.isRead;

      if (!existing) {
        conversationMap.set(message.conversationId, {
          id: message.conversationId,
          participants: [userId, otherParticipant],
          listingId: message.listingId,
          listingTitle: message.listingTitle,
          lastMessage: message.body,
          lastMessageDate: message.created,
          unreadCount: isUnread ? 1 : 0
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    });

    return Array.from(conversationMap.values()).sort(
      (a, b) => (b.lastMessageDate?.getTime() ?? 0) - (a.lastMessageDate?.getTime() ?? 0)
    );
  }

  public async getUnreadCount(userId: string): Promise<number> {
    const items = await this.getAll({
      filter: `EC365_RecipientId eq '${escapeODataString(userId)}' and EC365_IsRead eq false`,
      select: ['Id']
    });
    return items.length;
  }
}
