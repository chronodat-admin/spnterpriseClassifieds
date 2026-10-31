import * as React from 'react';
import styles from './TwoColumnLayout.module.scss';

export interface ITwoColumnLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
}

export const TwoColumnLayout: React.FC<ITwoColumnLayoutProps> = ({
  sidebar,
  children,
  sidebarPosition = 'left',
  sidebarWidth = 280
}) => (
  <div className={`${styles.twoColumn} ${sidebarPosition === 'right' ? styles.reverse : ''}`}>
    <aside className={styles.sidebar} style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
      {sidebar}
    </aside>
    <main className={styles.main}>{children}</main>
  </div>
);
