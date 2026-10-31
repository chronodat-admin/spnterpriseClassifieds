import * as React from 'react';
import { Text } from '@fluentui/react-components';
import { PriceInput } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { ICreateListingWizardState } from '../../../interfaces';
import { validatePrice } from '../../../utilities';
import styles from './PricingStep.module.scss';

export interface IPricingStepProps {
  state: ICreateListingWizardState;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
}

export const PricingStep: React.FC<IPricingStepProps> = ({ state, onChange }) => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const priceError = validatePrice(state.price, state.isDonation);

  return (
    <div className={styles.pricingStep}>
      <h3>{s.createWizard.pricingStep.title}</h3>
      <PriceInput
        price={state.price}
        currency={state.currency}
        isNegotiable={state.isNegotiable}
        isDonation={state.isDonation}
        isRental={state.isRental}
        isAuction={state.isAuction}
        onPriceChange={(price) => onChange({ price })}
        onCurrencyChange={(currency) => onChange({ currency })}
        onNegotiableChange={(isNegotiable) => onChange({ isNegotiable })}
        onDonationChange={(isDonation) => onChange({ isDonation, price: isDonation ? 0 : state.price })}
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
      {priceError && <Text style={{ color: 'var(--colorPaletteRedForeground1)' }}>{priceError}</Text>}
    </div>
  );
};

export default PricingStep;
