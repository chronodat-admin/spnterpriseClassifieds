import * as React from 'react';
import { PageLayout, TwoColumnLayout } from '../../layouts';
import { ConversationList, MessageThread, MessageComposer, LoadingSkeleton, ErrorState } from '../../controls';
import { useMessages, useConversation, useLocalization, useAppContext } from '../../hooks';
import { IConversation } from '../../interfaces';

export const MessagesPage: React.FC = () => {
  const { userId } = useAppContext();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { conversations, isLoading, error, refresh, sendMessage } = useMessages();
  const [selected, setSelected] = React.useState<IConversation | undefined>();
  const [draft, setDraft] = React.useState('');

  const { messages, isLoading: messagesLoading, markAsRead } = useConversation(selected?.id);

  React.useEffect(() => {
    if (selected) markAsRead().catch(() => undefined);
  }, [selected, markAsRead]);

  const handleSend = async (): Promise<void> => {
    if (!selected || !draft.trim()) return;
    const recipient = selected.participants.find(p => p !== userId);
    if (!recipient) return;
    await sendMessage(recipient, draft.trim(), selected.listingId);
    setDraft('');
  };

  return (
    <PageLayout title={s.messages.title}>
      {isLoading ? <LoadingSkeleton rows={6} /> : error ? (
        <ErrorState message={error.message} onRetry={refresh} />
      ) : (
        <TwoColumnLayout
          sidebar={
            <ConversationList
              conversations={conversations}
              selectedId={selected?.id}
              onSelect={setSelected}
              emptyMessage={s.messages.noConversations}
            />
          }
          sidebarWidth={320}
        >
          {selected ? (
            <>
              {messagesLoading ? <LoadingSkeleton rows={4} /> : (
                <MessageThread messages={messages} currentUserId={userId} />
              )}
              <MessageComposer
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
                placeholder={s.messages.typeMessage}
                sendLabel={s.messages.send}
              />
            </>
          ) : (
            <p>{s.messages.noConversations}</p>
          )}
        </TwoColumnLayout>
      )}
    </PageLayout>
  );
};

export default MessagesPage;
