import * as React from 'react';
import { Field, Dropdown, Option, Switch, Button } from '@fluentui/react-components';
import { useLocalization } from '../../hooks';
import styles from './SettingsForm.module.scss';

export type SettingsTheme = 'light' | 'dark' | 'system';

export interface ISettingsFormProps {
  locale: string;
  theme: SettingsTheme;
  telemetryOptIn: boolean;
  emailNotifications?: boolean;
  onLocaleChange: (locale: string) => void;
  onThemeChange: (theme: SettingsTheme) => void;
  onTelemetryChange: (value: boolean) => void;
  onEmailNotificationsChange?: (value: boolean) => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
}

const LOCALE_OPTIONS = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en-gb', label: 'English (UK)' }
];

export const SettingsForm: React.FC<ISettingsFormProps> = ({
  locale,
  theme,
  telemetryOptIn,
  emailNotifications = true,
  onLocaleChange,
  onThemeChange,
  onTelemetryChange,
  onEmailNotificationsChange,
  onSave,
  saving = false,
  disabled = false
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <div className={styles.form}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.settings.general}</h4>
        <Field label={s.settings.language}>
          <Dropdown
            disabled={disabled || saving}
            selectedOptions={[locale]}
            onOptionSelect={(_, d) => onLocaleChange(d.optionValue ?? locale)}
          >
            {LOCALE_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value} text={opt.label}>{opt.label}</Option>
            ))}
          </Dropdown>
        </Field>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.settings.appearance}</h4>
        <Field label={s.settings.theme}>
          <Dropdown
            disabled={disabled || saving}
            selectedOptions={[theme]}
            onOptionSelect={(_, d) => onThemeChange((d.optionValue ?? theme) as SettingsTheme)}
          >
            <Option value="light" text={s.settings.themeLight}>{s.settings.themeLight}</Option>
            <Option value="dark" text={s.settings.themeDark}>{s.settings.themeDark}</Option>
            <Option value="system" text={s.settings.themeSystem}>{s.settings.themeSystem}</Option>
          </Dropdown>
        </Field>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.settings.privacy}</h4>
        <Switch
          label={s.settings.telemetryOptIn}
          checked={telemetryOptIn}
          onChange={(_, d) => onTelemetryChange(!!d.checked)}
          disabled={disabled || saving}
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.settings.notifications}</h4>
        <Switch
          label={s.search.notifyOnMatch}
          checked={emailNotifications}
          onChange={(_, d) => onEmailNotificationsChange?.(!!d.checked)}
          disabled={disabled || saving || !onEmailNotificationsChange}
        />
      </div>

      <div className={styles.actions}>
        <Button appearance="primary" onClick={onSave} disabled={disabled || saving}>
          {saving ? s.common.saving : s.common.save}
        </Button>
      </div>
    </div>
  );
};

export default SettingsForm;
