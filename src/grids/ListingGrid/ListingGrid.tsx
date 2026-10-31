import * as React from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import { IListing, IViewMode } from '../../interfaces';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { ListingCard } from '../../cards/ListingCard/ListingCard';
import { ListingListItem } from '../../cards/ListingListItem/ListingListItem';
import { ListingGalleryItem } from '../../cards/ListingGalleryItem/ListingGalleryItem';
import { ViewModeToggle } from '../../controls/ViewModeToggle/ViewModeToggle';
import { EmptyState } from '../../controls/EmptyState/EmptyState';
import { LoadingSkeleton } from '../../controls/LoadingSkeleton/LoadingSkeleton';
import { useInfiniteScroll, useStrings } from '../../hooks';
import { formatCurrency } from '../../utilities';
import styles from './ListingGrid.module.scss';

export interface IListingGridProps {
  listings: IListing[];
  viewMode?: IViewMode['key'];
  onViewModeChange?: (mode: IViewMode['key']) => void;
  onListingClick?: (listing: IListing) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  virtualized?: boolean;
  itemHeight?: number;
  locale?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showViewToggle?: boolean;
}

const ITEM_HEIGHTS: Record<IViewMode['key'], number> = {
  grid: 320,
  list: 64,
  compact: 56,
  gallery: 200
};

function CompactListingItem({
  listing,
  onClick,
  locale
}: {
  listing: IListing;
  onClick?: (listing: IListing) => void;
  locale: string;
}): React.ReactElement {
  const strings = useStrings();
  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls[0];
  const priceDisplay = listing.isDonation
    ? strings.listings.free
    : formatCurrency(listing.price, listing.currency, locale);

  return (
    <div
      className={styles.compactItem}
      onClick={() => onClick?.(listing)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(listing);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${listing.title}, ${priceDisplay}`}
    >
      {imageUrl && <img src={imageUrl} alt="" className={styles.compactThumb} loading="lazy" />}
      <div className={styles.compactInfo}>
        <div className={styles.compactTitle}>{listing.title}</div>
        <div className={styles.compactPrice}>{priceDisplay}</div>
      </div>
    </div>
  );
}

export const ListingGrid: React.FC<IListingGridProps> = ({
  listings,
  viewMode = 'grid',
  onViewModeChange,
  onListingClick,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  virtualized = true,
  itemHeight,
  locale = 'en-US',
  emptyTitle,
  emptyDescription,
  showViewToggle = true
}) => {
  const strings = useStrings();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(600);

  const resolvedItemHeight = itemHeight ?? ITEM_HEIGHTS[viewMode];
  const overscan = 3;

  const sentinelRef = useInfiniteScroll({
    enabled: hasMore && !loading && !loadingMore && !!onLoadMore,
    onLoadMore: onLoadMore ?? (() => undefined)
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !virtualized) return;

    const handleScroll = (): void => setScrollTop(container.scrollTop);
    const handleResize = (): void => setContainerHeight(container.clientHeight);

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [virtualized, viewMode]);

  const visibleRange = React.useMemo(() => {
    if (!virtualized || viewMode === 'grid' || viewMode === 'gallery') {
      return { start: 0, end: listings.length };
    }
    const start = Math.max(0, Math.floor(scrollTop / resolvedItemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / resolvedItemHeight) + overscan * 2;
    const end = Math.min(listings.length, start + visibleCount);
    return { start, end };
  }, [virtualized, viewMode, scrollTop, containerHeight, resolvedItemHeight, listings.length, overscan]);

  if (loading && listings.length === 0) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label={strings.common.loading}>
        <LoadingSkeleton variant={viewMode === 'list' ? 'list' : 'grid'} count={DEFAULT_PAGE_SIZE / 4} />
      </div>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <EmptyState
        variant="search"
        title={emptyTitle ?? strings.listings.noListings}
        description={emptyDescription ?? strings.listings.noListingsDescription}
      />
    );
  }

  const renderListing = (listing: IListing): React.ReactNode => {
    switch (viewMode) {
      case 'list':
        return (
          <ListingListItem
            key={listing.id}
            listing={listing}
            onClick={onListingClick}
            locale={locale}
          />
        );
      case 'compact':
        return (
          <CompactListingItem
            key={listing.id}
            listing={listing}
            onClick={onListingClick}
            locale={locale}
          />
        );
      case 'gallery':
        return (
          <ListingGalleryItem
            key={listing.id}
            listing={listing}
            onClick={onListingClick}
            locale={locale}
          />
        );
      default:
        return (
          <ListingCard
            key={listing.id}
            listing={listing}
            onClick={onListingClick}
            locale={locale}
          />
        );
    }
  };

  const renderVirtualizedList = (): React.ReactNode => {
    const visibleListings = listings.slice(visibleRange.start, visibleRange.end);
    const totalHeight = listings.length * resolvedItemHeight;
    const offsetY = visibleRange.start * resolvedItemHeight;

    return (
      <div
        ref={containerRef}
        className={styles.virtualContainer}
        style={{ maxHeight: '70vh' }}
        role="list"
        aria-label={strings.listings.allListings}
      >
        <div className={styles.virtualInner} style={{ height: totalHeight }}>
          <div className={styles.virtualItem} style={{ transform: `translateY(${offsetY}px)` }}>
            <div className={viewMode === 'compact' ? styles.compactView : styles.listView}>
              {visibleListings.map(listing => renderListing(listing))}
            </div>
          </div>
        </div>
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      </div>
    );
  };

  const renderGrid = (): React.ReactNode => {
    const viewClass = viewMode === 'gallery'
      ? styles.galleryView
      : viewMode === 'compact'
        ? styles.compactView
        : styles.gridView;

    return (
      <div className={viewClass} role="list" aria-label={strings.listings.allListings}>
        {listings.map(listing => renderListing(listing))}
      </div>
    );
  };

  return (
    <div className={styles.grid}>
      {showViewToggle && onViewModeChange && (
        <div className={styles.toolbar}>
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      )}

      {virtualized && (viewMode === 'list' || viewMode === 'compact')
        ? renderVirtualizedList()
        : renderGrid()}

      {loadingMore && (
        <div className={styles.loadingMore} aria-live="polite">
          <Spinner size="small" label={strings.common.loading} />
        </div>
      )}

      {!hasMore && listings.length > 0 && !loadingMore && (
        <Text className={styles.endMessage} role="status">
          {strings.listings.endOfResults}
        </Text>
      )}

      {!virtualized && hasMore && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      )}
    </div>
  );
};
