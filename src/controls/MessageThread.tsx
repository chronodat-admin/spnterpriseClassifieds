import * as React from 'react';
import { Text, Avatar, makeStyles, tokens } from '@fluentui/react-components';
import { IMessage } from '../interfaces';
import { formatRelativeDate, getInitials } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, padding: tokens.spacingVerticalM },
  message: { display: 'flex', gap: tokens.spacingHorizontalS, maxWidth: '80%' },
  own: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: {
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3
  },
  ownBubble: { backgroundColor: tokens.colorBrandBackground2 }
});

export interface IMessageThreadProps {
  messages: IMessage[];
  currentUserId: string;
}

export const MessageThread: React.FC<IMessageThreadProps> = ({ messages, currentUserId }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {messages.map(msg => {
        const isOwn = msg.senderId === currentUserId;
        return (
          <div key={msg.id} className={`${classes.message} ${isOwn ? classes.own : ''}`}>
            <Avatar
              name={msg.senderDisplayName ?? msg.senderId}
              initials={getInitials(msg.senderDisplayName ?? msg.senderId)}
              size={28}
            />
            <div className={`${classes.bubble} ${isOwn ? classes.ownBubble : ''}`}>
              {!isOwn && <Text weight="semibold" size={200}>{msg.senderDisplayName}</Text>}
              <Text>{msg.body}</Text>
              <Text size={100}>{formatRelativeDate(msg.created)}</Text>
            </div>
          </div>
        );
      })}
    </div>
  );
};
