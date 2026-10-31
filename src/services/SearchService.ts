import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IListingFilter,
  IPagedResult,
  IListing,
  ISavedSearch,
  ISearchSuggestion,
  ISortOption
} from '../interfaces';
import { ListingRepository } from '../repositories/ListingRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { TagRepository } from '../repositories/TagRepository';
import { SavedSearchRepository } from '../repositories/SavedSearchRepository';
import { LOCAL_STORAGE_KEYS, SEARCH_DEBOUNCE_MS, TELEMETRY_EVENTS } from '../constants';
import { parseFiltersJson, readLocalStorage, writeLocalStorage, uniqueBy } from '../utilities';
import { TelemetryService } from './TelemetryService';

export class SearchService {
  private _listingRepo: ListingRepository;
  private _categoryRepo: CategoryRepository;
  private _tagRepo: TagRepository;
  private _savedSearchRepo: SavedSearchRepository;
  private _telemetry: TelemetryService;
  private _context: WebPartContext;
  private _searchTimer: ReturnType<typeof setTimeout> | undefined;
  private _pendingSearch: {
    resolve: (result: IPagedResult<IListing>) => void;
    reject: (error: Error) => void;
  } | undefined;

  constructor(context: WebPartContext) {
    this._context = context;
    this._listingRepo = new ListingRepository(context);
    this._categoryRepo = new CategoryRepository(context);
    this._tagRepo = new TagRepository(context);
    this._savedSearchRepo = new SavedSearchRepository(context);
    this._telemetry = new TelemetryService(context);
  }

  public instantSearch(
    filter: IListingFilter,
    page = 1,
    pageSize = 24,
    sort?: ISortOption
  ): Promise<IPagedResult<IListing>> {
    return new Promise((resolve, reject) => {
      if (this._searchTimer) {
        clearTimeout(this._searchTimer);
      }

      this._pendingSearch = { resolve, reject };

      this._searchTimer = setTimeout(async () => {
        try {
          const result = await this._listingRepo.search(filter, page, pageSize, sort);
          this._telemetry.trackEvent({
            name: TELEMETRY_EVENTS.SearchPerformed,
            properties: {
              query: filter.searchText ?? '',
              categoryId: filter.categoryId ?? 0,
              resultCount: result.items.length
            }
          });
          if (filter.searchText?.trim()) {
            this.addToHistory(filter.searchText.trim());
          }
          this._pendingSearch?.resolve(result);
        } catch (error) {
          this._pendingSearch?.reject(error instanceof Error ? error : new Error(String(error)));
        } finally {
          this._pendingSearch = undefined;
          this._searchTimer = undefined;
        }
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  public async getSuggestions(query: string): Promise<ISearchSuggestion[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const suggestions: ISearchSuggestion[] = [];

    if (!normalizedQuery) {
      const history = this.getSearchHistory();
      return history.slice(0, 5).map(text => ({
        text,
        type: 'history' as const
      }));
    }

    const [categories, tags, listings] = await Promise.all([
      this._categoryRepo.getVisible(),
      this._tagRepo.getPopular(10),
      this._listingRepo.search({ searchText: query }, 1, 5)
    ]);

    categories
      .filter(cat => cat.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .forEach(cat => {
        suggestions.push({
          text: cat.title,
          type: 'category',
          metadata: { categoryId: String(cat.id) }
        });
      });

    tags
      .filter(tag => tag.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .forEach(tag => {
        suggestions.push({
          text: tag.title,
          type: 'tag',
          metadata: { tagId: String(tag.id) }
        });
      });

    listings.items.forEach(listing => {
      suggestions.push({
        text: listing.title,
        type: 'listing',
        metadata: { listingId: String(listing.id) }
      });
    });

    this.getSearchHistory()
      .filter(item => item.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .forEach(text => {
        suggestions.push({ text, type: 'history' });
      });

    return uniqueBy(suggestions, s => `${s.type}-${s.text}`).slice(0, 10);
  }

  public getSearchHistory(): string[] {
    return readLocalStorage<string[]>(LOCAL_STORAGE_KEYS.SearchHistory, []);
  }

  public addToHistory(query: string): void {
    const history = this.getSearchHistory().filter(item => item !== query);
    history.unshift(query);
    writeLocalStorage(LOCAL_STORAGE_KEYS.SearchHistory, history.slice(0, 20));
  }

  public clearSearchHistory(): void {
    writeLocalStorage(LOCAL_STORAGE_KEYS.SearchHistory, []);
  }

  public async getSavedSearches(userId?: string): Promise<ISavedSearch[]> {
    const id = userId ?? this._context.pageContext.user.loginName;
    return this._savedSearchRepo.getByUser(id);
  }

  public async saveSearch(search: Partial<ISavedSearch>): Promise<ISavedSearch> {
    return this._savedSearchRepo.create({
      userId: search.userId ?? this._context.pageContext.user.loginName,
      title: search.title ?? 'Saved Search',
      query: search.query ?? '',
      filtersJson: search.filtersJson ?? '{}',
      notifyOnMatch: search.notifyOnMatch ?? false,
      ...search
    });
  }

  public async updateSavedSearch(id: number, search: Partial<ISavedSearch>): Promise<ISavedSearch> {
    return this._savedSearchRepo.update(id, search);
  }

  public async deleteSavedSearch(id: number): Promise<void> {
    await this._savedSearchRepo.delete(id);
  }

  public async runSavedSearch(id: number, page = 1, pageSize = 24): Promise<IPagedResult<IListing>> {
    const saved = await this._savedSearchRepo.getById(id);
    if (!saved) {
      throw new Error(`Saved search ${id} not found`);
    }

    const filters = parseFiltersJson<IListingFilter>(saved.filtersJson, {});
    if (saved.query) {
      filters.searchText = saved.query;
    }

    const result = await this._listingRepo.search(filters, page, pageSize);
    await this._savedSearchRepo.update(id, { lastRun: new Date() });
    return result;
  }
}
