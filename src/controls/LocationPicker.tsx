import * as React from 'react';
import { Field, Input, Dropdown, Option, Checkbox } from '@fluentui/react-components';
import { ILocation } from '../interfaces';

export interface ILocationPickerProps {
  locations: ILocation[];
  locationId?: number;
  building?: string;
  city?: string;
  country?: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  onLocationChange: (locationId: number | undefined) => void;
  onBuildingChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPickupChange: (value: boolean) => void;
  onShippingChange: (value: boolean) => void;
  labels: {
    selectLocation: string;
    building: string;
    city: string;
    country: string;
    pickupAvailable: string;
    shippingAvailable: string;
  };
}

export const LocationPicker: React.FC<ILocationPickerProps> = ({
  locations,
  locationId,
  building,
  city,
  country,
  pickupAvailable,
  shippingAvailable,
  onLocationChange,
  onBuildingChange,
  onCityChange,
  onCountryChange,
  onPickupChange,
  onShippingChange,
  labels
}) => {
  const selected = locations.find(l => l.id === locationId);
  return (
    <>
      <Field label={labels.selectLocation}>
        <Dropdown
          value={selected?.title ?? ''}
          selectedOptions={locationId ? [String(locationId)] : []}
          onOptionSelect={(_, d) => onLocationChange(d.optionValue ? Number(d.optionValue) : undefined)}
        >
          <Option value="">—</Option>
          {locations.map(loc => (
            <Option key={loc.id} value={String(loc.id)} text={loc.title}>{loc.title}</Option>
          ))}
        </Dropdown>
      </Field>
      <Field label={labels.building}>
        <Input value={building ?? ''} onChange={(_, d) => onBuildingChange(d.value)} />
      </Field>
      <Field label={labels.city}>
        <Input value={city ?? ''} onChange={(_, d) => onCityChange(d.value)} />
      </Field>
      <Field label={labels.country}>
        <Input value={country ?? ''} onChange={(_, d) => onCountryChange(d.value)} />
      </Field>
      <Checkbox label={labels.pickupAvailable} checked={pickupAvailable} onChange={(_, d) => onPickupChange(!!d.checked)} />
      <Checkbox label={labels.shippingAvailable} checked={shippingAvailable} onChange={(_, d) => onShippingChange(!!d.checked)} />
    </>
  );
};
