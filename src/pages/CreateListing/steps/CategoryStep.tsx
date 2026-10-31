import * as React from 'react';
import { Field, Input, Textarea, Dropdown, Option, makeStyles, tokens } from '@fluentui/react-components';
import { CategoryPicker, AiAssistPanel } from '../../../controls';
import { useCategories, useLocalization } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { ICreateListingWizardState, IAiGenerateRequest, IAiGenerateResponse } from '../../../interfaces';
import { LISTING_TYPE, CONDITION_VALUES } from '../../../constants';
import { validateListingTitle, validateListingDescription } from '../../../utilities';
import styles from './CategoryStep.module.scss';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }
});

interface IAiService {
  generate(request: IAiGenerateRequest): Promise<IAiGenerateResponse>;
}

export interface ICategoryStepProps {
  state: ICreateListingWizardState;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
  errors?: Record<string, string>;
}

export const CategoryStep: React.FC<ICategoryStepProps> = ({ state, onChange, errors }) => {
  const classes = useStyles();
  const { categories } = useCategories();
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [aiLoading, setAiLoading] = React.useState(false);

  const runAi = async (type: IAiGenerateRequest['type']): Promise<void> => {
    setAiLoading(true);
    try {
      const ai = ServiceContainer.getInstance().resolve<IAiService>(SERVICE_KEYS.AiService);
      const context = state.categoryId ? categories.find(c => c.id === state.categoryId)?.title : undefined;
      if (type === 'title') {
        const result = await ai.generate({ type: 'title', content: state.description || state.title, context });
        onChange({ title: result.result });
      } else if (type === 'description') {
        const result = await ai.generate({ type: 'description', content: state.title, context });
        onChange({ description: result.result });
      } else if (type === 'keywords') {
        const result = await ai.generate({ type: 'keywords', content: `${state.title}\n${state.description}`, context });
        onChange({ keywords: result.result });
      } else if (type === 'improve') {
        const result = await ai.generate({ type: 'improve', content: state.description, context });
        onChange({ description: result.result });
      }
    } catch {
      /* AI optional */
    } finally {
      setAiLoading(false);
    }
  };

  const titleError = errors?.title ?? validateListingTitle(state.title);
  const descError = errors?.description ?? validateListingDescription(state.description);

  return (
    <div className={`${styles.categoryStep} ${classes.root}`}>
      <h3>{s.createWizard.categoryStep.title}</h3>
      <p>{s.createWizard.categoryStep.description}</p>

      <CategoryPicker
        categories={categories}
        value={state.categoryId}
        onChange={(categoryId) => onChange({ categoryId })}
        label={s.createWizard.categoryStep.selectCategory}
        required
        error={errors?.categoryId}
      />

      <Field label={s.createWizard.detailsStep.listingTitle} required validationMessage={titleError} validationState={titleError ? 'error' : 'none'}>
        <Input
          value={state.title}
          onChange={(_, d) => onChange({ title: d.value })}
          placeholder={s.createWizard.detailsStep.listingTitlePlaceholder}
        />
      </Field>

      <Field label={s.createWizard.detailsStep.description} required validationMessage={descError} validationState={descError ? 'error' : 'none'}>
        <Textarea
          value={state.description}
          onChange={(_, d) => onChange({ description: d.value })}
          placeholder={s.createWizard.detailsStep.descriptionPlaceholder}
          resize="vertical"
          rows={6}
        />
      </Field>

      <Field label={s.createWizard.detailsStep.keywords}>
        <Input
          value={state.keywords}
          onChange={(_, d) => onChange({ keywords: d.value })}
          placeholder={s.createWizard.detailsStep.keywordsPlaceholder}
        />
      </Field>

      <Field label={s.createWizard.detailsStep.listingType}>
        <Dropdown
          selectedOptions={[state.listingType]}
          onOptionSelect={(_, d) => onChange({ listingType: d.optionValue as ICreateListingWizardState['listingType'] })}
        >
          {Object.values(LISTING_TYPE).map(t => (
            <Option key={t} value={t} text={t}>{t}</Option>
          ))}
        </Dropdown>
      </Field>

      <Field label={s.createWizard.detailsStep.condition}>
        <Dropdown
          selectedOptions={[state.condition]}
          onOptionSelect={(_, d) => onChange({ condition: d.optionValue as ICreateListingWizardState['condition'] })}
        >
          {Object.values(CONDITION_VALUES).map(c => (
            <Option key={c} value={c} text={c}>{c}</Option>
          ))}
        </Dropdown>
      </Field>

      <AiAssistPanel
        loading={aiLoading}
        disabled={!state.title && !state.description}
        actions={[
          { key: 'title', label: s.createWizard.detailsStep.aiGenerateTitle, type: 'title' },
          { key: 'desc', label: s.createWizard.detailsStep.aiGenerateDescription, type: 'description' },
          { key: 'keywords', label: s.createWizard.detailsStep.keywords, type: 'keywords' },
          { key: 'improve', label: s.createWizard.detailsStep.aiImprove, type: 'improve' }
        ]}
        onAction={runAi}
      />
    </div>
  );
};

export default CategoryStep;
