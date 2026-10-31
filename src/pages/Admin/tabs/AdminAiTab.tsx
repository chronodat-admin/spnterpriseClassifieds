import * as React from 'react';
import { Button, Field, Input, Text } from '@fluentui/react-components';
import { SettingsPanel, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { AI_SETTINGS_KEYS } from '../../../constants';
import { useAdminSettings } from './useAdminSettings';

export const AdminAiTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { settings, loading, saveSettings, getValue } = useAdminSettings('AI');
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});
  const [keyDraft, setKeyDraft] = React.useState('');
  const [replacingKey, setReplacingKey] = React.useState(false);
  const [removeKey, setRemoveKey] = React.useState(false);
  const hasStoredKey = Boolean(getValue(AI_SETTINGS_KEYS.ApiKeySecret));

  React.useEffect(() => {
    setValues({
      [AI_SETTINGS_KEYS.Endpoint]: getValue(AI_SETTINGS_KEYS.Endpoint),
      [AI_SETTINGS_KEYS.DeploymentName]: getValue(AI_SETTINGS_KEYS.DeploymentName),
      [AI_SETTINGS_KEYS.EnableGeneration]: getValue(AI_SETTINGS_KEYS.EnableGeneration) === 'true',
      [AI_SETTINGS_KEYS.EnableModeration]: getValue(AI_SETTINGS_KEYS.EnableModeration) === 'true',
      [AI_SETTINGS_KEYS.EnableDuplicateDetection]: getValue(AI_SETTINGS_KEYS.EnableDuplicateDetection) === 'true'
    });
  }, [settings]);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
    <SettingsPanel
      title={s.admin.aiSettings.title}
      fields={[
        { key: AI_SETTINGS_KEYS.Endpoint, label: s.admin.aiSettings.endpoint, type: 'text', value: String(values[AI_SETTINGS_KEYS.Endpoint] ?? '') },
        { key: AI_SETTINGS_KEYS.DeploymentName, label: s.admin.aiSettings.deploymentName, type: 'text', value: String(values[AI_SETTINGS_KEYS.DeploymentName] ?? '') },
        { key: AI_SETTINGS_KEYS.EnableGeneration, label: s.admin.aiSettings.enableGeneration, type: 'switch', value: !!values[AI_SETTINGS_KEYS.EnableGeneration] },
        { key: AI_SETTINGS_KEYS.EnableModeration, label: s.admin.aiSettings.enableModeration, type: 'switch', value: !!values[AI_SETTINGS_KEYS.EnableModeration] },
        { key: AI_SETTINGS_KEYS.EnableDuplicateDetection, label: s.admin.aiSettings.enableDuplicateDetection, type: 'switch', value: !!values[AI_SETTINGS_KEYS.EnableDuplicateDetection] }
      ]}
      onChange={(key, value) => setValues(prev => ({ ...prev, [key]: value }))}
      onSave={() => {
        const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]));
        if (removeKey) payload[AI_SETTINGS_KEYS.ApiKeySecret] = '';
        else if (keyDraft.trim()) payload[AI_SETTINGS_KEYS.ApiKeySecret] = keyDraft.trim();
        saveSettings(payload).catch(() => undefined);
        setKeyDraft('');
        setReplacingKey(false);
        setRemoveKey(false);
      }}
      saveLabel={s.common.save}
    />
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text weight="semibold">Azure OpenAI API key</Text>
      <Text size={200}>Keep this settings page limited to administrators. The key is sent only to the Azure OpenAI endpoint saved above. It is not written to the activity log.</Text>
      {hasStoredKey && !replacingKey && !removeKey ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Text>A key is saved.</Text>
          <Button appearance="secondary" onClick={() => setReplacingKey(true)}>Replace</Button>
          <Button appearance="secondary" onClick={() => setRemoveKey(true)}>Remove</Button>
        </div>
      ) : (
        <Field label={removeKey ? 'The saved key will be removed when you save' : 'API key'}>
          <Input
            type="password"
            value={removeKey ? '' : keyDraft}
            disabled={removeKey}
            onChange={(_, data) => setKeyDraft(data.value)}
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
          />
        </Field>
      )}
    </div>
    </>
  );
};

export default AdminAiTab;
