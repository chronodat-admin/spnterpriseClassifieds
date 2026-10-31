import * as React from 'react';
import { Text } from '@fluentui/react-components';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { useAdminSettings } from './useAdminSettings';

export const AdminLicenseTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { settings, loading, saveSettings, getValue } = useAdminSettings('License');
  const [license, setLicense] = React.useState('');

  React.useEffect(() => {
    setLicense(getValue('LicenseKey'));
  }, [settings]);

  if (loading) return <LoadingSkeleton rows={2} />;

  return (
    <>
      <Text>{s.admin.settingsCategories.license}</Text>
      <SettingsPanel
        fields={[{ key: 'LicenseKey', label: 'License key', type: 'text', value: license }]}
        onChange={(_, value) => setLicense(String(value))}
        onSave={() => saveSettings({ LicenseKey: license })}
        saveLabel={s.common.save}
      />
    </>
  );
};

export default AdminLicenseTab;
