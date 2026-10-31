import * as React from 'react';
import { Text } from '@fluentui/react-components';
import { ImageUploader } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { ICreateListingWizardState } from '../../../interfaces';
import styles from './ImagesStep.module.scss';

export interface IImagesStepProps {
  state: ICreateListingWizardState;
  onChange: (partial: Partial<ICreateListingWizardState>) => void;
  error?: string;
}

export const ImagesStep: React.FC<IImagesStepProps> = ({ state, onChange, error }) => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;

  return (
    <div className={styles.imagesStep}>
      <h3>{s.createWizard.imagesStep.title}</h3>
      <Text>{s.createWizard.imagesStep.description}</Text>
      {error && <Text style={{ color: 'var(--colorPaletteRedForeground1)' }}>{error}</Text>}
      <ImageUploader
        images={state.images}
        onChange={(images) => onChange({ images })}
        labels={{
          upload: s.createWizard.imagesStep.uploadImages,
          dragDrop: s.createWizard.imagesStep.dragDrop,
          setPrimary: s.createWizard.imagesStep.setPrimary,
          remove: s.createWizard.imagesStep.removeImage
        }}
      />
    </div>
  );
};

export default ImagesStep;
