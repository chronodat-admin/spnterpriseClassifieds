import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Button,
  Checkbox,
  Text,
  Divider,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ColumnTripleRegular } from '@fluentui/react-icons';
import { useStrings } from '../../hooks';

const useStyles = makeStyles({
  surface: {
    minWidth: '220px',
    maxHeight: '320px',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacingVerticalS
  },
  columnList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS
  },
  columnItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS
  }
});

export interface IColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

export interface IColumnPickerProps {
  columns: IColumnDefinition[];
  onChange: (columns: IColumnDefinition[]) => void;
  disabled?: boolean;
}

export const ColumnPicker: React.FC<IColumnPickerProps> = ({
  columns,
  onChange,
  disabled = false
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);

  const visibleCount = columns.filter(c => c.visible).length;

  const toggleColumn = (key: string): void => {
    onChange(columns.map(col =>
      col.key === key && !col.required ? { ...col, visible: !col.visible } : col
    ));
  };

  const selectAll = (): void => {
    onChange(columns.map(col => ({ ...col, visible: true })));
  };

  const deselectAll = (): void => {
    onChange(columns.map(col => ({ ...col, visible: col.required ?? false })));
  };

  return (
    <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<ColumnTripleRegular />}
          disabled={disabled}
          aria-label={`${strings.common.actions}: ${visibleCount} columns visible`}
        >
          {strings.common.actions}
        </Button>
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        <div className={styles.header}>
          <Text weight="semibold">{strings.common.actions}</Text>
          <div>
            <Button appearance="subtle" size="small" onClick={selectAll}>
              {strings.common.selectAll}
            </Button>
            <Button appearance="subtle" size="small" onClick={deselectAll}>
              {strings.common.deselectAll}
            </Button>
          </div>
        </div>
        <Divider />
        <div className={styles.columnList} role="group" aria-label="Column visibility">
          {columns.map(col => (
            <div key={col.key} className={styles.columnItem}>
              <Checkbox
                label={col.label}
                checked={col.visible}
                disabled={col.required}
                onChange={() => toggleColumn(col.key)}
              />
            </div>
          ))}
        </div>
      </PopoverSurface>
    </Popover>
  );
};
