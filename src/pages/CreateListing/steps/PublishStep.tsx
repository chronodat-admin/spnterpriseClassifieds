import * as React from 'react';
import { Text, MessageBar, MessageBarBody, Checkbox } from '@fluentui/react-components';
import { useLocalization, useCategories } from '../../../hooks';
import { ICreateListingWizardState } from '../../../interfaces';
import { LISTING_STATUS } from '../../../constants';
import styles from './PublishStep.module.scss';

export interface IPublishStepProps {
  state: ICreateListingWizardState;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
  requiresApproval?: boolean;
}

export const PublishStep: React.FC<IPublishStepProps> = ({ state, onChange, requiresApproval }) => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { getCategoryById } = useCategories();
  const category = state.categoryId ? getCategoryById(state.categoryId) : undefined;
  const needsApproval = requiresApproval ?? category?.approvalRequired ?? false;

  return (
    <div className={styles.publishStep}>
      <h3>{s.createWizard.reviewStep.publish}</h3>
      <Text>{s.createWizard.reviewStep.description}</Text>

      {needsApproval && (
        <MessageBar intent="warning">
          <MessageBarBody>{s.createWizard.reviewStep.moderationPending}</MessageBarBody>
        </MessageBar>
      )}

      <Checkbox
        label={s.createWizard.reviewStep.saveDraft}
        checked={state.status === LISTING_STATUS.Draft}
        onChange={(_, d) => onChange({ status: d.checked ? LISTING_STATUS.Draft : LISTING_STATUS.Pending })}
      />

      <div className={styles.summary}>
        <Text weight="semibold">{state.title}</Text>
        <Text size={200}>
          {needsApproval ? s.createWizard.reviewStep.submitForApproval : s.createWizard.reviewStep.publish}
        </Text>
      </div>
    </div>
  );
};

export default PublishStep;
