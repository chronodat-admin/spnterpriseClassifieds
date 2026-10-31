import * as React from 'react';
import { Field, Input, Textarea, Dropdown, Option, Switch } from '@fluentui/react-components';
import { useLocalization } from '../../hooks';
import { ICategory } from '../../interfaces';
import styles from './CategoryForm.module.scss';

export interface ICategoryFormProps {
  value: Partial<ICategory>;
  onChange: (partial: Partial<ICategory>) => void;
  parentCategories?: ICategory[];
  disabled?: boolean;
  errors?: Record<string, string>;
}

export const CategoryForm: React.FC<ICategoryFormProps> = ({
  value,
  onChange,
  parentCategories = [],
  disabled = false,
  errors
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <div className={styles.form}>
      <Field
        label={s.categories.title}
        required
        validationMessage={errors?.title}
        validationState={errors?.title ? 'error' : 'none'}
      >
        <Input
          value={value.title ?? ''}
          onChange={(_, d) => onChange({ title: d.value })}
          disabled={disabled}
        />
      </Field>

      <Field label={s.common.details}>
        <Textarea
          value={value.description ?? ''}
          onChange={(_, d) => onChange({ description: d.value })}
          resize="vertical"
          rows={3}
          disabled={disabled}
        />
      </Field>

      {parentCategories.length > 0 && (
        <Field label={s.categories.parentCategory}>
          <Dropdown
            disabled={disabled}
            placeholder={s.common.none}
            selectedOptions={value.parentId ? [String(value.parentId)] : []}
            onOptionSelect={(_, d) =>
              onChange({ parentId: d.optionValue ? Number(d.optionValue) : undefined })
            }
          >
            <Option value="" text={s.common.none}>{s.common.none}</Option>
            {parentCategories
              .filter(cat => cat.id !== value.id)
              .map(cat => (
                <Option key={cat.id} value={String(cat.id)} text={cat.title}>{cat.title}</Option>
              ))}
          </Dropdown>
        </Field>
      )}

      <div className={styles.row}>
        <Field label="Icon" className={styles.colorField}>
          <Input
            value={value.iconName ?? ''}
            onChange={(_, d) => onChange({ iconName: d.value || undefined })}
            disabled={disabled}
            placeholder="Folder"
          />
        </Field>
        <Field label="Color" className={styles.colorField}>
          <Input
            value={value.color ?? ''}
            onChange={(_, d) => onChange({ color: d.value || undefined })}
            disabled={disabled}
            placeholder="#0078d4"
          />
        </Field>
        <Field label={s.admin.announcementsTitle} className={styles.colorField}>
          <Input
            type="number"
            value={value.sortOrder !== undefined ? String(value.sortOrder) : '0'}
            onChange={(_, d) => onChange({ sortOrder: Number(d.value) || 0 })}
            disabled={disabled}
          />
        </Field>
      </div>

      <Switch
        label={s.admin.isActive}
        checked={value.isVisible ?? true}
        onChange={(_, d) => onChange({ isVisible: d.checked })}
        disabled={disabled}
      />

      <Switch
        label={s.createWizard.categoryStep.approvalRequired}
        checked={value.approvalRequired ?? false}
        onChange={(_, d) => onChange({ approvalRequired: d.checked })}
        disabled={disabled}
      />
    </div>
  );
};

export default CategoryForm;
