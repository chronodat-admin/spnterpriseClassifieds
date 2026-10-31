import * as React from 'react';
import { Textarea, Button, makeStyles, tokens } from '@fluentui/react-components';
import { Send24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', gap: tokens.spacingHorizontalS, alignItems: 'flex-end', padding: tokens.spacingVerticalM }
});

export interface IMessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
}

export const MessageComposer: React.FC<IMessageComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  sendLabel = 'Send',
  disabled
}) => {
  const classes = useStyles();

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  };

  return (
    <div className={classes.root}>
      <Textarea
        value={value}
        onChange={(_, d) => onChange(d.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        resize="vertical"
        style={{ flex: 1 }}
        disabled={disabled}
      />
      <Button
        appearance="primary"
        icon={<Send24Regular />}
        onClick={onSend}
        disabled={!value.trim() || disabled}
      >
        {sendLabel}
      </Button>
    </div>
  );
};
