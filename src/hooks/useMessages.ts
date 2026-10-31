import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { IConversation, IMessage } from '../interfaces';
import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';
import { TelemetryClient } from '../telemetry/TelemetryClient';

interface IMessageService {
  getConversations(userId: string): Promise<IConversation[]>;
  getMessages(conversationId: string): Promise<IMessage[]>;
  sendMessage(message: Partial<IMessage>): Promise<IMessage>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

interface ITelemetryService {
  client: TelemetryClient;
}

export interface IUseMessagesResult {
  conversations: IConversation[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
  sendMessage: (recipientId: string, body: string, listingId?: number) => Promise<IMessage | undefined>;
}

export function useMessages(): IUseMessagesResult {
  const { userId, serviceContainerReady } = useAppContext();
  const { success, error: showError } = useNotifications();
  const [conversations, setConversations] = React.useState<IConversation[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const getService = React.useCallback((): IMessageService | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<IMessageService>(SERVICE_KEYS.MessageService);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!userId) return;
    const service = getService();
    if (!service) return;

    setIsLoading(true);
    setError(undefined);
    try {
      const [convs, count] = await Promise.all([
        service.getConversations(userId),
        service.getUnreadCount(userId)
      ]);
      setConversations(convs);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId, getService]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const sendMessage = React.useCallback(async (
    recipientId: string,
    body: string,
    listingId?: number
  ): Promise<IMessage | undefined> => {
    const service = getService();
    if (!service || !userId) {
      showError('Messages unavailable', 'Message service is not configured.');
      return undefined;
    }

    try {
      const conversationId = listingId
        ? `${userId}-${recipientId}-${listingId}`
        : `${userId}-${recipientId}`;

      const message = await service.sendMessage({
        conversationId,
        senderId: userId,
        recipientId,
        listingId,
        body,
        isRead: false
      });

      success('Message sent');
      await refresh();

      try {
        const telemetry = ServiceContainer.getInstance().resolve<ITelemetryService>(SERVICE_KEYS.TelemetryService);
        telemetry.client.trackMessageSent(conversationId);
      } catch {
        /* telemetry optional */
      }

      return message;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showError('Failed to send message', message);
      return undefined;
    }
  }, [userId, getService, refresh, success, showError]);

  return {
    conversations,
    unreadCount,
    isLoading,
    error,
    refresh,
    sendMessage
  };
}

export function useConversation(conversationId: string | undefined): {
  messages: IMessage[];
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
  markAsRead: () => Promise<void>;
} {
  const { userId, serviceContainerReady } = useAppContext();
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const getService = React.useCallback((): IMessageService | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<IMessageService>(SERVICE_KEYS.MessageService);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!conversationId) return;
    const service = getService();
    if (!service) return;

    setIsLoading(true);
    setError(undefined);
    try {
      const result = await service.getMessages(conversationId);
      setMessages(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, getService]);

  const markAsRead = React.useCallback(async (): Promise<void> => {
    if (!conversationId || !userId) return;
    const service = getService();
    if (!service) return;
    await service.markAsRead(conversationId, userId);
    await refresh();
  }, [conversationId, userId, getService, refresh]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return { messages, isLoading, error, refresh, markAsRead };
}
