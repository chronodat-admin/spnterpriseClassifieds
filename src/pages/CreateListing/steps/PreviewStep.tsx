import * as React from 'react';
import { Text, Badge, Image, makeStyles, tokens } from '@fluentui/react-components';
import { useCategories, useLocalization } from '../../../hooks';
import { ICreateListingWizardState } from '../../../interfaces';
import { formatCurrency } from '../../../utilities';
import styles from './PreviewStep.module.scss';

const useStyles = makeStyles({
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalL },
  images: { display: 'flex', gap: tokens.spacingHorizontalS, flexWrap: 'wrap' },
  thumb: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: tokens.borderRadiusSmall }
});

export interface IPreviewStepProps {
  state: ICreateListingWizardState;
}

export const PreviewStep: React.FC<IPreviewStepProps> = ({ state }) => {
  const classes = useStyles();
  const { getCategoryById } = useCategories();
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const category = state.categoryId ? getCategoryById(state.categoryId) : undefined;

  const priceLabel = state.isDonation
    ? s.listings.donation
    : state.price === 0
      ? s.listings.free
      : formatCurrency(state.price, state.currency);

  return (
    <div className={styles.previewStep}>
      <h3>{s.createWizard.reviewStep.title}</h3>
      <Text>{s.createWizard.reviewStep.description}</Text>

      <div className={classes.grid}>
        <div>
          <Text weight="semibold" size={500}>{state.title}</Text>
          <Text>{priceLabel}</Text>
          <div style={{ marginTop: 8 }}>
            {category && <Badge>{category.title}</Badge>}
            <Badge>{state.condition}</Badge>
            <Badge>{state.listingType}</Badge>
          </div>
          <Text style={{ marginTop: 16 }}>{state.description}</Text>
          {state.keywords && <Text size={200}>Keywords: {state.keywords}</Text>}
        </div>
        <div>
          <Text weight="semibold">{s.createWizard.imagesStep.title}</Text>
          <div className={classes.images}>
            {state.images.map(img => (
              <Image key={img.id} className={classes.thumb} src={img.previewUrl} alt="" />
            ))}
          </div>
          <Text weight="semibold" style={{ marginTop: 16 }}>{s.createWizard.locationStep.title}</Text>
          <Text>{state.building} {state.city} {state.country}</Text>
          {state.pickupAvailable && <Badge>{s.createWizard.locationStep.pickupAvailable}</Badge>}
          {state.shippingAvailable && <Badge>{s.createWizard.locationStep.shippingAvailable}</Badge>}
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
