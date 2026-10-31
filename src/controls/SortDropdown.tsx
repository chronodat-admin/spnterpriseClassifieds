import * as React from 'react';
import { Dropdown, Option, Label } from '@fluentui/react-components';
import { ISortOption } from '../interfaces';

export interface ISortDropdownProps {
  value?: ISortOption;
  options: Array<{ key: string; label: string; field: string; direction: 'asc' | 'desc' }>;
  onChange: (sort: ISortOption | undefined) => void;
  label?: string;
}

export const SortDropdown: React.FC<ISortDropdownProps> = ({ value, options, onChange, label }) => {
  const selectedKey = value ? `${value.field}-${value.direction}` : options[0]?.key;

  const handleChange = (_: unknown, data: { optionValue?: string }): void => {
    const opt = options.find(o => o.key === data.optionValue);
    if (opt) {
      onChange({ field: opt.field, direction: opt.direction });
    }
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      <Dropdown
        value={options.find(o => o.key === selectedKey)?.label}
        selectedOptions={selectedKey ? [selectedKey] : []}
        onOptionSelect={handleChange}
      >
        {options.map(opt => (
          <Option key={opt.key} value={opt.key} text={opt.label}>{opt.label}</Option>
        ))}
      </Dropdown>
    </div>
  );
};
