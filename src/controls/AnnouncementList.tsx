import * as React from 'react';
import { MessageBar, MessageBarBody, Text, makeStyles, tokens } from '@fluentui/react-components';
import { IAnnouncement } from '../interfaces';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }
});

export interface IAnnouncementListProps {
  announcements: IAnnouncement[];
}

export const AnnouncementList: React.FC<IAnnouncementListProps> = ({ announcements }) => {
  const classes = useStyles();
  const active = announcements.filter(a => a.isActive);
  if (active.length === 0) return null;
  return (
    <div className={classes.root}>
      {active.map(a => (
        <MessageBar key={a.id} intent="info">
          <MessageBarBody>
            <Text weight="semibold">{a.title}</Text>
            <Text>{a.body}</Text>
          </MessageBarBody>
        </MessageBar>
      ))}
    </div>
  );
};
