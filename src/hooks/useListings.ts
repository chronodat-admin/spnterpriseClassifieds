import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { IListing, IListingFilter, IPagedResult, ISortOption } from '../interfaces';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useAppContext } from './useAppContext';
import { useInfiniteScroll } from './useInfiniteScroll';

interface IListingService {
  search(filter: IListingFilter, page: number, pageSize: number, sort?: ISortOption): Promise<IPagedResult<IListing>>;
  getById(id: number): Promise<IListing | undefined>;
  getFeatured(limit?: number): Promise<IListing[]>;
  getNewest(limit?: number): Promise<IListing[]>;
  getTrending(limit?: number): Promise<IListing[]>;
  getBySeller(sellerId: string, status?: string): Promise<IListing[]>;
}

export interface IUseListingsOptions {
  filter?: IListingFilter;
  sort?: ISortOption;
  pageSize?: number;
  enabled?: boolean;
  infiniteScroll?: boolean;
}

export interface IUseListingsResult {
  listings: IListing[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | undefined;
  hasMore: boolean;
  page: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: IListingFilter) => void;
  setSort: (sort: ISortOption | undefined) => void;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export function useListings(options: IUseListingsOptions = {}): IUseListingsResult {
  const { serviceContainerReady } = useAppContext();
  const {
    filter: initialFilter = {},
    sort: initialSort,
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    infiniteScroll = false
  } = options;

  const [filter, setFilterState] = React.useState<IListingFilter>(initialFilter);
  const [sort, setSortState] = React.useState<ISortOption | undefined>(initialSort);
  const [listings, setListings] = React.useState<IListing[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const getService = React.useCallback((): IListingService => {
    return ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
  }, []);

  const fetchPage = React.useCallback(async (pageNum: number, append: boolean): Promise<void> => {
    if (!enabled || !serviceContainerReady) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(undefined);

    try {
      const service = getService();
      const result = await service.search(filter, pageNum, pageSize, sort);

      setListings(prev => append ? [...prev, ...result.items] : result.items);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [enabled, serviceContainerReady, filter, sort, pageSize, getService]);

  const refresh = React.useCallback(async (): Promise<void> => {
    setPage(1);
    await fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = React.useCallback(async (): Promise<void> => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await fetchPage(page + 1, true);
  }, [hasMore, isLoadingMore, isLoading, page, fetchPage]);

  const setFilter = React.useCallback((newFilter: IListingFilter) => {
    setFilterState(newFilter);
    setPage(1);
  }, []);

  const setSort = React.useCallback((newSort: ISortOption | undefined) => {
    setSortState(newSort);
    setPage(1);
  }, []);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [filter, sort, enabled, serviceContainerReady]);

  const sentinelRef = useInfiniteScroll({
    enabled: infiniteScroll && hasMore && !isLoading && !isLoadingMore,
    onLoadMore: loadMore
  });

  return {
    listings,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    setFilter,
    setSort,
    sentinelRef
  };
}

export function useListing(id: number | undefined): {
  listing: IListing | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
} {
  const { serviceContainerReady } = useAppContext();
  const [listing, setListing] = React.useState<IListing | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!id || !serviceContainerReady) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const service = ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
      const result = await service.getById(id);
      setListing(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [id, serviceContainerReady]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return { listing, isLoading, error, refresh };
}
