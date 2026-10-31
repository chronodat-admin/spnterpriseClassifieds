import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { formatDate } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: tokens.spacingHorizontalM },
  item: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
    borderLeft: `2px solid ${tokens.colorBrandStroke1}`,
    marginLeft: tokens.spacingHorizontalS,
    position: 'relative'
  },
  dot: {
    position: 'absolute',
    left: '-7px',
    top: '16px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandBackground
  }
});

export interface ITimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  date: Date | string;
}

export interface ITimelineProps {
  events: ITimelineEvent[];
}

export const Timeline: React.FC<ITimelineProps> = ({ events }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {events.map(event => (
        <div key={event.id} className={classes.item}>
          <span className={classes.dot} />
          <div>
            <Text weight="semibold">{event.title}</Text>
            {event.description && <Text size={200}>{event.description}</Text>}
            <Text size={100}>{formatDate(event.date)}</Text>
          </div>
        </div>
      ))}
    </div>
  );
};
