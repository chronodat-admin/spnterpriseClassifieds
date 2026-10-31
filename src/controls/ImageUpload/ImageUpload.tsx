import * as React from 'react';
import {
  Text,
  Button,
  Tooltip,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  ArrowUploadRegular,
  DeleteRegular,
  ArrowSortRegular,
  StarRegular,
  StarFilled
} from '@fluentui/react-icons';
import { IMAGE_MAX_SIZE_MB, MAX_IMAGES_PER_LISTING } from '../../constants';
import { IListingImageUpload } from '../../interfaces';
import { useStrings } from '../../hooks';
import { generateId } from '../../utilities';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  },
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
    ':hover': {
      borderTopColor: tokens.colorBrandStroke1,
      backgroundColor: tokens.colorNeutralBackground1Hover
    }
  },
  dropZoneActive: {
    borderTopColor: tokens.colorBrandStroke1,
    backgroundColor: tokens.colorBrandBackground2
  },
  dropZoneDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: tokens.spacingHorizontalS
  },
  imageItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    border: `1px solid ${tokens.colorNeutralStroke2}`
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageActions: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    display: 'flex',
    gap: tokens.spacingHorizontalXXS
  },
  primaryBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '2px 6px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: '10px',
    fontWeight: 600
  },
  dragHandle: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    cursor: 'grab'
  }
});

export interface IImageUploadProps {
  images: IListingImageUpload[];
  onChange: (images: IListingImageUpload[]) => void;
  maxImages?: number;
  maxSizeMb?: number;
  disabled?: boolean;
}

export const ImageUpload: React.FC<IImageUploadProps> = ({
  images,
  onChange,
  maxImages = MAX_IMAGES_PER_LISTING,
  maxSizeMb = IMAGE_MAX_SIZE_MB,
  disabled = false
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const canAddMore = images.length < maxImages;

  const processFiles = (files: FileList | File[]): void => {
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;
    const toAdd = fileArray.slice(0, remaining);

    const newImages: IListingImageUpload[] = toAdd
      .filter(file => file.size <= maxSizeMb * 1024 * 1024 && file.type.startsWith('image/'))
      .map((file, index) => ({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        sortOrder: images.length + index,
        isPrimary: images.length === 0 && index === 0
      }));

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  };

  const handleDrop = (event: React.DragEvent): void => {
    event.preventDefault();
    setDragActive(false);
    if (disabled || !canAddMore) return;
    processFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent): void => {
    event.preventDefault();
    if (!disabled && canAddMore) setDragActive(true);
  };

  const handleRemove = (id: string): void => {
    const updated = images.filter(img => img.id !== id);
    if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const handleSetPrimary = (id: string): void => {
    onChange(images.map(img => ({ ...img, isPrimary: img.id === id })));
  };

  const handleReorder = (fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const handleItemDragStart = (index: number): void => {
    setDragIndex(index);
  };

  const handleItemDrop = (targetIndex: number): void => {
    if (dragIndex !== null) {
      handleReorder(dragIndex, targetIndex);
      setDragIndex(null);
    }
  };

  return (
    <div className={styles.root}>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''} ${(!canAddMore || disabled) ? styles.dropZoneDisabled : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onClick={() => { if (canAddMore && !disabled) inputRef.current?.click(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={strings.createWizard.imagesStep.uploadImages}
        aria-disabled={disabled || !canAddMore}
      >
        <ArrowUploadRegular style={{ fontSize: 32 }} aria-hidden="true" />
        <Text weight="semibold">{strings.createWizard.imagesStep.dragDrop}</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {strings.createWizard.imagesStep.maxImages.replace('{max}', String(maxImages))}
        </Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {strings.createWizard.imagesStep.maxSize.replace('{size}', String(maxSizeMb))}
        </Text>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={disabled || !canAddMore}
          onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
          aria-hidden="true"
        />
      </div>

      {images.length > 0 && (
        <div className={styles.imageGrid} role="list" aria-label={strings.createWizard.imagesStep.reorderImages}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className={styles.imageItem}
              role="listitem"
              draggable={!disabled}
              onDragStart={() => handleItemDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleItemDrop(index)}
            >
              <img
                src={image.previewUrl}
                alt={image.isPrimary ? strings.listings.primaryImage : `Image ${index + 1}`}
                className={styles.imagePreview}
              />
              {image.isPrimary && (
                <span className={styles.primaryBadge}>{strings.listings.primaryImage}</span>
              )}
              <div className={styles.dragHandle} aria-hidden="true">
                <ArrowSortRegular />
              </div>
              <div className={styles.imageActions}>
                {!image.isPrimary && (
                  <Tooltip content={strings.createWizard.imagesStep.setPrimary} relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<StarRegular />}
                      onClick={() => handleSetPrimary(image.id)}
                      aria-label={strings.createWizard.imagesStep.setPrimary}
                      disabled={disabled}
                    />
                  </Tooltip>
                )}
                {image.isPrimary && (
                  <Button appearance="subtle" size="small" icon={<StarFilled />} disabled aria-label={strings.listings.primaryImage} />
                )}
                <Tooltip content={strings.createWizard.imagesStep.removeImage} relationship="label">
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<DeleteRegular />}
                    onClick={() => handleRemove(image.id)}
                    aria-label={strings.createWizard.imagesStep.removeImage}
                    disabled={disabled}
                  />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
