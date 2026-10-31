import * as React from 'react';
import { Text, Button, MessageBar, MessageBarBody } from '@fluentui/react-components';

export interface IErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<IErrorStateProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Try again'
}) => (
  <MessageBar intent="error">
    <MessageBarBody>
      <Text weight="semibold">{title}</Text>
      <Text>{message}</Text>
      {onRetry && (
        <Button appearance="secondary" size="small" onClick={onRetry} style={{ marginTop: 8 }}>
          {retryLabel}
        </Button>
      )}
    </MessageBarBody>
  </MessageBar>
);
