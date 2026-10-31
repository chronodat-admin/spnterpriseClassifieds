import * as React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  Field,
  Input,
  Dropdown,
  Option,
  Checkbox,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import {
  LISTING_STATUS,
  LISTING_TYPE,
  CONDITION_VALUES
} from '../../constants';
import { IListingFilter, ICategory, ILocation } from '../../interfaces';
import { useStrings } from '../../hooks';

const useStyles = makeStyles({
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  },
  priceRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS
  }
});

export interface IFilterPanelProps {
  open: boolean;
  filters: IListingFilter;
  categories?: ICategory[];
  locations?: ILocation[];
  onApply: (filters: IListingFilter) => void;
  onClear: () => void;
  onDismiss: () => void;
}

export const FilterPanel: React.FC<IFilterPanelProps> = ({
  open,
  filters,
  categories = [],
  locations = [],
  onApply,
  onClear,
  onDismiss
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const [localFilters, setLocalFilters] = React.useState<IListingFilter>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const updateFilter = <K extends keyof IListingFilter>(key: K, value: IListingFilter[K]): void => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = (): void => {
    onApply(localFilters);
    onDismiss();
  };

  const handleClear = (): void => {
    onClear();
    setLocalFilters({});
  };

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
          {strings.listings.filters.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.fieldGroup}>
          <Field label={strings.listings.filters.category}>
            <Dropdown
              placeholder={strings.common.all}
              value={localFilters.categoryId ? String(localFilters.categoryId) : ''}
              selectedOptions={localFilters.categoryId ? [String(localFilters.categoryId)] : []}
              onOptionSelect={(_, data) => updateFilter('categoryId', data.optionValue ? Number(data.optionValue) : undefined)}
            >
              <Option value="" text={strings.common.all}>{strings.common.all}</Option>
              {categories.map(cat => (
                <Option key={cat.id} value={String(cat.id)} text={cat.title}>{cat.title}</Option>
              ))}
            </Dropdown>
          </Field>

          <Field label={strings.listings.filters.location}>
            <Dropdown
              placeholder={strings.common.all}
              value={localFilters.locationId ? String(localFilters.locationId) : ''}
              selectedOptions={localFilters.locationId ? [String(localFilters.locationId)] : []}
              onOptionSelect={(_, data) => updateFilter('locationId', data.optionValue ? Number(data.optionValue) : undefined)}
            >
              <Option value="" text={strings.common.all}>{strings.common.all}</Option>
              {locations.map(loc => (
                <Option key={loc.id} value={String(loc.id)} text={loc.title}>{loc.title}</Option>
              ))}
            </Dropdown>
          </Field>

          <Field label={strings.listings.filters.condition}>
            <Dropdown
              placeholder={strings.common.all}
              value={localFilters.condition ?? ''}
              selectedOptions={localFilters.condition ? [localFilters.condition] : []}
              onOptionSelect={(_, data) => updateFilter('condition', data.optionValue as IListingFilter['condition'] || undefined)}
            >
              <Option value="" text={strings.common.all}>{strings.common.all}</Option>
              {Object.values(CONDITION_VALUES).map(cond => (
                <Option key={cond} value={cond} text={cond}>{cond}</Option>
              ))}
            </Dropdown>
          </Field>

          <Field label={strings.listings.filters.listingType}>
            <Dropdown
              placeholder={strings.common.all}
              value={localFilters.listingType ?? ''}
              selectedOptions={localFilters.listingType ? [localFilters.listingType] : []}
              onOptionSelect={(_, data) => updateFilter('listingType', data.optionValue as IListingFilter['listingType'] || undefined)}
            >
              <Option value="" text={strings.common.all}>{strings.common.all}</Option>
              {Object.values(LISTING_TYPE).map(type => (
                <Option key={type} value={type} text={type}>{type}</Option>
              ))}
            </Dropdown>
          </Field>

          <Field label={strings.listings.filters.status}>
            <Dropdown
              placeholder={strings.common.all}
              value={localFilters.status ?? ''}
              selectedOptions={localFilters.status ? [localFilters.status] : []}
              onOptionSelect={(_, data) => updateFilter('status', data.optionValue as IListingFilter['status'] || undefined)}
            >
              <Option value="" text={strings.common.all}>{strings.common.all}</Option>
              {Object.values(LISTING_STATUS).map(status => (
                <Option key={status} value={status} text={status}>{status}</Option>
              ))}
            </Dropdown>
          </Field>

          <Field label={strings.listings.filters.priceRange}>
            <div className={styles.priceRow}>
              <Input
                type="number"
                placeholder={strings.listings.filters.minPrice}
                value={localFilters.minPrice !== undefined ? String(localFilters.minPrice) : ''}
                onChange={(_, data) => updateFilter('minPrice', data.value ? Number(data.value) : undefined)}
                aria-label={strings.listings.filters.minPrice}
              />
              <Input
                type="number"
                placeholder={strings.listings.filters.maxPrice}
                value={localFilters.maxPrice !== undefined ? String(localFilters.maxPrice) : ''}
                onChange={(_, data) => updateFilter('maxPrice', data.value ? Number(data.value) : undefined)}
                aria-label={strings.listings.filters.maxPrice}
              />
            </div>
          </Field>

          <Field label={strings.listings.filters.department}>
            <Input
              value={localFilters.department ?? ''}
              onChange={(_, data) => updateFilter('department', data.value || undefined)}
            />
          </Field>

          <Checkbox
            label={strings.listings.filters.featuredOnly}
            checked={localFilters.isFeatured ?? false}
            onChange={(_, data) => updateFilter('isFeatured', data.checked === true ? true : undefined)}
          />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button appearance="secondary" onClick={handleClear}>
          {strings.listings.filters.clearFilters}
        </Button>
        <Button appearance="primary" onClick={handleApply}>
          {strings.common.apply}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
