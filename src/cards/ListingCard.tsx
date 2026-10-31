import * as React from 'react';
import { Badge, Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Heart24Filled, Heart24Regular, ImageRegular, Location16Regular } from '@fluentui/react-icons';
import { IListing } from '../interfaces';
import { LISTING_STATUS, LISTING_TYPE } from '../constants';
import { useStrings } from '../hooks';
import { formatCurrency, formatRelativeDate } from '../utilities';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '160ms',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: tokens.shadow8
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '2px'
    }
  },
  media: {
    position: 'relative',
    aspectRatio: '1',
    backgroundColor: tokens.colorNeutralBackground3
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: '40px'
  },
  heart: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4
  },
  pills: {
    position: 'absolute',
    left: '8px',
    top: '8px',
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    maxWidth: '70%'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 12px 14px'
  },
  price: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase500
  },
  title: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '40px'
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorNeutralForeground3
  },
  seller: {
    marginTop: '4px',
    color: tokens.colorNeutralForeground2
  },
  list: {
    flexDirection: 'row',
    minHeight: '148px'
  },
  listMedia: {
    width: '168px',
    minWidth: '168px',
    aspectRatio: 'auto'
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: '72px'
  },
  compactMedia: {
    width: '72px',
    minWidth: '72px',
    height: '72px',
    aspectRatio: 'auto'
  },
  overlay: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '0.04em'
  }
});

export interface IListingCardProps {
  listing: IListing;
  viewMode?: 'grid' | 'list' | 'compact' | 'gallery';
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  labels?: { free: string; donation: string; views: string };
}

function typeLabel(listing: IListing, free: string, donation: string): string | undefined {
  if (listing.isDonation || listing.listingType === LISTING_TYPE.Donate) return donation;
  if (listing.listingType === LISTING_TYPE.Rent || listing.isRental) return 'For rent';
  if (listing.listingType === LISTING_TYPE.Wanted) return 'Wanted';
  if (listing.listingType === LISTING_TYPE.Exchange) return 'Exchange';
  if (listing.listingType === LISTING_TYPE.Buy) return 'Wanted';
  if (listing.price === 0) return free;
  return undefined;
}

export const ListingCard: React.FC<IListingCardProps> = ({
  listing,
  viewMode = 'grid',
  isFavorite,
  onFavoriteToggle,
  onClick
}) => {
  const classes = useStyles();
  const strings = useStrings();
  const s = strings.listings;
  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls?.[0];
  const priceLabel = listing.isDonation
    ? s.donation
    : listing.price === 0
      ? s.free
      : formatCurrency(listing.price, listing.currency);
  const place = listing.city || listing.locationName || listing.building || listing.office;
  const when = formatRelativeDate(listing.publishedOn ?? listing.created);
  const seller = listing.sellerDisplayName || 'Colleague';
  const pill = typeLabel(listing, s.free, s.donation);
  const condition = listing.condition === 'LikeNew' ? s.conditionValues.likeNew : listing.condition;
  const closed = listing.status === LISTING_STATUS.Sold || listing.status === LISTING_STATUS.Reserved;

  const heart = onFavoriteToggle ? (
    <Button
      className={classes.heart}
      appearance="transparent"
      shape="circular"
      icon={isFavorite ? <Heart24Filled /> : <Heart24Regular />}
      aria-label={isFavorite ? s.removeFromFavorites : s.addToFavorites}
      onClick={(event) => {
        event.stopPropagation();
        onFavoriteToggle();
      }}
    />
  ) : null;

  const media = (
    <div className={`${classes.media} ${viewMode === 'list' ? classes.listMedia : ''} ${viewMode === 'compact' ? classes.compactMedia : ''}`}>
      {imageUrl ? (
        <img className={classes.image} src={imageUrl} alt="" loading="lazy" />
      ) : (
        <div className={classes.placeholder} aria-hidden="true"><ImageRegular /></div>
      )}
      {viewMode !== 'compact' && (
        <div className={classes.pills}>
          {listing.isFeatured && <Badge appearance="filled" color="brand" size="small">{s.featured}</Badge>}
          {pill && <Badge appearance="filled" color={pill === s.free || pill === s.donation ? 'success' : 'informative'} size="small">{pill}</Badge>}
        </div>
      )}
      {heart}
      {closed && <div className={classes.overlay}>{listing.status === LISTING_STATUS.Sold ? s.status.sold : s.status.reserved}</div>}
    </div>
  );

  const body = (
    <div className={classes.body}>
      <Text className={classes.price}>{priceLabel}</Text>
      <Text className={classes.title} weight="semibold">{listing.title}</Text>
      <Text className={classes.meta} size={200}>
        <Location16Regular />
        <span>{[place, when].filter(Boolean).join(' · ')}</span>
      </Text>
      {viewMode !== 'compact' && (
        <Text className={classes.seller} size={200}>
          {seller} · {condition}
        </Text>
      )}
      {listing.status !== LISTING_STATUS.Approved && listing.status !== LISTING_STATUS.Sold && listing.status !== LISTING_STATUS.Reserved && (
        <Badge appearance="outline" size="small">{listing.status}</Badge>
      )}
    </div>
  );

  return (
    <article
      className={`${classes.card} ${viewMode === 'list' ? classes.list : ''} ${viewMode === 'compact' ? classes.compact : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={`${listing.title}, ${priceLabel}`}
    >
      {media}
      {body}
    </article>
  );
};
