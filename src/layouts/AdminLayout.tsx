import * as React from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import styles from './AdminLayout.module.scss';

export interface IAdminTab {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface IAdminLayoutProps {
  tabs: IAdminTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  title?: string;
}

export const AdminLayout: React.FC<IAdminLayoutProps> = ({ tabs, activeTab, onTabChange, title }) => {
  const active = tabs.find(t => t.key === activeTab);

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    if (typeof data.value === 'string') {
      onTabChange(data.value);
    }
  };

  return (
    <div className={styles.adminLayout}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <TabList selectedValue={activeTab} onTabSelect={handleTabSelect} className={styles.tabList}>
        {tabs.map(tab => (
          <Tab key={tab.key} value={tab.key}>{tab.label}</Tab>
        ))}
      </TabList>
      <div className={styles.tabContent}>{active?.content}</div>
    </div>
  );
};
