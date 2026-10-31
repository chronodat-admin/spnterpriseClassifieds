import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import { WizardLayout } from '../../layouts';
import { WizardStepper } from '../../controls';
import {
  CategoryStep,
  ImagesStep,
  PricingStep,
  LocationStep,
  PreviewStep,
  PublishStep
} from './steps';
import { useLocalization, useNotifications, useCategories } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ImageService } from '../../services/ImageService';
import { ROUTES, LISTING_STATUS, LISTING_TYPE, CONDITION_VALUES } from '../../constants';
import { ICreateListingWizardState, IListing, IListingImageUpload } from '../../interfaces';
import { validateListingTitle, validateListingDescription, validatePrice } from '../../utilities';
import styles from './CreateListingWizard.module.scss';

interface IListingService {
  create(listing: Partial<IListing>): Promise<IListing>;
  update(id: number, listing: Partial<IListing>): Promise<IListing>;
  publish(id: number, requiresApproval?: boolean): Promise<IListing>;
  getById(id: number): Promise<IListing | undefined>;
}

const INITIAL_STATE: ICreateListingWizardState = {
  step: 0,
  title: '',
  description: '',
  keywords: '',
  tags: [],
  images: [],
  price: 0,
  currency: 'USD',
  isNegotiable: false,
  isRental: false,
  isAuction: false,
  isDonation: false,
  listingType: LISTING_TYPE.Sell,
  condition: CONDITION_VALUES.Good,
  pickupAvailable: true,
  shippingAvailable: false,
  status: LISTING_STATUS.Pending
};

const STEP_COUNT = 6;

