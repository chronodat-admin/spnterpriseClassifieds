import * as React from 'react';
import { Text, Button, Tag, makeStyles, tokens } from '@fluentui/react-components';
import { History24Regular, Dismiss24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS }
});

export interface ISearchHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
  title?: string;
  clearLabel?: string;
}

export const SearchHistory: React.FC<ISearchHistoryProps> = ({
  history,
  onSelect,
  onClear,
  title = 'Recent searches',
  clearLabel = 'Clear history'
}) => {
  const classes = useStyles();
  if (history.length === 0) return null;
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Text weight="semibold"><History24Regular /> {title}</Text>
        <Button appearance="subtle" size="small" icon={<Dismiss24Regular />} onClick={onClear}>{clearLabel}</Button>
      </div>
      <div className={classes.tags}>
        {history.map((item, i) => (
          <Tag key={i} shape="rounded" appearance="outline" onClick={() => onSelect(item)} style={{ cursor: 'pointer' }}>
            {item}
          </Tag>
        ))}
      </div>
    </div>
  );
};
