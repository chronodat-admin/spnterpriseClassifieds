import * as React from 'react';
import { Dropdown, Option, Field, Text } from '@fluentui/react-components';
import { ICategory } from '../interfaces';

export interface ICategoryPickerProps {
  categories: ICategory[];
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const CategoryPicker: React.FC<ICategoryPickerProps> = ({
  categories,
  value,
  onChange,
  label,
  placeholder = 'Select category',
  required,
  error,
  disabled
}) => {
  const selected = categories.find(c => c.id === value);
  return (
    <Field label={label} required={required} validationMessage={error} validationState={error ? 'error' : 'none'}>
      <Dropdown
        placeholder={placeholder}
        value={selected?.title ?? ''}
        selectedOptions={value ? [String(value)] : []}
        onOptionSelect={(_, d) => onChange(d.optionValue ? Number(d.optionValue) : undefined)}
        disabled={disabled}
      >
        {categories.map(cat => (
          <Option key={cat.id} value={String(cat.id)} text={cat.title}>
            {cat.parentId ? `— ${cat.title}` : cat.title}
          </Option>
        ))}
      </Dropdown>
      {selected?.approvalRequired && (
        <Text size={200}>Approval required for this category</Text>
      )}
    </Field>
  );
};
