import * as React from 'react';
import { makeStyles, tokens, Text, Title3 } from '@fluentui/react-components';
import styles from './PageLayout.module.scss';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL, width: '100%' },
  header: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  content: { flex: 1 }
});

export interface IPageLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<IPageLayoutProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  children,
  className
}) => {
  const classes = useStyles();
  return (
    <div className={`${styles.pageLayout} ${className ?? ''} ${classes.root}`}>
      {(breadcrumbs || title || actions) && (
        <div className={styles.headerRow}>
          <div className={classes.header}>
            {breadcrumbs}
            {title && <Title3>{title}</Title3>}
            {subtitle && <Text size={300}>{subtitle}</Text>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={classes.content}>{children}</div>
    </div>
  );
};
