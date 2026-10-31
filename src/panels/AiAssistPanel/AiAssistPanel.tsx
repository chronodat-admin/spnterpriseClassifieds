import * as React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  Text,
  Spinner
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useStrings } from '../../hooks';
import { AppIcons } from '../../icons';
import styles from './AiAssistPanel.module.scss';

export interface IAiAssistAction {
  key: string;
  label: string;
  type: 'title' | 'description' | 'keywords' | 'improve' | 'rewrite';
}

export interface IAiAssistPanelProps {
  open: boolean;
  actions: IAiAssistAction[];
  onAction: (type: IAiAssistAction['type']) => Promise<void>;
  onDismiss: () => void;
  loading?: boolean;
  disabled?: boolean;
  previewContent?: string;
  title?: string;
}

export const AiAssistPanel: React.FC<IAiAssistPanelProps> = ({
  open,
  actions,
  onAction,
  onDismiss,
  loading = false,
  disabled = false,
  previewContent,
  title
}) => {
  const strings = useStrings();

  return (
    <Drawer
      type="overlay"
      separator
      open={open}
      onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}
      position="end"
      size="medium"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label={strings.common.close}
              icon={<DismissRegular />}
              onClick={onDismiss}
            />
          }
        >
          {title ?? strings.admin.aiSettings.title}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.panel}>
          <div className={styles.header}>
            <AppIcons name="Sparkle" />
            <Text weight="semibold">{strings.search.aiSuggestions}</Text>
          </div>

          <Text size={200}>{strings.createWizard.detailsStep.aiImprove}</Text>

          <div className={styles.actions}>
            {actions.map(action => (
              <Button
                key={action.key}
                appearance="secondary"
                size="small"
                disabled={disabled || loading}
                onClick={() => onAction(action.type)}
              >
                {action.label}
              </Button>
            ))}
          </div>

          {loading && (
            <div className={styles.loading}>
              <Spinner size="tiny" />
              <Text size={200}>{strings.common.loading}</Text>
            </div>
          )}

          {previewContent && (
            <div className={styles.preview}>
              <Text size={200}>{previewContent}</Text>
            </div>
          )}
        </div>
      </DrawerBody>

      <DrawerFooter>
        <Button appearance="secondary" onClick={onDismiss}>
          {strings.common.close}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};

export default AiAssistPanel;
