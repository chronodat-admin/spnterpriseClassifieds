import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import { PageLayout, TwoColumnLayout } from '../../layouts';
import {
  SearchInput,
  SearchHistory,
  SavedSearchList,
  AdvancedFilters,
  ViewModeToggle,
  SortDropdown,
  Pagination
} from '../../controls';
import { ListingGrid } from '../../grids';
import { useSearch, useListings, useLocalization, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES, DEFAULT_PAGE_SIZE, LISTING_STATUS } from '../../constants';
import { ISavedSearch, IListingFilter } from '../../interfaces';

interface ISavedSearchRepository {
  getByUser(userId: string): Promise<ISavedSearch[]>;
  create(entity: Partial<ISavedSearch>): Promise<ISavedSearch>;
  delete(id: number): Promise<void>;
  update(id: number, entity: Partial<ISavedSearch>): Promise<ISavedSearch>;
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { userId } = useAppContext();

  const { query, setQuery, history, clearHistory, selectSuggestion, suggestions } = useSearch(initialQuery);
  const [filter, setFilter] = React.useState<IListingFilter>({ searchText: initialQuery, status: LISTING_STATUS.Approved });
  const [appliedFilter, setAppliedFilter] = React.useState(filter);
  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'compact' | 'gallery'>('grid');
  const [savedSearches, setSavedSearches] = React.useState<ISavedSearch[]>([]);

  const sortOptions = [
    { key: 'relevance', label: s.listings.sortOptions.relevance, field: 'Created', direction: 'desc' as const },
    { key: 'newest', label: s.listings.sortOptions.newest, field: 'Created', direction: 'desc' as const },
    { key: 'priceLow', label: s.listings.sortOptions.priceLow, field: 'EC365_Price', direction: 'asc' as const }
  ];
  const [sort, setSort] = React.useState(sortOptions[0]);

  const { listings, totalCount, isLoading, setFilter: applyFilter, setSort: applySort } = useListings({
    filter: appliedFilter,
    sort: { field: sort.field, direction: sort.direction },
    pageSize: DEFAULT_PAGE_SIZE
  });

  React.useEffect(() => {
    applyFilter(appliedFilter);
  }, [appliedFilter, applyFilter]);

  React.useEffect(() => {
    applySort({ field: sort.field, direction: sort.direction });
  }, [sort, applySort]);

  React.useEffect(() => {
    if (!userId) return;
    ServiceContainer.getInstance()
      .resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository)
      .getByUser(userId)
      .then(setSavedSearches)
      .catch(() => undefined);
  }, [userId]);

  const handleSearch = (): void => {
    setAppliedFilter(prev => ({ ...prev, searchText: query }));
    setSearchParams(query ? { q: query } : {});
    setPage(1);
  };

  const handleSaveSearch = async (): Promise<void> => {
    if (!userId || !query) return;
    const repo = ServiceContainer.getInstance().resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository);
    const created = await repo.create({
      userId,
      title: query,
      query,
      filtersJson: JSON.stringify(appliedFilter),
      notifyOnMatch: false
    });
    setSavedSearches(prev => [created, ...prev]);
  };

  return (
    <PageLayout
      title={s.search.title}
      actions={<Button appearance="secondary" onClick={handleSaveSearch}>{s.search.saveSearch}</Button>}
    >
      <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} placeholder={s.search.placeholder} />
      <SearchHistory history={history} onSelect={(q) => { setQuery(q); selectSuggestion({ text: q, type: 'history' }); }} onClear={clearHistory} title={s.search.recentSearches} clearLabel={s.search.clearHistory} />

      {suggestions.length > 0 && (
        <div>
          <strong>{s.search.suggestions}</strong>
          {suggestions.map((sg, i) => (
            <Button key={i} appearance="subtle" onClick={() => selectSuggestion(sg)}>{sg.text}</Button>
          ))}
        </div>
      )}

      <TwoColumnLayout
        sidebar={
          <>
            <AdvancedFilters
              filter={filter}
              onChange={setFilter}
              onApply={() => { setAppliedFilter({ ...filter, searchText: query }); setPage(1); }}
              onClear={() => { const cleared = { status: LISTING_STATUS.Approved, searchText: query }; setFilter(cleared); setAppliedFilter(cleared); }}
              accordionTitle={s.listings.filters.title}
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
            <SavedSearchList
              searches={savedSearches}
              onRun={(search) => { setQuery(search.query); setAppliedFilter(JSON.parse(search.filtersJson)); handleSearch(); }}
              onDelete={async (search) => {
                await ServiceContainer.getInstance().resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository).delete(search.id);
                setSavedSearches(prev => prev.filter(x => x.id !== search.id));
              }}
              notifyLabel={s.search.notifyOnMatch}
              emptyMessage={s.app.noResults}
            />
          </>
        }
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <SortDropdown value={{ field: sort.field, direction: sort.direction }} options={sortOptions} onChange={(opt) => opt && setSort(sortOptions.find(o => o.field === opt.field) ?? sortOptions[0])} />
          <ViewModeToggle value={viewMode} onChange={setViewMode} labels={{ grid: s.listings.viewModes.grid, list: s.listings.viewModes.list, compact: s.listings.viewModes.compact, gallery: s.listings.viewModes.gallery }} />
        </div>

        {query && <p>{s.search.resultsFor} &quot;{query}&quot; ({totalCount} {s.search.resultCount})</p>}

        <ListingGrid
          listings={listings.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE)}
          viewMode={viewMode}
          isLoading={isLoading}
          onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
          emptyTitle={s.app.noResults}
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      </TwoColumnLayout>
    </PageLayout>
  );
};

export default SearchPage;
