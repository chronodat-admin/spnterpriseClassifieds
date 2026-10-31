import * as React from 'react';
import { Button, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Sparkle24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS, alignItems: 'center' }
});

export interface IAiAssistAction {
  key: string;
  label: string;
  type: 'title' | 'description' | 'keywords' | 'improve' | 'rewrite';
}

export interface IAiAssistPanelProps {
  actions: IAiAssistAction[];
  onAction: (type: IAiAssistAction['type']) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export const AiAssistPanel: React.FC<IAiAssistPanelProps> = ({ actions, onAction, loading, disabled }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Sparkle24Regular />
      <Text size={200}>AI assist</Text>
      {actions.map(action => (
        <Button
          key={action.key}
          appearance="secondary"
          size="small"
          disabled={disabled || loading}
          onClick={() => onAction(action.type)}
        >
          {action.label}
        </Button>
      ))}
      {loading && <Spinner size="tiny" />}
    </div>
  );
};
