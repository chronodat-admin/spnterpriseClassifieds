import * as React from 'react';
import {
  Input,
  Dropdown,
  Option,
  Field,
  Checkbox,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { CURRENCY_CODES } from '../../constants';
import { useStrings } from '../../hooks';
import { validatePrice } from '../../utilities';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'flex-start'
  },
  priceInput: {
    flex: 1
  },
  currencySelect: {
    minWidth: '100px'
  },
  flags: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalS
  }
});

export interface IPriceInputProps {
  price: number;
  currency: string;
  isNegotiable?: boolean;
  isDonation?: boolean;
  isRental?: boolean;
  isAuction?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: string) => void;
  onNegotiableChange?: (isNegotiable: boolean) => void;
  onDonationChange?: (isDonation: boolean) => void;
  onRentalChange?: (isRental: boolean) => void;
  onAuctionChange?: (isAuction: boolean) => void;
  onValidationChange?: (error: string | undefined) => void;
  labels?: {
    price?: string;
    currency?: string;
    negotiable?: string;
    isRental?: string;
    isAuction?: string;
    isDonation?: string;
  };
}

export const PriceInput: React.FC<IPriceInputProps> = ({
  price,
  currency,
  isNegotiable = false,
  isDonation = false,
  isRental = false,
  isAuction = false,
  disabled = false,
  required = false,
  error,
  onPriceChange,
  onCurrencyChange,
  onNegotiableChange,
  onDonationChange,
  onRentalChange,
  onAuctionChange,
  onValidationChange,
  labels
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const [validationError, setValidationError] = React.useState<string | undefined>();

  React.useEffect(() => {
    const validationErr = validatePrice(price, isDonation);
    setValidationError(validationErr);
    onValidationChange?.(validationErr);
  }, [price, isDonation, onValidationChange]);

  const handlePriceChange = (_: unknown, data: { value: string }): void => {
    const parsed = parseFloat(data.value);
    onPriceChange(isNaN(parsed) ? 0 : parsed);
  };

  const displayError = error ?? validationError;

  return (
    <Field
      label={labels?.price ?? strings.createWizard.pricingStep.price}
      required={required && !isDonation}
      validationMessage={displayError}
      validationState={displayError ? 'error' : 'none'}
    >
      <div className={styles.root}>
        <Input
          className={styles.priceInput}
          type="number"
          min={0}
          step={0.01}
          value={isDonation ? '0' : String(price)}
          onChange={handlePriceChange}
          disabled={disabled || isDonation}
          aria-label={labels?.price ?? strings.createWizard.pricingStep.price}
          contentBefore={<span aria-hidden="true">{isDonation ? strings.listings.free : ''}</span>}
        />
        <Dropdown
          className={styles.currencySelect}
          value={currency}
          selectedOptions={[currency]}
          onOptionSelect={(_, data) => {
            if (data.optionValue) onCurrencyChange(data.optionValue);
          }}
          disabled={disabled || isDonation}
          aria-label={labels?.currency ?? strings.createWizard.pricingStep.currency}
        >
          {CURRENCY_CODES.map(code => (
            <Option key={code} value={code} text={code}>{code}</Option>
          ))}
        </Dropdown>
      </div>
      <div className={styles.flags}>
        {onNegotiableChange && (
          <Checkbox
            label={labels?.negotiable ?? strings.createWizard.pricingStep.negotiable}
            checked={isNegotiable}
            onChange={(_, data) => onNegotiableChange(!!data.checked)}
            disabled={disabled}
          />
        )}
        {onDonationChange && (
          <Checkbox
            label={labels?.isDonation ?? strings.createWizard.pricingStep.isDonation}
            checked={isDonation}
            onChange={(_, data) => onDonationChange(!!data.checked)}
            disabled={disabled}
          />
        )}
        {onRentalChange && (
          <Checkbox
            label={labels?.isRental ?? strings.createWizard.pricingStep.isRental}
            checked={isRental}
            onChange={(_, data) => onRentalChange(!!data.checked)}
            disabled={disabled}
          />
        )}
        {onAuctionChange && (
          <Checkbox
            label={labels?.isAuction ?? strings.createWizard.pricingStep.isAuction}
            checked={isAuction}
            onChange={(_, data) => onAuctionChange(!!data.checked)}
            disabled={disabled}
          />
        )}
      </div>
    </Field>
  );
};
