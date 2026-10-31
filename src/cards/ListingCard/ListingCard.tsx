import * as React from 'react';
import { Badge, Text } from '@fluentui/react-components';
import { ImageRegular, EyeRegular, HeartRegular } from '@fluentui/react-icons';
import { IListing } from '../../interfaces';
import { StatusBadge } from '../../controls/StatusBadge/StatusBadge';
import { useStrings } from '../../hooks';
import { formatCurrency, formatRelativeDate, truncateText } from '../../utilities';
import styles from './ListingCard.module.scss';

export interface IListingCardProps {
  listing: IListing;
  onClick?: (listing: IListing) => void;
  onKeyDown?: (event: React.KeyboardEvent, listing: IListing) => void;
  locale?: string;
}

export const ListingCard: React.FC<IListingCardProps> = ({
  listing,
  onClick,
  onKeyDown,
  locale = 'en-US'
}) => {
  const strings = useStrings();

  const handleClick = (): void => {
    onClick?.(listing);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(listing);
    }
    onKeyDown?.(event, listing);
  };

  const priceDisplay = listing.isDonation
    ? strings.listings.free
    : listing.price > 0
      ? formatCurrency(listing.price, listing.currency, locale)
      : strings.listings.negotiable;

  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls[0];

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${listing.title}, ${priceDisplay}`}
    >
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage} aria-hidden="true">
            <ImageRegular />
          </div>
        )}
        {listing.isFeatured && (
          <Badge className={styles.featuredBadge} appearance="filled" color="brand" size="small">
            {strings.listings.featured}
          </Badge>
        )}
        {listing.status !== 'Approved' && (
          <div className={styles.statusBadge}>
            <StatusBadge status={listing.status} size="small" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{truncateText(listing.title, 80)}</h3>
        <span className={styles.price}>{priceDisplay}</span>
        <div className={styles.meta}>
          <Text size={200}>{listing.categoryName ?? strings.listings.category}</Text>
          <div className={styles.stats}>
            <span className={styles.stat} aria-label={`${listing.viewCount} ${strings.listings.views}`}>
              <EyeRegular aria-hidden="true" />
              {listing.viewCount}
            </span>
            <span className={styles.stat} aria-label={`${listing.favoriteCount} ${strings.listings.favorites}`}>
              <HeartRegular aria-hidden="true" />
              {listing.favoriteCount}
            </span>
          </div>
        </div>
        {listing.publishedOn && (
          <Text size={100} style={{ color: 'var(--colorNeutralForeground4)' }}>
            {formatRelativeDate(listing.publishedOn)}
          </Text>
        )}
      </div>
    </article>
  );
};