export const CreateListingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editId = id ? Number(id) : undefined;
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { success, error: showError } = useNotifications();
  const { getCategoryById } = useCategories();

  const [state, setState] = React.useState<ICreateListingWizardState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const steps = [
    { key: 'category', label: s.createWizard.steps.category },
    { key: 'images', label: s.createWizard.steps.images },
    { key: 'pricing', label: s.createWizard.steps.pricing },
    { key: 'location', label: s.createWizard.steps.location },
    { key: 'preview', label: s.createWizard.steps.review },
    { key: 'publish', label: s.createWizard.reviewStep.publish }
  ];

  React.useEffect(() => {
    if (!editId) return;
    ServiceContainer.getInstance()
      .resolve<IListingService>(SERVICE_KEYS.ListingService)
      .getById(editId)
      .then(listing => {
        if (!listing) return;
        setState(prev => ({
          ...prev,
          categoryId: listing.categoryId,
          title: listing.title,
          description: listing.description,
          keywords: listing.keywords ?? '',
          tags: listing.tags,
          price: listing.price,
          currency: listing.currency,
          isNegotiable: listing.isNegotiable,
          isRental: listing.isRental,
          isAuction: listing.isAuction,
          isDonation: listing.isDonation,
          listingType: listing.listingType,
          condition: listing.condition,
          locationId: listing.locationId,
          building: listing.building,
          city: listing.city,
          country: listing.country,
          pickupAvailable: listing.pickupAvailable,
          shippingAvailable: listing.shippingAvailable,
          status: listing.status,
          images: listing.imageUrls.map((url, i) => ({
            id: `existing-${i}`,
            url,
            previewUrl: url,
            sortOrder: i,
            isPrimary: i === 0
          }))
        }));
      })
      .catch(() => undefined);
  }, [editId]);

  const updateState = (partial: Partial<ICreateListingWizardState>): void => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!state.categoryId) newErrors.categoryId = s.createWizard.validation.categoryRequired;
      const titleErr = validateListingTitle(state.title);
      if (titleErr) newErrors.title = titleErr;
      const descErr = validateListingDescription(state.description);
      if (descErr) newErrors.description = descErr;
    }
    if (step === 1 && state.images.length === 0) {
      newErrors.images = s.createWizard.validation.imagesRequired;
    }
    if (step === 2) {
      const priceErr = validatePrice(state.price, state.isDonation);
      if (priceErr) newErrors.price = priceErr;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const syncImages = async (listingId: number, images: IListingImageUpload[]): Promise<{ imageUrls: string[]; thumbnailUrl?: string }> => {
    const imageService = ServiceContainer.getInstance().resolve<ImageService>(SERVICE_KEYS.ImageService);
    const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const imageUrls: string[] = [];

    for (let index = 0; index < ordered.length; index++) {
      const image = ordered[index];
      if (image.file) {
        imageUrls.push(await imageService.upload(listingId, image.file, index));
      } else {
        const existing = image.url ?? image.previewUrl;
        if (existing && !existing.startsWith('blob:')) {
          imageUrls.push(existing);
        }
      }
    }

    const primaryIndex = Math.max(0, ordered.findIndex(image => image.isPrimary));
    return {
      imageUrls,
      thumbnailUrl: imageUrls[primaryIndex] ?? imageUrls[0]
    };
  };

  const buildListingPayload = (): Partial<IListing> => ({
    categoryId: state.categoryId,
    categoryName: state.categoryId ? getCategoryById(state.categoryId)?.title : undefined,
    title: state.title,
    description: state.description,
    keywords: state.keywords,
    tags: state.tags,
    price: state.price,
    currency: state.currency,
    isNegotiable: state.isNegotiable,
    isRental: state.isRental,
    isAuction: state.isAuction,
    isDonation: state.isDonation,
    listingType: state.listingType,
    condition: state.condition,
    locationId: state.locationId,
    building: state.building,
    city: state.city,
    country: state.country,
    pickupAvailable: state.pickupAvailable,
    shippingAvailable: state.shippingAvailable,
    status: state.status,
    imageUrls: state.images
      .map(image => image.url ?? (!image.file ? image.previewUrl : undefined))
      .filter((url): url is string => typeof url === 'string' && !url.startsWith('blob:')),
    thumbnailUrl: state.images.find(image => image.isPrimary && image.url && !image.url.startsWith('blob:'))?.url
  });

  const handleNext = (): void => {
    if (!validateStep(state.step)) return;
    updateState({ step: Math.min(state.step + 1, STEP_COUNT - 1) });
  };

  const handleBack = (): void => {
    updateState({ step: Math.max(state.step - 1, 0) });
  };

  const handleSaveDraft = async (): Promise<void> => {
    setSaving(true);
    try {
      const service = ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
      const payload = { ...buildListingPayload(), status: LISTING_STATUS.Draft };
      const listing = editId ? await service.update(editId, payload) : await service.create(payload);
      const images = await syncImages(listing.id, state.images);
      if (images.imageUrls.length > 0) {
        await service.update(listing.id, images);
      }
      success(s.createWizard.success.draftSaved);
      navigate(ROUTES.MyListings);
    } catch (err) {
      showError(s.errors.saveFailed, err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (): Promise<void> => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
    setSaving(true);
    try {
      const service = ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
      const category = state.categoryId ? getCategoryById(state.categoryId) : undefined;
      const requiresApproval = category?.approvalRequired ?? false;
      let listing: IListing;

      if (editId) {
        listing = await service.update(editId, buildListingPayload());
      } else {
        listing = await service.create(buildListingPayload());
      }

      const images = await syncImages(listing.id, state.images);
      if (images.imageUrls.length > 0) {
        listing = await service.update(listing.id, images);
      }

      if (state.status !== LISTING_STATUS.Draft) {
        listing = await service.publish(listing.id, requiresApproval);
      }

      success(state.status === LISTING_STATUS.Draft ? s.createWizard.success.draftSaved : s.createWizard.success.submitted);
      navigate(`${ROUTES.Listings}/${listing.id}`);
    } catch (err) {
      showError(s.errors.saveFailed, err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const renderStep = (): React.ReactNode => {
    switch (state.step) {
      case 0: return <CategoryStep state={state} onChange={updateState} errors={errors} />;
      case 1: return <ImagesStep state={state} onChange={updateState} error={errors.images} />;
      case 2: return <PricingStep state={state} onChange={updateState} />;
      case 3: return <LocationStep state={state} onChange={updateState} />;
      case 4: return <PreviewStep state={state} />;
      case 5: return <PublishStep state={state} onChange={updateState} />;
      default: return null;
    }
  };

  return (
    <div className={styles.wizard}>
      <h2>{editId ? s.createWizard.editTitle : s.createWizard.title}</h2>
      <WizardLayout
        stepper={<WizardStepper steps={steps} currentStep={state.step} />}
        footer={
          <>
            <div>
              {state.step > 0 && (
                <Button appearance="secondary" onClick={handleBack}>{s.common.back}</Button>
              )}
            </div>
            <div className={styles.footerActions}>
              <Button appearance="subtle" onClick={handleSaveDraft} disabled={saving}>
                {s.createWizard.reviewStep.saveDraft}
              </Button>
              {state.step < STEP_COUNT - 1 ? (
                <Button appearance="primary" onClick={handleNext}>{s.common.next}</Button>
              ) : (
                <Button appearance="primary" onClick={handlePublish} disabled={saving}>
                  {s.createWizard.reviewStep.publish}
                </Button>
              )}
            </div>
          </>
        }
      >
        {renderStep()}
      </WizardLayout>
    </div>
  );
};

export default CreateListingWizard;
