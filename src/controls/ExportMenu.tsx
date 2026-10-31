import * as React from 'react';
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Button } from '@fluentui/react-components';
import { ArrowExport24Regular } from '@fluentui/react-icons';

export interface IExportOption {
  key: string;
  label: string;
  onClick: () => void;
}

export interface IExportMenuProps {
  options: IExportOption[];
  label?: string;
}

export const ExportMenu: React.FC<IExportMenuProps> = ({ options, label = 'Export' }) => (
  <Menu>
    <MenuTrigger disableButtonEnhancement>
      <Button appearance="secondary" icon={<ArrowExport24Regular />}>{label}</Button>
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        {options.map(opt => (
          <MenuItem key={opt.key} onClick={opt.onClick}>{opt.label}</MenuItem>
        ))}
      </MenuList>
    </MenuPopover>
  </Menu>
);

export function exportListingsCsv(listings: Array<{ id: number; title: string; price: number; status: string }>, filename = 'listings.csv'): void {
  const header = 'ID,Title,Price,Status\n';
  const rows = listings.map(l => `${l.id},"${l.title.replace(/"/g, '""')}",${l.price},${l.status}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
