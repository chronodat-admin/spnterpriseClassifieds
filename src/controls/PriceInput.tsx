import * as React from 'react';
import { Field, Input, Checkbox, Dropdown, Option } from '@fluentui/react-components';
import { CURRENCY_CODES } from '../constants';

export interface IPriceInputProps {
  price: number;
  currency: string;
  isNegotiable: boolean;
  isDonation: boolean;
  isRental: boolean;
  isAuction: boolean;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: string) => void;
  onNegotiableChange: (value: boolean) => void;
  onDonationChange: (value: boolean) => void;
  onRentalChange: (value: boolean) => void;
  onAuctionChange: (value: boolean) => void;
  labels: {
    price: string;
    currency: string;
    negotiable: string;
    isRental: string;
    isAuction: string;
    isDonation: string;
  };
  error?: string;
}

export const PriceInput: React.FC<IPriceInputProps> = ({
  price,
  currency,
  isNegotiable,
  isDonation,
  isRental,
  isAuction,
  onPriceChange,
  onCurrencyChange,
  onNegotiableChange,
  onDonationChange,
  onRentalChange,
  onAuctionChange,
  labels,
  error
}) => (
  <>
    <Field label={labels.currency}>
      <Dropdown
        selectedOptions={[currency]}
        onOptionSelect={(_, d) => onCurrencyChange(d.optionValue ?? 'USD')}
      >
        {CURRENCY_CODES.map(c => (
          <Option key={c} value={c} text={c}>{c}</Option>
        ))}
      </Dropdown>
    </Field>
    {!isDonation && (
      <Field label={labels.price} validationMessage={error} validationState={error ? 'error' : 'none'}>
        <Input
          type="number"
          min={0}
          value={String(price)}
          onChange={(_, d) => onPriceChange(Number(d.value) || 0)}
        />
      </Field>
    )}
    <Checkbox label={labels.negotiable} checked={isNegotiable} onChange={(_, d) => onNegotiableChange(!!d.checked)} />
    <Checkbox label={labels.isDonation} checked={isDonation} onChange={(_, d) => onDonationChange(!!d.checked)} />
    <Checkbox label={labels.isRental} checked={isRental} onChange={(_, d) => onRentalChange(!!d.checked)} />
    <Checkbox label={labels.isAuction} checked={isAuction} onChange={(_, d) => onAuctionChange(!!d.checked)} />
  </>
);
