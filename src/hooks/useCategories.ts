import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { ICategory } from '../interfaces';
import { useAppContext } from './useAppContext';

interface ICategoryService {
  getAll(): Promise<ICategory[]>;
  getVisible(): Promise<ICategory[]>;
  getById(id: number): Promise<ICategory | undefined>;
}

export interface IUseCategoriesResult {
  categories: ICategory[];
  categoryTree: ICategory[];
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
  getCategoryById: (id: number) => ICategory | undefined;
}

function buildCategoryTree(categories: ICategory[]): ICategory[] {
  const map = new Map<number, ICategory>();
  const roots: ICategory[] = [];

  categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }));

  map.forEach(cat => {
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(cat);
      }
    } else {
      roots.push(cat);
    }
  });

  const sortRecursive = (items: ICategory[]): ICategory[] =>
    items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        ...item,
        children: item.children ? sortRecursive(item.children) : undefined
      }));

  return sortRecursive(roots);
}

export function useCategories(visibleOnly = true): IUseCategoriesResult {
  const { serviceContainerReady } = useAppContext();
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!serviceContainerReady) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const service = ServiceContainer.getInstance().resolve<ICategoryService>(SERVICE_KEYS.CategoryService);
      const result = visibleOnly ? await service.getVisible() : await service.getAll();
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [serviceContainerReady, visibleOnly]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const categoryTree = React.useMemo(() => buildCategoryTree(categories), [categories]);

  const getCategoryById = React.useCallback(
    (id: number): ICategory | undefined => categories.find(c => c.id === id),
    [categories]
  );

  return {
    categories,
    categoryTree,
    isLoading,
    error,
    refresh,
    getCategoryById
  };
}
