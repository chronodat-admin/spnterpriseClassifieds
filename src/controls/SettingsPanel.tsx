import * as React from 'react';
import { Field, Input, Switch, Dropdown, Option, Button, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL, maxWidth: '640px' },
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }
});

export interface ISettingsField {
  key: string;
  label: string;
  type: 'text' | 'switch' | 'select';
  value: string | boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface ISettingsPanelProps {
  fields: ISettingsField[];
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
  title?: string;
}

export const SettingsPanel: React.FC<ISettingsPanelProps> = ({
  fields,
  onChange,
  onSave,
  saveLabel = 'Save',
  saving,
  title
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {title && <h3>{title}</h3>}
      <div className={classes.section}>
        {fields.map(field => (
          <Field key={field.key} label={field.label}>
            {field.type === 'switch' && (
              <Switch
                checked={!!field.value}
                onChange={(_, d) => onChange(field.key, d.checked)}
              />
            )}
            {field.type === 'text' && (
              <Input
                value={String(field.value)}
                onChange={(_, d) => onChange(field.key, d.value)}
              />
            )}
            {field.type === 'select' && field.options && (
              <Dropdown
                selectedOptions={[String(field.value)]}
                onOptionSelect={(_, d) => onChange(field.key, d.optionValue ?? '')}
              >
                {field.options.map(opt => (
                  <Option key={opt.value} value={opt.value} text={opt.label}>{opt.label}</Option>
                ))}
              </Dropdown>
            )}
          </Field>
        ))}
      </div>
      <Button appearance="primary" onClick={onSave} disabled={saving}>{saveLabel}</Button>
    </div>
  );
};
