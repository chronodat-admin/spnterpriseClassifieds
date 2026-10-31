import * as React from 'react';
import {
  TableCellLayout,
  TableRow,
  Avatar,
  Text,
  Badge,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { IListing } from '../../interfaces';
import { StatusBadge } from '../../controls/StatusBadge/StatusBadge';
import { useStrings } from '../../hooks';
import { formatCurrency, formatRelativeDate, truncateText, getInitials } from '../../utilities';

const useStyles = makeStyles({
  row: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover
    }
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusSmall,
    objectFit: 'cover'
  },
  price: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1
  }
});

export interface IListingListItemProps {
  listing: IListing;
  onClick?: (listing: IListing) => void;
  locale?: string;
}

export const ListingListItem: React.FC<IListingListItemProps> = ({
  listing,
  onClick,
  locale = 'en-US'
}) => {
  const strings = useStrings();
  const styles = useStyles();

  const priceDisplay = listing.isDonation
    ? strings.listings.free
    : formatCurrency(listing.price, listing.currency, locale);

  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls[0];

  const handleClick = (): void => onClick?.(listing);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(listing);
    }
  };

  return (
    <TableRow
      className={styles.row}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${listing.title}, ${priceDisplay}`}
    >
      <TableCellLayout
        media={
          imageUrl ? (
            <img src={imageUrl} alt="" className={styles.thumbnail} loading="lazy" />
          ) : (
            <Avatar initials={getInitials(listing.title)} size={48} aria-hidden="true" />
          )
        }
      >
        <Text weight="semibold">{truncateText(listing.title, 60)}</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {listing.categoryName} · {listing.sellerDisplayName}
        </Text>
      </TableCellLayout>
      <TableCellLayout>
        <span className={styles.price}>{priceDisplay}</span>
      </TableCellLayout>
      <TableCellLayout>
        <StatusBadge status={listing.status} size="small" />
      </TableCellLayout>
      <TableCellLayout>
        {listing.isFeatured && (
          <Badge appearance="filled" color="brand" size="small">{strings.listings.featured}</Badge>
        )}
      </TableCellLayout>
      <TableCellLayout>
        <Text size={200}>{listing.viewCount} {strings.listings.views}</Text>
      </TableCellLayout>
      <TableCellLayout>
        <Text size={200}>{formatRelativeDate(listing.publishedOn ?? listing.created)}</Text>
      </TableCellLayout>
    </TableRow>
  );
};
