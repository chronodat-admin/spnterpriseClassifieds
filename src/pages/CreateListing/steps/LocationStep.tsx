import * as React from 'react';
import { LocationPicker } from '../../../controls';
import { useLocalization, useAppContext } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { ICreateListingWizardState, ILocation } from '../../../interfaces';
import styles from './LocationStep.module.scss';

export interface ILocationStepProps {
  state: ICreateListingWizardState;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
}

export const LocationStep: React.FC<ILocationStepProps> = ({ state, onChange }) => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { serviceContainerReady } = useAppContext();
  const [locations, setLocations] = React.useState<ILocation[]>([]);

  React.useEffect(() => {
    if (!serviceContainerReady) return;
    ServiceContainer.getInstance()
      .resolve<{ getAll(): Promise<ILocation[]> }>(SERVICE_KEYS.LocationRepository)
      .getAll()
      .then(setLocations)
      .catch(() => undefined);
  }, [serviceContainerReady]);

  return (
    <div className={styles.locationStep}>
      <h3>{s.createWizard.locationStep.title}</h3>
      <LocationPicker
        locations={locations}
        locationId={state.locationId}
        building={state.building}
        city={state.city}
        country={state.country}
        pickupAvailable={state.pickupAvailable}
        shippingAvailable={state.shippingAvailable}
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
  );
};

export default LocationStep;
