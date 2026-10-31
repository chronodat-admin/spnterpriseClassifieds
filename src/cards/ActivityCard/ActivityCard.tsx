import * as React from 'react';
import {
  Card,
  Text,
  Avatar,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { IActivityLog } from '../../interfaces';
import { formatRelativeDate, getInitials } from '../../utilities';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalM,
    alignItems: 'flex-start'
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  action: {
    fontWeight: tokens.fontWeightSemibold
  },
  details: {
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXXS
  },
  timestamp: {
    color: tokens.colorNeutralForeground4,
    marginTop: tokens.spacingVerticalXXS,
    flexShrink: 0
  }
});

export interface IActivityCardProps {
  activity: IActivityLog;
}

export const ActivityCard: React.FC<IActivityCardProps> = ({ activity }) => {
  const styles = useStyles();

  const displayName = activity.userDisplayName ?? activity.userId;

  return (
    <Card className={styles.card} role="article" aria-label={`${displayName} ${activity.action}`}>
      <Avatar
        name={displayName}
        initials={getInitials(displayName)}
        size={32}
        aria-hidden="true"
      />
      <div className={styles.content}>
        <Text className={styles.action} size={200} block>
          {displayName}
        </Text>
        <Text size={200} block>
          {activity.action}
        </Text>
        {activity.details && (
          <Text className={styles.details} size={100} block>
            {activity.details}
          </Text>
        )}
        <Text size={100} style={{ color: tokens.colorNeutralForeground4 }}>
          {activity.entityType} #{activity.entityId}
        </Text>
      </div>
      <Text className={styles.timestamp} size={100}>
        <time dateTime={activity.created.toISOString()}>
          {formatRelativeDate(activity.created)}
        </time>
      </Text>
    </Card>
  );
};
