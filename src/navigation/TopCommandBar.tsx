import * as React from 'react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem
} from '@fluentui/react-components';
import {
  AddRegular,
  EditRegular,
  DeleteRegular,
  ShareRegular,
  ArrowDownloadRegular,
  ArrowUploadRegular,
  ArrowSyncRegular,
  FilterRegular,
  MoreHorizontalRegular
} from '@fluentui/react-icons';
import { ICommandBarItem } from '../interfaces';

export interface ITopCommandBarProps {
  items: ICommandBarItem[];
  farItems?: ICommandBarItem[];
}

const ICON_MAP: Record<string, React.ReactElement> = {
  Add: <AddRegular />,
  Edit: <EditRegular />,
  Delete: <DeleteRegular />,
  Share: <ShareRegular />,
  Export: <ArrowDownloadRegular />,
  Import: <ArrowUploadRegular />,
  Refresh: <ArrowSyncRegular />,
  Filter: <FilterRegular />
};

function resolveIcon(icon?: string): React.ReactElement | undefined {
  if (!icon) return undefined;
  return ICON_MAP[icon] ?? <MoreHorizontalRegular />;
}

function renderMenuItems(subItems: ICommandBarItem[]): React.ReactNode {
  return subItems.map(subItem => (
    <MenuItem
      key={subItem.key}
      icon={resolveIcon(subItem.icon)}
      disabled={subItem.disabled}
      onClick={subItem.onClick}
    >
      {subItem.text}
    </MenuItem>
  ));
}

export const TopCommandBar: React.FC<ITopCommandBarProps> = ({ items, farItems }) => {
  const renderItem = (item: ICommandBarItem): React.ReactNode => {
    if (item.subMenuItems && item.subMenuItems.length > 0) {
      return (
        <Menu key={item.key}>
          <MenuTrigger disableButtonEnhancement>
            <ToolbarButton
              icon={resolveIcon(item.icon)}
              disabled={item.disabled}
              aria-label={item.text}
            >
              {item.text}
            </ToolbarButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>{renderMenuItems(item.subMenuItems)}</MenuList>
          </MenuPopover>
        </Menu>
      );
    }

    return (
      <ToolbarButton
        key={item.key}
        icon={resolveIcon(item.icon)}
        disabled={item.disabled}
        onClick={item.onClick}
        aria-label={item.text}
      >
        {item.text}
      </ToolbarButton>
    );
  };

  return (
    <Toolbar aria-label="Command bar">
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && <ToolbarDivider />}
          {renderItem(item)}
        </React.Fragment>
      ))}
      {farItems && farItems.length > 0 && (
        <>
          <ToolbarDivider />
          {farItems.map(item => renderItem(item))}
        </>
      )}
    </Toolbar>
  );
};
