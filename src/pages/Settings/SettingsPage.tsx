import * as React from 'react';
import { PageLayout } from '../../layouts';
import { SettingsPanel, TabBar } from '../../controls';
import { useLocalization, useTheme, useNotifications } from '../../hooks';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import { readLocalStorage, writeLocalStorage } from '../../utilities';
import styles from './SettingsPage.module.scss';

export const SettingsPage: React.FC = () => {
  const { strings, setLocale, locale } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { isDarkTheme, setThemeMode } = useTheme();
  const { success } = useNotifications();
  const [tab, setTab] = React.useState('general');
  const [telemetryOptIn, setTelemetryOptIn] = React.useState(() => readLocalStorage(LOCAL_STORAGE_KEYS.TelemetryOptIn, true));

  const tabs = [
    { key: 'general', label: s.settings.general },
    { key: 'appearance', label: s.settings.appearance },
    { key: 'privacy', label: s.settings.privacy },
    { key: 'notifications', label: s.settings.notifications }
  ];

  return (
    <PageLayout title={s.settings.title}>
      <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'general' && (
        <SettingsPanel
          fields={[
            { key: 'locale', label: s.settings.language, type: 'select', value: locale, options: [
              { value: 'en-us', label: 'English (US)' },
              { value: 'en-gb', label: 'English (UK)' }
            ]}
          ]}
          onChange={(key, value) => { if (key === 'locale') setLocale(String(value)); }}
          onSave={() => { writeLocalStorage(LOCAL_STORAGE_KEYS.Locale, locale); success(s.settings.saved); }}
          saveLabel={s.common.save}
        />
      )}

      {tab === 'appearance' && (
        <SettingsPanel
          fields={[
            { key: 'theme', label: s.settings.theme, type: 'select', value: isDarkTheme ? 'dark' : 'light', options: [
              { value: 'light', label: s.settings.themeLight },
              { value: 'dark', label: s.settings.themeDark },
              { value: 'system', label: s.settings.themeSystem }
            ]}
          ]}
          onChange={(_, value) => setThemeMode(String(value) as 'light' | 'dark' | 'system')}
          onSave={() => success(s.settings.saved)}
          saveLabel={s.common.save}
        />
      )}

      {tab === 'privacy' && (
        <SettingsPanel
          fields={[
            { key: 'telemetry', label: s.settings.telemetryOptIn, type: 'switch', value: telemetryOptIn }
          ]}
          onChange={(_, value) => {
            setTelemetryOptIn(!!value);
            writeLocalStorage(LOCAL_STORAGE_KEYS.TelemetryOptIn, !!value);
          }}
          onSave={() => success(s.settings.saved)}
          saveLabel={s.common.save}
        />
      )}

      {tab === 'notifications' && (
        <div className={styles.section}>
          <p>{s.settings.notifications}</p>
        </div>
      )}
    </PageLayout>
  );
};

export default SettingsPage;
