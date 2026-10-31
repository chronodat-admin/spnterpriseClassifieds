import * as React from 'react';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { useAdminSettings } from './useAdminSettings';

export const AdminTeamsTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { settings, loading, saveSettings } = useAdminSettings('Teams');
  const [values, setValues] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setValues(Object.fromEntries(settings.map(x => [x.key, x.value === 'true'])));
  }, [settings]);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <SettingsPanel
      title={s.admin.settingsCategories.teams}
      fields={settings.map(set => ({ key: set.key, label: set.description ?? set.key, type: 'switch' as const, value: values[set.key] ?? false }))}
      onChange={(key, value) => setValues(prev => ({ ...prev, [key]: !!value }))}
      onSave={() => saveSettings(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)])))}
      saveLabel={s.common.save}
    />
  );
};

export default AdminTeamsTab;
