import * as React from 'react';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { useAdminSettings } from './useAdminSettings';

export const AdminBrandingTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { settings, loading, saveSettings, getValue } = useAdminSettings('Branding');
  const [values, setValues] = React.useState({ LogoUrl: '', PrimaryColor: '', AccentColor: '', AppTitle: '' });

  React.useEffect(() => {
    setValues({
      LogoUrl: getValue('LogoUrl'),
      PrimaryColor: getValue('PrimaryColor'),
      AccentColor: getValue('AccentColor'),
      AppTitle: getValue('AppTitle')
    });
  }, [settings]);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <SettingsPanel
      title={s.admin.branding}
      fields={[
        { key: 'LogoUrl', label: 'Logo URL', type: 'text', value: values.LogoUrl },
        { key: 'PrimaryColor', label: 'Primary color', type: 'text', value: values.PrimaryColor },
        { key: 'AccentColor', label: 'Accent color', type: 'text', value: values.AccentColor },
        { key: 'AppTitle', label: 'App title', type: 'text', value: values.AppTitle }
      ]}
      onChange={(key, value) => setValues(prev => ({ ...prev, [key]: String(value) }))}
      onSave={() => saveSettings(values)}
      saveLabel={s.common.save}
    />
  );
};

export default AdminBrandingTab;
