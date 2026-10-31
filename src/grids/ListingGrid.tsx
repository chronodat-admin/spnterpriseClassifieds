import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { IListing } from '../interfaces';
import { ListingCard } from '../cards/ListingCard';
import { LoadingSkeleton } from '../controls/LoadingSkeleton';
import { EmptyState } from '../controls/EmptyState';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))'
  },
  list: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  compact: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  gallery: {
    display: 'grid',
    gap: tokens.spacingHorizontalS,
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'
  }
});

export interface IListingGridProps {
  listings: IListing[];
  viewMode?: 'grid' | 'list' | 'compact' | 'gallery';
  isLoading?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  onListingClick?: (listing: IListing) => void;
  favoriteIds?: Set<number>;
  onFavoriteToggle?: (listingId: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
}

export const ListingGrid: React.FC<IListingGridProps> = ({
  listings,
  viewMode = 'grid',
  isLoading,
  onListingClick,
  favoriteIds,
  onFavoriteToggle,
  emptyTitle = 'No listings',
  emptyDescription
}) => {
  const classes = useStyles();

  if (isLoading) {
    return <LoadingSkeleton rows={6} variant="card" />;
  }

  if (listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const layoutClass = classes[viewMode];

  return (
    <div className={layoutClass}>
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          viewMode={viewMode}
          isFavorite={favoriteIds?.has(listing.id)}
          onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(listing.id) : undefined}
          onClick={() => onListingClick?.(listing)}
        />
      ))}
    </div>
  );
};
