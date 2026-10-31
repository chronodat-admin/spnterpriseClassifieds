import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { ISearchSuggestion } from '../interfaces';
import { SEARCH_DEBOUNCE_MS } from '../constants';
import { useAppContext } from './useAppContext';
import { useDebounce } from './useDebounce';

interface ISearchService {
  getSuggestions(query: string): Promise<ISearchSuggestion[]>;
  getSearchHistory(): string[];
  addToHistory(query: string): void;
  clearSearchHistory(): void;
}

function readSearchHistory(service: ISearchService): string[] {
  if (typeof service.getSearchHistory === 'function') {
    return service.getSearchHistory();
  }
  return [];
}

export interface IUseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  suggestions: ISearchSuggestion[];
  history: string[];
  isSearching: boolean;
  error: Error | undefined;
  clearHistory: () => void;
  selectSuggestion: (suggestion: ISearchSuggestion) => void;
}

export function useSearch(initialQuery = ''): IUseSearchResult {
  const { serviceContainerReady } = useAppContext();
  const [query, setQuery] = React.useState(initialQuery);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = React.useState<ISearchSuggestion[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const getService = React.useCallback((): ISearchService | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<ISearchService>(SERVICE_KEYS.SearchService);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  React.useEffect(() => {
    const service = getService();
    if (service) {
      setHistory(readSearchHistory(service));
    }
  }, [getService]);

  React.useEffect(() => {
    const service = getService();
    if (!service || debouncedQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setError(undefined);

    service.getSuggestions(debouncedQuery)
      .then(results => {
        if (!cancelled) setSuggestions(results);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, getService]);

  const clearHistory = React.useCallback(() => {
    const service = getService();
    if (service) {
      service.clearSearchHistory();
      setHistory([]);
    }
  }, [getService]);

  const selectSuggestion = React.useCallback((suggestion: ISearchSuggestion) => {
    setQuery(suggestion.text);
    const service = getService();
    if (service) {
      service.addToHistory(suggestion.text);
      setHistory(readSearchHistory(service));
    }
  }, [getService]);

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    history,
    isSearching,
    error,
    clearHistory,
    selectSuggestion
  };
}
