import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { ImageRegular } from '@fluentui/react-icons';
import { IListing } from '../../interfaces';
import { useStrings } from '../../hooks';
import { formatCurrency } from '../../utilities';

const useStyles = makeStyles({
  item: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground3,
    ':hover': {
      opacity: 0.9
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '2px'
    }
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacingVerticalS,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    color: '#fff'
  },
  noImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: tokens.colorNeutralForeground4,
    fontSize: '48px'
  }
});

export interface IListingGalleryItemProps {
  listing: IListing;
  onClick?: (listing: IListing) => void;
  locale?: string;
}

export const ListingGalleryItem: React.FC<IListingGalleryItemProps> = ({
  listing,
  onClick,
  locale = 'en-US'
}) => {
  const strings = useStrings();
  const styles = useStyles();

  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls[0];
  const priceDisplay = listing.isDonation
    ? strings.listings.free
    : formatCurrency(listing.price, listing.currency, locale);

  const handleClick = (): void => onClick?.(listing);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(listing);
    }
  };

  return (
    <div
      className={styles.item}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${listing.title}, ${priceDisplay}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className={styles.image} loading="lazy" />
      ) : (
        <div className={styles.noImage} aria-hidden="true">
          <ImageRegular />
        </div>
      )}
      <div className={styles.overlay}>
        <Text weight="semibold" size={200} style={{ color: '#fff' }} block>
          {listing.title}
        </Text>
        <Text size={100} style={{ color: 'rgba(255,255,255,0.85)' }}>
          {priceDisplay}
        </Text>
      </div>
    </div>
  );
};
