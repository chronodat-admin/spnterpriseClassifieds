import * as React from 'react';
import { Button, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS }
});

export interface IQuickAction {
  key: string;
  label: string;
  icon?: React.ReactElement;
  onClick: () => void;
}

export interface IQuickActionsProps {
  actions: IQuickAction[];
}

export const QuickActions: React.FC<IQuickActionsProps> = ({ actions }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {actions.map(action => (
        <Button
          key={action.key}
          appearance="secondary"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
