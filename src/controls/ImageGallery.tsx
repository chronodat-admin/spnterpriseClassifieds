import * as React from 'react';
import { Image, Button, makeStyles, tokens } from '@fluentui/react-components';
import { ChevronLeft24Regular, ChevronRight24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  main: { position: 'relative', aspectRatio: '16/10', backgroundColor: tokens.colorNeutralBackground3, borderRadius: tokens.borderRadiusMedium, overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%', objectFit: 'contain' },
  thumbs: { display: 'flex', gap: tokens.spacingHorizontalXS, overflowX: 'auto' },
  thumb: { width: '72px', height: '72px', cursor: 'pointer', border: '2px solid transparent', borderRadius: tokens.borderRadiusSmall, overflow: 'hidden', flexShrink: 0 },
  thumbActive: { border: `2px solid ${tokens.colorBrandStroke1}` },
  nav: { position: 'absolute', top: '50%', transform: 'translateY(-50%)' }
});

export interface IImageGalleryProps {
  images: string[];
  alt?: string;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<IImageGalleryProps> = ({ images, alt = 'Listing image', onImageClick }) => {
  const classes = useStyles();
  const [active, setActive] = React.useState(0);

  if (images.length === 0) {
    return <div className={classes.main} aria-label="No images" />;
  }

  const prev = (): void => setActive(i => (i > 0 ? i - 1 : images.length - 1));
  const next = (): void => setActive(i => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className={classes.root}>
      <div className={classes.main}>
        <Image
          className={classes.mainImage}
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          onClick={() => onImageClick?.(active)}
        />
        {images.length > 1 && (
          <>
            <Button className={classes.nav} style={{ left: 8 }} icon={<ChevronLeft24Regular />} appearance="secondary" onClick={prev} />
            <Button className={classes.nav} style={{ right: 8 }} icon={<ChevronRight24Regular />} appearance="secondary" onClick={next} />
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={classes.thumbs}>
          {images.map((url, i) => (
            <div
              key={i}
              className={`${classes.thumb} ${i === active ? classes.thumbActive : ''}`}
              onClick={() => setActive(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActive(i)}
            >
              <Image src={url} alt="" fit="cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
