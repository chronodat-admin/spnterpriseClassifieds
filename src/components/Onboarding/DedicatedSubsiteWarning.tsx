import * as React from 'react';
import { MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import { APP_NAME } from '../../constants';
import { useLocalization } from '../../hooks';
import styles from './DedicatedSubsiteWarning.module.scss';

export interface IDedicatedSubsiteWarningProps {
  className?: string;
  isTeamsHost?: boolean;
}

export const DedicatedSubsiteWarning: React.FC<IDedicatedSubsiteWarningProps> = ({
  className,
  isTeamsHost = false
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  if (isTeamsHost) {
    return (
      <MessageBar intent="info" className={className ?? styles.root}>
        <MessageBarBody>
          <MessageBarTitle>{s.onboarding.teamsTabTitle}</MessageBarTitle>
          {s.onboarding.teamsTabMessage.replace('{appName}', APP_NAME)}
        </MessageBarBody>
      </MessageBar>
    );
  }

  return (
    <MessageBar intent="warning" className={className ?? styles.root}>
      <MessageBarBody>
        <MessageBarTitle>{s.onboarding.dedicatedSubsiteTitle}</MessageBarTitle>
        {s.onboarding.dedicatedSubsiteMessage}
      </MessageBarBody>
    </MessageBar>
  );
};

export default DedicatedSubsiteWarning;
