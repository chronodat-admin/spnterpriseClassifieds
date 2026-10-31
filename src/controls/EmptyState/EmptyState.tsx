import * as React from 'react';
import {
  Text,
  Button,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  DocumentRegular,
  SearchRegular,
  HeartRegular,
  ChatRegular,
  FolderRegular,
  ErrorCircleRegular
} from '@fluentui/react-icons';
import { useStrings } from '../../hooks';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    gap: tokens.spacingVerticalM
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground3
  },
  title: {
    color: tokens.colorNeutralForeground1
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '400px'
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS
  }
});

export type EmptyStateVariant = 'default' | 'search' | 'favorites' | 'messages' | 'categories' | 'error';

export interface IEmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactElement;
}

const VARIANT_ICONS: Record<EmptyStateVariant, React.ReactElement> = {
  default: <DocumentRegular />,
  search: <SearchRegular />,
  favorites: <HeartRegular />,
  messages: <ChatRegular />,
  categories: <FolderRegular />,
  error: <ErrorCircleRegular />
};

export const EmptyState: React.FC<IEmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon
}) => {
  const strings = useStrings();
  const styles = useStyles();

  const resolvedTitle = title ?? strings.app.noResults;
  const resolvedDescription = description ?? strings.listings.noListingsDescription;
  const displayIcon = icon ?? VARIANT_ICONS[variant];

  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">{displayIcon}</div>
      <Text className={styles.title} size={500} weight="semibold" as="h2">
        {resolvedTitle}
      </Text>
      {resolvedDescription && (
        <Text className={styles.description} size={300}>
          {resolvedDescription}
        </Text>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className={styles.actions}>
          {actionLabel && onAction && (
            <Button appearance="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button appearance="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
