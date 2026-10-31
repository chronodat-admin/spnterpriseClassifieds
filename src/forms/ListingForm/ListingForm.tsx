import * as React from 'react';
import {
  Field,
  Input,
  Textarea,
  Dropdown,
  Option,
  Divider
} from '@fluentui/react-components';
import { CategoryPicker, PriceInput, LocationPicker, AiAssistPanel } from '../../controls';
import { useCategories, useLocalization, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import {
  ICreateListingWizardState,
  IAiGenerateRequest,
  IAiGenerateResponse,
  ILocation
} from '../../interfaces';
import { LISTING_TYPE, CONDITION_VALUES } from '../../constants';
import { validateListingTitle, validateListingDescription, validatePrice } from '../../utilities';
import styles from './ListingForm.module.scss';

interface IAiService {
  generate(request: IAiGenerateRequest): Promise<IAiGenerateResponse>;
}

export interface IListingFormProps {
  value: Partial<ICreateListingWizardState>;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  showAiAssist?: boolean;
  showLocation?: boolean;
  showPricing?: boolean;
}

const DEFAULT_STATE: Partial<ICreateListingWizardState> = {
  title: '',
  description: '',
  keywords: '',
  tags: [],
  listingType: LISTING_TYPE.Sell,
  condition: CONDITION_VALUES.Good,
  price: 0,
  currency: 'USD',
  isNegotiable: false,
  isRental: false,
  isAuction: false,
  isDonation: false,
  pickupAvailable: true,
  shippingAvailable: false
};

export const ListingForm: React.FC<IListingFormProps> = ({
  value,
  onChange,
  errors,
  disabled = false,
  showAiAssist = true,
  showLocation = true,
  showPricing = true
}) => {
  const state = { ...DEFAULT_STATE, ...value };
  const { categories } = useCategories();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { serviceContainerReady } = useAppContext();
  const [aiLoading, setAiLoading] = React.useState(false);
  const [locations, setLocations] = React.useState<ILocation[]>([]);

  React.useEffect(() => {
    if (!serviceContainerReady || !showLocation) return;
    ServiceContainer.getInstance()
      .resolve<{ getAll(): Promise<ILocation[]> }>(SERVICE_KEYS.LocationRepository)
      .getAll()
      .then(setLocations)
      .catch(() => undefined);
  }, [serviceContainerReady, showLocation]);

  const titleError = errors?.title ?? validateListingTitle(state.title ?? '');
  const descError = errors?.description ?? validateListingDescription(state.description ?? '');
  const priceError = showPricing ? validatePrice(state.price ?? 0, !!state.isDonation) : undefined;

  const runAi = async (type: IAiGenerateRequest['type']): Promise<void> => {
    setAiLoading(true);
    try {
      const ai = ServiceContainer.getInstance().resolve<IAiService>(SERVICE_KEYS.AiService);
      const context = state.categoryId
        ? categories.find(c => c.id === state.categoryId)?.title
        : undefined;

      if (type === 'title') {
        const result = await ai.generate({ type: 'title', content: state.description || state.title || '', context });
        onChange({ title: result.result });
      } else if (type === 'description') {
        const result = await ai.generate({ type: 'description', content: state.title || '', context });
        onChange({ description: result.result });
      } else if (type === 'keywords') {
        const result = await ai.generate({
          type: 'keywords',
          content: `${state.title ?? ''}\n${state.description ?? ''}`,
          context
        });
        onChange({ keywords: result.result });
      } else if (type === 'improve' || type === 'rewrite') {
        const result = await ai.generate({ type, content: state.description || '', context });
        onChange({ description: result.result });
      }
    } catch {
      /* AI assist is optional */
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.createWizard.categoryStep.title}</h4>
        <CategoryPicker
          categories={categories}
          value={state.categoryId}
          onChange={(categoryId) => onChange({ categoryId })}
          label={s.createWizard.categoryStep.selectCategory}
          required
          disabled={disabled}
          error={errors?.categoryId}
        />
      </div>

      <Divider />

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{s.createWizard.detailsStep.title}</h4>

        <Field
          label={s.createWizard.detailsStep.listingTitle}
          required
          validationMessage={titleError}
          validationState={titleError ? 'error' : 'none'}
        >
          <Input
            value={state.title ?? ''}
            onChange={(_, d) => onChange({ title: d.value })}
            placeholder={s.createWizard.detailsStep.listingTitlePlaceholder}
            disabled={disabled}
          />
        </Field>

        <Field
          label={s.createWizard.detailsStep.description}
          required
          validationMessage={descError}
          validationState={descError ? 'error' : 'none'}
        >
          <Textarea
            value={state.description ?? ''}
            onChange={(_, d) => onChange({ description: d.value })}
            placeholder={s.createWizard.detailsStep.descriptionPlaceholder}
            resize="vertical"
            rows={6}
            disabled={disabled}
          />
        </Field>

        <Field label={s.createWizard.detailsStep.keywords}>
          <Input
            value={state.keywords ?? ''}
            onChange={(_, d) => onChange({ keywords: d.value })}
            placeholder={s.createWizard.detailsStep.keywordsPlaceholder}
            disabled={disabled}
          />
        </Field>

        <Field label={s.createWizard.detailsStep.listingType}>
          <Dropdown
            disabled={disabled}
            selectedOptions={state.listingType ? [state.listingType] : []}
            onOptionSelect={(_, d) =>
              onChange({ listingType: d.optionValue as ICreateListingWizardState['listingType'] })
            }
          >
            {Object.values(LISTING_TYPE).map(type => (
              <Option key={type} value={type} text={type}>{type}</Option>
            ))}
          </Dropdown>
        </Field>

        <Field label={s.createWizard.detailsStep.condition}>
          <Dropdown
            disabled={disabled}
            selectedOptions={state.condition ? [state.condition] : []}
            onOptionSelect={(_, d) =>
              onChange({ condition: d.optionValue as ICreateListingWizardState['condition'] })
            }
          >
            {Object.values(CONDITION_VALUES).map(cond => (
              <Option key={cond} value={cond} text={cond}>{cond}</Option>
            ))}
          </Dropdown>
        </Field>

        {showAiAssist && (
          <div className={styles.aiRow}>
            <AiAssistPanel
              loading={aiLoading}
              disabled={disabled || (!state.title && !state.description)}
              actions={[
                { key: 'title', label: s.createWizard.detailsStep.aiGenerateTitle, type: 'title' },
                { key: 'desc', label: s.createWizard.detailsStep.aiGenerateDescription, type: 'description' },
                { key: 'keywords', label: s.createWizard.detailsStep.keywords, type: 'keywords' },
                { key: 'improve', label: s.createWizard.detailsStep.aiImprove, type: 'improve' }
              ]}
              onAction={runAi}
            />
          </div>
        )}
      </div>

      {showPricing && (
        <>
          <Divider />
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{s.createWizard.pricingStep.title}</h4>
            <PriceInput
              price={state.price ?? 0}
              currency={state.currency ?? 'USD'}
              isNegotiable={!!state.isNegotiable}
              isDonation={!!state.isDonation}
              isRental={!!state.isRental}
              isAuction={!!state.isAuction}
              onPriceChange={(price) => onChange({ price })}
              onCurrencyChange={(currency) => onChange({ currency })}
              onNegotiableChange={(isNegotiable) => onChange({ isNegotiable })}
              onDonationChange={(isDonation) => onChange({ isDonation, price: isDonation ? 0 : state.price ?? 0 })}
              onRentalChange={(isRental) => onChange({ isRental })}
              onAuctionChange={(isAuction) => onChange({ isAuction })}
              labels={{
                price: s.createWizard.pricingStep.price,
                currency: s.createWizard.pricingStep.currency,
                negotiable: s.createWizard.pricingStep.negotiable,
                isRental: s.createWizard.pricingStep.isRental,
                isAuction: s.createWizard.pricingStep.isAuction,
                isDonation: s.createWizard.pricingStep.isDonation
              }}
              error={priceError}
            />
          </div>
        </>
      )}

      {showLocation && (
        <>
          <Divider />
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{s.createWizard.locationStep.title}</h4>
            <LocationPicker
              locations={locations}
              locationId={state.locationId}
              building={state.building}
              city={state.city}
              country={state.country}
              pickupAvailable={!!state.pickupAvailable}
              shippingAvailable={!!state.shippingAvailable}
              onLocationChange={(locationId) => onChange({ locationId })}
              onBuildingChange={(building) => onChange({ building })}
              onCityChange={(city) => onChange({ city })}
              onCountryChange={(country) => onChange({ country })}
              onPickupChange={(pickupAvailable) => onChange({ pickupAvailable })}
              onShippingChange={(shippingAvailable) => onChange({ shippingAvailable })}
              labels={{
                selectLocation: s.createWizard.locationStep.selectLocation,
                building: s.createWizard.locationStep.building,
                city: s.createWizard.locationStep.city,
                country: s.createWizard.locationStep.country,
                pickupAvailable: s.createWizard.locationStep.pickupAvailable,
                shippingAvailable: s.createWizard.locationStep.shippingAvailable
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ListingForm;
