import * as React from 'react';
import { Switch, Text, makeStyles, tokens } from '@fluentui/react-components';
import { StatChart } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { LOCAL_STORAGE_KEYS } from '../../../constants';
import { readLocalStorage, writeLocalStorage } from '../../../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }
});

export const AdminTelemetryTab: React.FC = () => {
  const classes = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [optIn, setOptIn] = React.useState(() => readLocalStorage<boolean>(LOCAL_STORAGE_KEYS.TelemetryOptIn, true));

  return (
    <div className={classes.root}>
      <Text weight="semibold">{s.settings.telemetry}</Text>
      <Text size={200}>{s.settings.telemetryDescription}</Text>
      <Switch
        label={s.settings.telemetryOptIn}
        checked={optIn}
        onChange={(_, d) => {
          setOptIn(d.checked);
          writeLocalStorage(LOCAL_STORAGE_KEYS.TelemetryOptIn, d.checked);
        }}
      />
      <StatChart
        title="Events (sample)"
        data={[
          { label: 'Views', value: 120 },
          { label: 'Search', value: 85 },
          { label: 'Create', value: 32 },
          { label: 'Messages', value: 48 }
        ]}
      />
    </div>
  );
};

export default AdminTelemetryTab;
