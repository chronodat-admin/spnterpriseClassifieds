import * as React from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Delete24Regular, ArrowExport24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium
  }
});

export interface IBulkAction {
  key: string;
  label: string;
  icon?: React.ReactElement;
  onClick: (selectedIds: number[]) => void;
  appearance?: 'primary' | 'secondary' | 'subtle';
}

export interface IBulkActionBarProps {
  selectedIds: number[];
  actions: IBulkAction[];
  onClearSelection: () => void;
  selectAllLabel?: string;
}

export const BulkActionBar: React.FC<IBulkActionBarProps> = ({
  selectedIds,
  actions,
  onClearSelection
}) => {
  const classes = useStyles();
  if (selectedIds.length === 0) return null;

  return (
    <div className={classes.root}>
      <Text weight="semibold">{selectedIds.length} selected</Text>
      {actions.map(action => (
        <Button
          key={action.key}
          appearance={action.appearance ?? 'secondary'}
          icon={action.icon}
          onClick={() => action.onClick(selectedIds)}
        >
          {action.label}
        </Button>
      ))}
      <Button appearance="subtle" onClick={onClearSelection}>Clear</Button>
    </div>
  );
};

export const defaultBulkActions = (
  onDelete: (ids: number[]) => void,
  onExport: (ids: number[]) => void,
  labels: { delete: string; export: string }
): IBulkAction[] => [
  { key: 'export', label: labels.export, icon: <ArrowExport24Regular />, onClick: onExport },
  { key: 'delete', label: labels.delete, icon: <Delete24Regular />, onClick: onDelete, appearance: 'secondary' }
];
