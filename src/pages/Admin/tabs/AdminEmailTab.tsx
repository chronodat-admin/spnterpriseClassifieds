import * as React from 'react';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { useAdminSettings } from './useAdminSettings';

export const AdminEmailTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { settings, loading, saveSettings } = useAdminSettings('Email');
  const [values, setValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setValues(Object.fromEntries(settings.map(x => [x.key, x.value])));
  }, [settings]);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <SettingsPanel
      title={s.admin.emailTemplates}
      fields={settings.map(set => ({ key: set.key, label: set.description ?? set.key, type: 'text' as const, value: values[set.key] ?? '' }))}
      onChange={(key, value) => setValues(prev => ({ ...prev, [key]: String(value) }))}
      onSave={() => saveSettings(values)}
      saveLabel={s.common.save}
    />
  );
};

export default AdminEmailTab;
