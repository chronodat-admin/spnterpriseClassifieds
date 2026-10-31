import * as React from 'react';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization, useNotifications } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { ISetting } from '../../../interfaces';

export const AdminSettingsTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { success } = useNotifications();
  const [settings, setSettings] = React.useState<ISetting[]>([]);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    ServiceContainer.getInstance()
      .resolve<{ getSettings(category?: string): Promise<ISetting[]> }>(SERVICE_KEYS.AdminService)
      .getSettings('General')
      .then(data => {
        setSettings(data);
        setValues(Object.fromEntries(data.map(x => [x.key, x.value])));
      })
      .finally(() => setLoading(false))
      .catch(() => undefined);
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <SettingsPanel
      title={s.admin.settings}
      fields={settings.map(set => ({
        key: set.key,
        label: set.description ?? set.key,
        type: 'text' as const,
        value: values[set.key] ?? ''
      }))}
      onChange={(key, value) => setValues(prev => ({ ...prev, [key]: String(value) }))}
      onSave={async () => {
        setSaving(true);
        const admin = ServiceContainer.getInstance().resolve<{ updateSetting(id: number, value: string): Promise<ISetting> }>(SERVICE_KEYS.AdminService);
        await Promise.all(settings.map(set => admin.updateSetting(set.id, values[set.key] ?? set.value)));
        success(s.settings.saved);
        setSaving(false);
      }}
      saveLabel={s.common.save}
      saving={saving}
    />
  );
};

export default AdminSettingsTab;
