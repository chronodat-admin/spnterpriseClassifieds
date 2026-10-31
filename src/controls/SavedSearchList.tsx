import * as React from 'react';
import { Text, Button, Switch, makeStyles, tokens } from '@fluentui/react-components';
import { Delete24Regular, Play24Regular } from '@fluentui/react-icons';
import { ISavedSearch } from '../interfaces';
import { formatRelativeDate } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
  },
  info: { display: 'flex', flexDirection: 'column', gap: tokens.spacingHorizontalXXS, flex: 1 }
});

export interface ISavedSearchListProps {
  searches: ISavedSearch[];
  onRun: (search: ISavedSearch) => void;
  onDelete: (search: ISavedSearch) => void;
  onToggleNotify?: (search: ISavedSearch, notify: boolean) => void;
  notifyLabel?: string;
  emptyMessage?: string;
}

export const SavedSearchList: React.FC<ISavedSearchListProps> = ({
  searches,
  onRun,
  onDelete,
  onToggleNotify,
  notifyLabel = 'Notify on match',
  emptyMessage
}) => {
  const classes = useStyles();
  if (searches.length === 0) {
    return emptyMessage ? <Text>{emptyMessage}</Text> : null;
  }
  return (
    <div className={classes.root}>
      {searches.map(search => (
        <div key={search.id} className={classes.item}>
          <div className={classes.info}>
            <Text weight="semibold">{search.title}</Text>
            <Text size={200}>{search.query}</Text>
            {search.lastRun && <Text size={100}>Last run {formatRelativeDate(search.lastRun)}</Text>}
            {onToggleNotify && (
              <Switch
                label={notifyLabel}
                checked={search.notifyOnMatch}
                onChange={(_, d) => onToggleNotify(search, d.checked)}
              />
            )}
          </div>
          <Button icon={<Play24Regular />} appearance="subtle" onClick={() => onRun(search)} aria-label="Run search" />
          <Button icon={<Delete24Regular />} appearance="subtle" onClick={() => onDelete(search)} aria-label="Delete search" />
        </div>
      ))}
    </div>
  );
};
