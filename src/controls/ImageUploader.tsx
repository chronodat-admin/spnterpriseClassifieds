import * as React from 'react';
import { Button, Text, makeStyles, tokens, Image } from '@fluentui/react-components';
import { ArrowUpload24Regular, Delete24Regular, Star24Regular } from '@fluentui/react-icons';
import { IListingImageUpload } from '../interfaces';
import { MAX_IMAGES_PER_LISTING, IMAGE_MAX_SIZE_MB } from '../constants';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: tokens.spacingHorizontalS },
  item: { position: 'relative', aspectRatio: '1', borderRadius: tokens.borderRadiusMedium, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke2}` },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  actions: { position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: tokens.spacingHorizontalXXS },
  dropzone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    cursor: 'pointer'
  }
});

export interface IImageUploaderProps {
  images: IListingImageUpload[];
  onChange: (images: IListingImageUpload[]) => void;
  maxImages?: number;
  labels?: { upload: string; dragDrop: string; setPrimary: string; remove: string };
}

export const ImageUploader: React.FC<IImageUploaderProps> = ({
  images,
  onChange,
  maxImages = MAX_IMAGES_PER_LISTING,
  labels = { upload: 'Upload images', dragDrop: 'Drag and drop or click to upload', setPrimary: 'Set primary', remove: 'Remove' }
}) => {
  const classes = useStyles();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null): void => {
    if (!files) return;
    const remaining = maxImages - images.length;
    const newImages: IListingImageUpload[] = [];
    Array.from(files).slice(0, remaining).forEach((file, i) => {
      if (file.size > IMAGE_MAX_SIZE_MB * 1024 * 1024) return;
      newImages.push({
        id: `${Date.now()}-${i}`,
        file,
        previewUrl: URL.createObjectURL(file),
        sortOrder: images.length + i,
        isPrimary: images.length === 0 && i === 0
      });
    });
    onChange([...images, ...newImages]);
  };

  const remove = (id: string): void => {
    onChange(images.filter(img => img.id !== id));
  };

  const setPrimary = (id: string): void => {
    onChange(images.map(img => ({ ...img, isPrimary: img.id === id })));
  };

  return (
    <div className={classes.root}>
      {images.length < maxImages && (
        <div
          className={classes.dropzone}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
        >
          <ArrowUpload24Regular fontSize={32} />
          <Text>{labels.dragDrop}</Text>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}
      <div className={classes.grid}>
        {images.map(img => (
          <div key={img.id} className={classes.item}>
            <Image className={classes.img} src={img.previewUrl} alt="" />
            <div className={classes.actions}>
              {!img.isPrimary && (
                <Button size="small" icon={<Star24Regular />} title={labels.setPrimary} onClick={() => setPrimary(img.id)} />
              )}
              <Button size="small" icon={<Delete24Regular />} title={labels.remove} onClick={() => remove(img.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
