import * as React from 'react';
import { useLocalization, useNotifications } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { ISetting, SettingCategory } from '../../../interfaces';

export function useAdminSettings(category: SettingCategory): {
  settings: ISetting[];
  loading: boolean;
  saveSettings: (updates: Record<string, string>) => Promise<void>;
  getValue: (key: string, fallback?: string) => string;
} {
  const { success } = useNotifications();
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [settings, setSettings] = React.useState<ISetting[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    ServiceContainer.getInstance()
      .resolve<{ getSettings(category?: SettingCategory): Promise<ISetting[]> }>(SERVICE_KEYS.AdminService)
      .getSettings(category)
      .then(setSettings)
      .finally(() => setLoading(false))
      .catch(() => undefined);
  }, [category]);

  const getValue = (key: string, fallback = ''): string =>
    settings.find(x => x.key === key)?.value ?? fallback;

  const saveSettings = async (updates: Record<string, string>): Promise<void> => {
    const admin = ServiceContainer.getInstance().resolve<{ updateSetting(id: number, value: string): Promise<ISetting> }>(SERVICE_KEYS.AdminService);
    await Promise.all(
      settings
        .filter(set => updates[set.key] !== undefined)
        .map(set => admin.updateSetting(set.id, updates[set.key]))
    );
    success(s.settings.saved);
  };

  return { settings, loading, saveSettings, getValue };
}
