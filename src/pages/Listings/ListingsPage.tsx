import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Checkbox, Text, makeStyles, tokens } from '@fluentui/react-components';
import { PageLayout, TwoColumnLayout } from '../../layouts';
import {
  SearchInput,
  ViewModeToggle,
  SortDropdown,
  FilterPanel,
  Pagination,
  BulkActionBar,
  defaultBulkActions,
  ExportMenu,
  exportListingsCsv,
  ErrorState,
  ConfirmDialog
} from '../../controls';
import { ListingGrid } from '../../grids';
import { useListings, useLocalization, useFavorites, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES, DEFAULT_PAGE_SIZE, LISTING_STATUS, LISTING_TYPE } from '../../constants';
import { IViewMode, IListingFilter, IFavorite } from '../../interfaces';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalM
  },
  toolbarLeft: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalM, alignItems: 'center', flex: 1 },
  selectAll: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS },
  chips: { display: 'flex', gap: tokens.spacingHorizontalS, flexWrap: 'wrap', marginBottom: tokens.spacingVerticalM },
  count: { color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS }
});

type QuickFilter = 'all' | 'sell' | 'free' | 'rent' | 'donate' | 'wanted' | 'featured';

function applyQuickFilter(key: QuickFilter, current: IListingFilter): IListingFilter {
  const next: IListingFilter = {
    status: LISTING_STATUS.Approved,
    searchText: current.searchText,
    categoryId: current.categoryId
  };
  if (key === 'sell') next.listingType = LISTING_TYPE.Sell;
  if (key === 'free') next.maxPrice = 0;
  if (key === 'rent') next.listingType = LISTING_TYPE.Rent;
  if (key === 'donate') next.isDonation = true;
  if (key === 'wanted') next.listingType = LISTING_TYPE.Wanted;
  if (key === 'featured') next.isFeatured = true;
  return next;
}

function quickFromParams(type: string | undefined): QuickFilter {
  if (type === 'sell' || type === 'free' || type === 'rent' || type === 'donate' || type === 'wanted' || type === 'featured') {
    return type;
  }
  return 'all';
}

