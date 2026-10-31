import * as React from 'react';
import { Field, Input, Textarea, Dropdown, Option, Switch } from '@fluentui/react-components';
import { useLocalization } from '../../hooks';
import { IWantedAd, ICategory } from '../../interfaces';
import styles from './WantedAdForm.module.scss';

export interface IWantedAdFormProps {
  value: Partial<IWantedAd>;
  onChange: (partial: Partial<IWantedAd>) => void;
  categories?: ICategory[];
  disabled?: boolean;
  errors?: Record<string, string>;
}

export const WantedAdForm: React.FC<IWantedAdFormProps> = ({
  value,
  onChange,
  categories = [],
  disabled = false,
  errors
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <div className={styles.form}>
      <Field
        label={s.createWizard.detailsStep.listingTitle}
        required
        validationMessage={errors?.title}
        validationState={errors?.title ? 'error' : 'none'}
      >
        <Input
          value={value.title ?? ''}
          onChange={(_, d) => onChange({ title: d.value })}
          disabled={disabled}
          aria-invalid={!!errors?.title}
        />
      </Field>

      <Field label={s.wantedAds.description}>
        <Textarea
          value={value.description ?? ''}
          onChange={(_, d) => onChange({ description: d.value })}
          resize="vertical"
          rows={5}
          disabled={disabled}
        />
      </Field>

      {categories.length > 0 && (
        <Field label={s.listings.category} required validationMessage={errors?.categoryId} validationState={errors?.categoryId ? 'error' : 'none'}>
          <Dropdown
            disabled={disabled}
            placeholder={s.createWizard.categoryStep.selectCategory}
            selectedOptions={value.categoryId ? [String(value.categoryId)] : []}
            onOptionSelect={(_, d) => onChange({ categoryId: d.optionValue ? Number(d.optionValue) : undefined })}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={String(cat.id)} text={cat.title}>{cat.title}</Option>
            ))}
          </Dropdown>
        </Field>
      )}

      <Field label={s.wantedAds.maxPrice}>
        <Input
          type="number"
          min={0}
          value={value.maxPrice !== undefined ? String(value.maxPrice) : ''}
          onChange={(_, d) => onChange({ maxPrice: d.value ? Number(d.value) : undefined })}
          disabled={disabled}
        />
      </Field>

      <Field label={s.createWizard.pricingStep.currency}>
        <Input
          value={value.currency ?? 'USD'}
          onChange={(_, d) => onChange({ currency: d.value })}
          disabled={disabled}
        />
      </Field>

      <Switch
        label={s.wantedAds.active}
        checked={value.isActive ?? true}
        onChange={(_, d) => onChange({ isActive: d.checked })}
        disabled={disabled}
      />
    </div>
  );
};

export default WantedAdForm;
