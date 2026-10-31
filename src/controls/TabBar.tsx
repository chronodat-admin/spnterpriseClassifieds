import * as React from 'react';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';

export interface ITabItem {
  key: string;
  label: string;
  badge?: number;
}

export interface ITabBarProps {
  tabs: ITabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const TabBar: React.FC<ITabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const handleSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    if (typeof data.value === 'string') onTabChange(data.value);
  };

  return (
    <TabList selectedValue={activeTab} onTabSelect={handleSelect}>
      {tabs.map(tab => (
        <Tab key={tab.key} value={tab.key}>
          {tab.label}{tab.badge !== undefined && tab.badge > 0 ? ` (${tab.badge})` : ''}
        </Tab>
      ))}
    </TabList>
  );
};
