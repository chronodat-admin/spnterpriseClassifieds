import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { IActivityLog } from '../interfaces';
import { formatRelativeDate } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
  }
});

export interface IActivityFeedProps {
  activities: IActivityLog[];
  emptyMessage?: string;
}

export const ActivityFeed: React.FC<IActivityFeedProps> = ({ activities, emptyMessage }) => {
  const classes = useStyles();
  if (activities.length === 0) {
    return emptyMessage ? <Text>{emptyMessage}</Text> : null;
  }
  return (
    <div className={classes.root}>
      {activities.map(item => (
        <div key={item.id} className={classes.item}>
          <Text weight="semibold">{item.userDisplayName ?? item.userId}</Text>
          <Text size={200}>{item.action} — {item.entityType} #{item.entityId}</Text>
          {item.details && <Text size={200}>{item.details}</Text>}
          <Text size={100}>{formatRelativeDate(item.created)}</Text>
        </div>
      ))}
    </div>
  );
};
