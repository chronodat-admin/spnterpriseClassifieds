import * as React from 'react';
import { Text, Button, makeStyles, tokens } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center'
  }
});

export interface IEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<IEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {icon ?? <Search24Regular fontSize={48} />}
      <Text weight="semibold" size={500}>{title}</Text>
      {description && <Text size={300}>{description}</Text>}
      {actionLabel && onAction && (
        <Button appearance="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
