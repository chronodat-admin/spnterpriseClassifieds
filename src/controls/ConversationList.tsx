import * as React from 'react';
import { Text, Badge, makeStyles, tokens } from '@fluentui/react-components';
import { IConversation } from '../interfaces';
import { formatRelativeDate } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column' },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalM,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    '&:hover': { backgroundColor: tokens.colorNeutralBackground1Hover }
  },
  active: { backgroundColor: tokens.colorNeutralBackground1Selected },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
});

export interface IConversationListProps {
  conversations: IConversation[];
  selectedId?: string;
  onSelect: (conversation: IConversation) => void;
  emptyMessage?: string;
}

export const ConversationList: React.FC<IConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  emptyMessage
}) => {
  const classes = useStyles();
  if (conversations.length === 0) {
    return emptyMessage ? <Text>{emptyMessage}</Text> : null;
  }
  return (
    <div className={classes.root}>
      {conversations.map(conv => (
        <div
          key={conv.id}
          className={`${classes.item} ${selectedId === conv.id ? classes.active : ''}`}
          onClick={() => onSelect(conv)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(conv)}
        >
          <div className={classes.row}>
            <Text weight="semibold">{conv.listingTitle ?? conv.participants.join(', ')}</Text>
            {conv.unreadCount > 0 && <Badge appearance="filled" color="brand">{conv.unreadCount}</Badge>}
          </div>
          {conv.lastMessage && <Text size={200} truncate>{conv.lastMessage}</Text>}
          {conv.lastMessageDate && <Text size={100}>{formatRelativeDate(conv.lastMessageDate)}</Text>}
        </div>
      ))}
    </div>
  );
};
