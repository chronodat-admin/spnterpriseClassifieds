import * as React from 'react';
import {
  Button,
  Input,
  Dropdown,
  Option,
  Checkbox,
  Field,
  makeStyles,
  tokens,
  Text
} from '@fluentui/react-components';
import { IListingFilter, ConditionValue } from '../interfaces';
import { ICategory } from '../interfaces';
import { CONDITION_VALUES, LISTING_STATUS, LISTING_TYPE } from '../constants';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  actions: { display: 'flex', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalS },
  activeTags: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS }
});

export interface IFilterPanelProps {
  filter: IListingFilter;
  categories?: ICategory[];
  onChange: (filter: IListingFilter) => void;
  onApply: () => void;
  onClear: () => void;
  labels: {
    title: string;
    category: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    listingType: string;
    status: string;
    featuredOnly: string;
    clearFilters: string;
    apply: string;
    activeFilters: string;
  };
}

export const FilterPanel: React.FC<IFilterPanelProps> = ({
  filter,
  categories = [],
  onChange,
  onApply,
  onClear,
  labels
}) => {
  const classes = useStyles();

  const update = (partial: Partial<IListingFilter>): void => {
    onChange({ ...filter, ...partial });
  };

  const activeCount = Object.entries(filter).filter(([, v]) => v !== undefined && v !== '').length;

  return (
    <div className={classes.root}>
      <Text weight="semibold">{labels.title}</Text>
      {activeCount > 0 && (
        <Text size={200}>{labels.activeFilters}: {activeCount}</Text>
      )}

      <Field label={labels.category}>
        <Dropdown
          placeholder={labels.category}
          value={categories.find(c => c.id === filter.categoryId)?.title ?? ''}
          selectedOptions={filter.categoryId ? [String(filter.categoryId)] : []}
          onOptionSelect={(_, d) => update({ categoryId: d.optionValue ? Number(d.optionValue) : undefined })}
        >
          <Option value="">—</Option>
          {categories.map(c => (
            <Option key={c.id} value={String(c.id)} text={c.title}>{c.title}</Option>
          ))}
        </Dropdown>
      </Field>

      <Field label={labels.condition}>
        <Dropdown
          selectedOptions={filter.condition ? [filter.condition] : []}
          onOptionSelect={(_, d) => update({ condition: d.optionValue as ConditionValue | undefined })}
        >
          <Option value="">—</Option>
          {Object.values(CONDITION_VALUES).map(c => (
            <Option key={c} value={c} text={c}>{c}</Option>
          ))}
        </Dropdown>
      </Field>

      <Field label={labels.listingType}>
        <Dropdown
          selectedOptions={filter.listingType ? [filter.listingType] : []}
          onOptionSelect={(_, d) => update({ listingType: d.optionValue as IListingFilter['listingType'] })}
        >
          <Option value="">—</Option>
          {Object.values(LISTING_TYPE).map(t => (
            <Option key={t} value={t} text={t}>{t}</Option>
          ))}
        </Dropdown>
      </Field>

      <Field label={labels.status}>
        <Dropdown
          selectedOptions={filter.status ? [filter.status] : []}
          onOptionSelect={(_, d) => update({ status: d.optionValue as IListingFilter['status'] })}
        >
          <Option value="">—</Option>
          {Object.values(LISTING_STATUS).map(s => (
            <Option key={s} value={s} text={s}>{s}</Option>
          ))}
        </Dropdown>
      </Field>

      <Field label={labels.minPrice}>
        <Input
          type="number"
          value={filter.minPrice !== undefined ? String(filter.minPrice) : ''}
          onChange={(_, d) => update({ minPrice: d.value ? Number(d.value) : undefined })}
        />
      </Field>

      <Field label={labels.maxPrice}>
        <Input
          type="number"
          value={filter.maxPrice !== undefined ? String(filter.maxPrice) : ''}
          onChange={(_, d) => update({ maxPrice: d.value ? Number(d.value) : undefined })}
        />
      </Field>

      <Checkbox
        label={labels.featuredOnly}
        checked={!!filter.isFeatured}
        onChange={(_, d) => update({ isFeatured: d.checked ? true : undefined })}
      />

      <div className={classes.actions}>
        <Button appearance="primary" onClick={onApply}>{labels.apply}</Button>
        <Button appearance="secondary" onClick={onClear}>{labels.clearFilters}</Button>
      </div>
    </div>
  );
};
