import * as React from 'react';
import styles from './PageLayout.module.scss';

export interface IPageLayoutProps {
  title: string;
  subtitle?: string;
  commandBar?: React.ReactNode;
  /** Alias for commandBar */
  actions?: React.ReactNode;
  children: React.ReactNode;
  titleAs?: 'h1' | 'h2';
}

export const PageLayout: React.FC<IPageLayoutProps> = ({
  title,
  subtitle,
  commandBar,
  actions,
  children,
  titleAs = 'h1'
}) => {
  const toolbar = actions ?? commandBar;
  const TitleTag = titleAs;

  return (
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <TitleTag className={styles.title}>{title}</TitleTag>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {toolbar && (
          <div className={styles.commandBar} role="toolbar" aria-label="Page actions">
            {toolbar}
          </div>
        )}
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
