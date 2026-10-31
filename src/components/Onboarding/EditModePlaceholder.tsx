import * as React from 'react';
import {
  Card,
  makeStyles,
  shorthands,
  Text,
  Title3,
  tokens
} from '@fluentui/react-components';
import { APP_NAME } from '../../constants';
import { useLocalization } from '../../hooks';
import { AppBrandIcon } from '../Layout/AppBrandIcon';
import { DedicatedSubsiteWarning } from './DedicatedSubsiteWarning';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px dashed ${tokens.colorNeutralStroke2}`
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS
  },
  panel: {
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow4,
    maxWidth: '520px',
    width: '100%',
    padding: tokens.spacingHorizontalL
  },
  list: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    lineHeight: 1.8,
    paddingLeft: tokens.spacingHorizontalL
  }
});

export interface IEditModePlaceholderProps {
  isTeamsHost?: boolean;
}

export const EditModePlaceholder: React.FC<IEditModePlaceholderProps> = ({
  isTeamsHost = false
}) => {
  const styles = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <div className={styles.root} style={{ minHeight: 420, width: '100%', display: 'block', visibility: 'visible' }}>
      <Card className={styles.panel}>
        <div className={styles.titleRow}>
          <AppBrandIcon variant="title" decorative />
          <Title3 as="h2">{APP_NAME}</Title3>
        </div>
        <Text style={{ color: tokens.colorNeutralForeground3, lineHeight: 1.6 }}>
          {s.onboarding.editModeReady}
        </Text>
        <DedicatedSubsiteWarning isTeamsHost={isTeamsHost} />
        <ol className={styles.list}>
          <li>{s.onboarding.editModeStepFinishLayout}</li>
          <li>
            {s.onboarding.editModeStepPublishPrefix}{' '}
            <strong>{s.onboarding.editModeStepPublishAction}</strong>
            {s.onboarding.editModeStepPublishSuffix}
          </li>
          <li>{s.onboarding.editModeStepReturn}</li>
        </ol>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {s.onboarding.editModeSetupNote}
        </Text>
      </Card>
    </div>
  );
};

export default EditModePlaceholder;
