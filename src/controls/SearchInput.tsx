import * as React from 'react';
import { Input, Button } from '@fluentui/react-components';
import { Search24Regular, Dismiss24Regular } from '@fluentui/react-icons';

export interface ISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<ISearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  disabled
}) => {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <Input
      value={value}
      onChange={(_, d) => onChange(d.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      contentBefore={<Search24Regular />}
      contentAfter={
        value ? (
          <Button
            appearance="transparent"
            icon={<Dismiss24Regular />}
            onClick={() => onChange('')}
            aria-label="Clear search"
          />
        ) : undefined
      }
    />
  );
};