export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classes = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  const { userId } = useAppContext();
  const [viewMode, setViewMode] = React.useState<IViewMode['key']>('grid');
  const [page, setPage] = React.useState(1);
  const initialQuick = quickFromParams(searchParams.get('type') ?? undefined);
  const [quick, setQuick] = React.useState<QuickFilter>(initialQuick);
  const [draftFilter, setDraftFilter] = React.useState<IListingFilter>(applyQuickFilter(initialQuick, {
    status: LISTING_STATUS.Approved,
    searchText: searchParams.get('q') || undefined,
    categoryId: searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  }));
  const [appliedFilter, setAppliedFilter] = React.useState<IListingFilter>(draftFilter);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const { favorites, refresh: refreshFavorites } = useFavorites();
  const favoriteIds = React.useMemo(() => new Set(favorites.map(f => f.listingId)), [favorites]);

  const sortOptions = [
    { key: 'newest', label: s.listings.sortOptions.newest, field: 'Created', direction: 'desc' as const },
    { key: 'oldest', label: s.listings.sortOptions.oldest, field: 'Created', direction: 'asc' as const },
    { key: 'priceLow', label: s.listings.sortOptions.priceLow, field: 'EC365_Price', direction: 'asc' as const },
    { key: 'priceHigh', label: s.listings.sortOptions.priceHigh, field: 'EC365_Price', direction: 'desc' as const },
    { key: 'mostViewed', label: s.listings.sortOptions.mostViewed, field: 'EC365_ViewCount', direction: 'desc' as const }
  ];

  const [sort, setSort] = React.useState(sortOptions[0]);

  const { listings, totalCount, isLoading, error, refresh, setFilter, setSort: applySort } = useListings({
    filter: appliedFilter,
    sort: { field: sort.field, direction: sort.direction },
    pageSize: DEFAULT_PAGE_SIZE
  });

  React.useEffect(() => {
    setFilter(appliedFilter);
  }, [appliedFilter, setFilter]);

  React.useEffect(() => {
    applySort({ field: sort.field, direction: sort.direction });
  }, [sort, applySort]);

  const pagedListings = React.useMemo(() => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    return listings.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [listings, page]);

  const handleSearch = (text: string): void => {
    setDraftFilter(prev => ({ ...prev, searchText: text || undefined }));
    setAppliedFilter(prev => ({ ...prev, searchText: text || undefined }));
    setPage(1);
  };

  const selectQuick = (key: QuickFilter): void => {
    const next = applyQuickFilter(key, draftFilter);
    setQuick(key);
    setDraftFilter(next);
    setAppliedFilter(next);
    setPage(1);
  };

  const toggleFavorite = (listingId: number): void => {
    if (!userId) return;
    const repo = ServiceContainer.getInstance().resolve<{
      create(favorite: Partial<IFavorite>): Promise<IFavorite>;
      delete(id: number): Promise<void>;
    }>(SERVICE_KEYS.FavoriteRepository);
    const existing = favorites.find(item => item.listingId === listingId);
    const action = existing
      ? repo.delete(existing.id)
      : repo.create({ userId, listingId, notifyOnChange: false });
    action.then(() => refreshFavorites()).catch(() => undefined);
  };

  const toggleSelectAll = (): void => {
    if (selectedIds.length === pagedListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pagedListings.map(l => l.id));
    }
  };

  const bulkActions = defaultBulkActions(
    () => setDeleteOpen(true),
    (ids) => exportListingsCsv(listings.filter(l => ids.includes(l.id)).map(l => ({ id: l.id, title: l.title, price: l.price, status: l.status }))),
    { delete: s.common.delete, export: s.common.export }
  );

  return (
    <PageLayout title={s.listings.title}>
      <TwoColumnLayout
        sidebar={
          <FilterPanel
            filter={draftFilter}
            onChange={setDraftFilter}
            onApply={() => { setAppliedFilter(draftFilter); setPage(1); }}
            onClear={() => { setDraftFilter({ status: LISTING_STATUS.Approved }); setAppliedFilter({ status: LISTING_STATUS.Approved }); setPage(1); }}
            labels={{
              title: s.listings.filters.title,
              category: s.listings.filters.category,
              condition: s.listings.filters.condition,
              minPrice: s.listings.filters.minPrice,
              maxPrice: s.listings.filters.maxPrice,
              listingType: s.listings.filters.listingType,
              status: s.listings.filters.status,
              featuredOnly: s.listings.filters.featuredOnly,
              clearFilters: s.listings.filters.clearFilters,
              apply: s.common.apply,
              activeFilters: s.listings.filters.activeFilters
            }}
          />
        }
      >
        <div className={classes.chips} role="toolbar" aria-label={s.listings.filters.title}>
          {([
            ['all', s.common.all],
            ['sell', s.listings.type.sell],
            ['free', s.listings.free],
            ['rent', s.listings.type.rent],
            ['donate', s.listings.type.donate],
            ['wanted', s.listings.type.wanted],
            ['featured', s.listings.featured]
          ] as Array<[QuickFilter, string]>).map(([key, label]) => (
            <Button
              key={key}
              shape="circular"
              appearance={quick === key ? 'primary' : 'secondary'}
              onClick={() => selectQuick(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Text className={classes.count} size={200}>{totalCount} {s.listings.title.toLowerCase()}</Text>

        <div className={classes.toolbar}>
          <div className={classes.toolbarLeft}>
            <SearchInput
              value={draftFilter.searchText ?? ''}
              onChange={(v) => setDraftFilter(prev => ({ ...prev, searchText: v }))}
              onSearch={handleSearch}
              placeholder={s.search.placeholder}
            />
            <SortDropdown
              value={{ field: sort.field, direction: sort.direction }}
              options={sortOptions}
              onChange={(opt) => opt && setSort(sortOptions.find(o => o.field === opt.field && o.direction === opt.direction) ?? sortOptions[0])}
              label={s.common.sort}
            />
            <ViewModeToggle
              value={viewMode}
              onChange={setViewMode}
              labels={{
                grid: s.listings.viewModes.grid,
                list: s.listings.viewModes.list,
                compact: s.listings.viewModes.compact,
                gallery: s.listings.viewModes.gallery
              }}
            />
          </div>
          <ExportMenu
            label={s.common.export}
            options={[
              { key: 'csv', label: 'CSV', onClick: () => exportListingsCsv(listings.map(l => ({ id: l.id, title: l.title, price: l.price, status: l.status }))) }
            ]}
          />
        </div>

        <BulkActionBar
          selectedIds={selectedIds}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
        />

        <div className={classes.selectAll}>
          <Checkbox
            label={s.common.selectAll}
            checked={selectedIds.length === pagedListings.length && pagedListings.length > 0}
            onChange={toggleSelectAll}
          />
        </div>

        {error ? (
          <ErrorState message={error.message} onRetry={refresh} retryLabel={s.app.retry} />
        ) : (
          <>
            <ListingGrid
              listings={pagedListings}
              viewMode={viewMode}
              isLoading={isLoading}
              favoriteIds={favoriteIds}
              onFavoriteToggle={toggleFavorite}
              onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
              emptyTitle={s.listings.noListings}
              emptyDescription={s.listings.noListingsDescription}
            />
            <Pagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </TwoColumnLayout>

      <ConfirmDialog
        open={deleteOpen}
        title={s.common.delete}
        message={`Delete ${selectedIds.length} listing(s)?`}
        confirmLabel={s.common.delete}
        cancelLabel={s.common.cancel}
        intent="danger"
        onConfirm={() => { setSelectedIds([]); setDeleteOpen(false); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </PageLayout>
  );
};

export default ListingsPage;
