import * as React from 'react';
import {
  Text,
  Button,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ErrorCircleRegular, ArrowLeftRegular } from '@fluentui/react-icons';
import { useStrings } from '../../hooks';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
    minHeight: '300px'
  },
  icon: {
    fontSize: '64px',
    color: tokens.colorPaletteRedForeground1
  },
  title: {
    color: tokens.colorNeutralForeground1
  },
  message: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '480px'
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS
  }
});

export interface IErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  showRetry?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorPage: React.FC<IErrorPageProps> = ({
  title,
  message,
  statusCode,
  showRetry = false,
  onRetry,
  onBack
}) => {
  const strings = useStrings();
  const styles = useStyles();

  const resolvedTitle = title ?? (statusCode === 404 ? strings.errors.notFound : strings.app.error);
  const resolvedMessage = message ?? strings.errors.generic;

  return (
    <div className={styles.root} role="alert" aria-live="assertive">
      <div className={styles.icon} aria-hidden="true">
        <ErrorCircleRegular />
      </div>
      {statusCode && (
        <Text size={800} weight="bold" aria-hidden="true">{statusCode}</Text>
      )}
      <Text className={styles.title} size={600} weight="semibold" as="h1">
        {resolvedTitle}
      </Text>
      <Text className={styles.message} size={300}>
        {resolvedMessage}
      </Text>
      <div className={styles.actions}>
        {showRetry && onRetry && (
          <Button appearance="primary" onClick={onRetry}>
            {strings.app.retry}
          </Button>
        )}
        {onBack && (
          <Button appearance="secondary" icon={<ArrowLeftRegular />} onClick={onBack}>
            {strings.common.back}
          </Button>
        )}
      </div>
    </div>
  );
};
