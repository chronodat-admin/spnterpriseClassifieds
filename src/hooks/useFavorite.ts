import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { IFavorite } from '../interfaces';
import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';
import { TelemetryClient } from '../telemetry/TelemetryClient';

interface IFavoriteRepository {
  getByUser(userId: string): Promise<IFavorite[]>;
  getByUserAndListing(userId: string, listingId: number): Promise<IFavorite | undefined>;
  create(favorite: Partial<IFavorite>): Promise<IFavorite>;
  delete(id: number): Promise<void>;
}

interface ITelemetryService {
  client: TelemetryClient;
}

export interface IUseFavoriteResult {
  isFavorite: boolean;
  favorite: IFavorite | undefined;
  isLoading: boolean;
  isToggling: boolean;
  error: Error | undefined;
  toggle: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFavorite(listingId: number | undefined): IUseFavoriteResult {
  const { userId, serviceContainerReady } = useAppContext();
  const { success, error: showError } = useNotifications();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [favorite, setFavorite] = React.useState<IFavorite | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const getRepository = React.useCallback((): IFavoriteRepository | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<IFavoriteRepository>(SERVICE_KEYS.FavoriteRepository);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!listingId || !userId) return;
    const repo = getRepository();
    if (!repo) return;

    setIsLoading(true);
    setError(undefined);
    try {
      const existing = await repo.getByUserAndListing(userId, listingId);
      setFavorite(existing);
      setIsFavorite(!!existing);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [listingId, userId, getRepository]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const toggle = React.useCallback(async (): Promise<void> => {
    if (!listingId || !userId) return;
    const repo = getRepository();
    if (!repo) {
      showError('Favorites unavailable', 'Favorite service is not configured.');
      return;
    }

    setIsToggling(true);
    setError(undefined);
    try {
      if (isFavorite && favorite) {
        await repo.delete(favorite.id);
        setIsFavorite(false);
        setFavorite(undefined);
        success('Removed from favorites');
      } else {
        const created = await repo.create({
          userId,
          listingId,
          notifyOnChange: false
        });
        setIsFavorite(true);
        setFavorite(created);
        success('Added to favorites');

        try {
          const telemetry = ServiceContainer.getInstance().resolve<ITelemetryService>(SERVICE_KEYS.TelemetryService);
          telemetry.client.trackFavoriteAdded(listingId);
        } catch {
          /* telemetry optional */
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(err instanceof Error ? err : new Error(message));
      showError('Favorite action failed', message);
    } finally {
      setIsToggling(false);
    }
  }, [listingId, userId, isFavorite, favorite, getRepository, success, showError]);

  return {
    isFavorite,
    favorite,
    isLoading,
    isToggling,
    error,
    toggle,
    refresh
  };
}

export function useFavorites(): {
  favorites: IFavorite[];
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
} {
  const { userId, serviceContainerReady } = useAppContext();
  const [favorites, setFavorites] = React.useState<IFavorite[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const refresh = React.useCallback(async (): Promise<void> => {
    if (!userId || !serviceContainerReady) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const repo = ServiceContainer.getInstance().resolve<IFavoriteRepository>(SERVICE_KEYS.FavoriteRepository);
      const result = await repo.getByUser(userId);
      setFavorites(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId, serviceContainerReady]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return { favorites, isLoading, error, refresh };
}
