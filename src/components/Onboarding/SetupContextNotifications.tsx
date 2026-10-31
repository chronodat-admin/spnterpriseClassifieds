import * as React from 'react';
import { Button, MessageBar, MessageBarActions, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import { PlayRegular, SettingsRegular } from '@fluentui/react-icons';
import { useLocalization } from '../../hooks';
import { DedicatedSubsiteWarning } from './DedicatedSubsiteWarning';
import styles from './SetupContextNotifications.module.scss';

export interface ISetupContextNotificationsProps {
  isTeamsHost?: boolean;
  isSiteOwner?: boolean;
  ownerAccessMessage?: string;
  showSetupRequired?: boolean;
  showSetupActions?: boolean;
  onCompleteSetup?: () => void;
  onOpenSettings?: () => void;
}

export const SetupContextNotifications: React.FC<ISetupContextNotificationsProps> = ({
  isTeamsHost = false,
  isSiteOwner = false,
  ownerAccessMessage,
  showSetupRequired = true,
  showSetupActions = true,
  onCompleteSetup,
  onOpenSettings
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <div className={styles.stack}>
      <DedicatedSubsiteWarning isTeamsHost={isTeamsHost} />
      {showSetupRequired ? (
        <MessageBar intent="warning">
          <MessageBarBody>
            <MessageBarTitle>{s.onboarding.setupRequired}</MessageBarTitle>
            {s.onboarding.setupNotCompleteContext}
            {!isSiteOwner && ownerAccessMessage ? ` ${ownerAccessMessage}` : null}
          </MessageBarBody>
          {showSetupActions && isSiteOwner ? (
            <MessageBarActions
              containerAction={
                <div className={styles.actions}>
                  {onCompleteSetup ? (
                    <Button appearance="primary" size="small" icon={<PlayRegular />} onClick={onCompleteSetup}>
                      {s.onboarding.completeSetup}
                    </Button>
                  ) : null}
                  {onOpenSettings ? (
                    <Button appearance="secondary" size="small" icon={<SettingsRegular />} onClick={onOpenSettings}>
                      {s.onboarding.viewInSettings}
                    </Button>
                  ) : null}
                </div>
              }
            />
          ) : null}
        </MessageBar>
      ) : null}
    </div>
  );
};

export default SetupContextNotifications;
