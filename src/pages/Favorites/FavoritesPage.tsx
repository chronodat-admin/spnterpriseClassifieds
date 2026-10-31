import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import { PageLayout } from '../../layouts';
import { TabBar, LoadingSkeleton, SavedSearchList } from '../../controls';
import { ListingGrid } from '../../grids';
import { CollectionDialog } from '../../dialogs';
import { useFavorites, useLocalization, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES } from '../../constants';
import { IFavoriteCollection, ISavedSearch, IListing } from '../../interfaces';

interface IFavoriteCollectionRepository {
  getByUser(userId: string): Promise<IFavoriteCollection[]>;
  create(collection: Partial<IFavoriteCollection>): Promise<IFavoriteCollection>;
}

interface ISavedSearchRepository {
  getByUser(userId: string): Promise<ISavedSearch[]>;
  delete(id: number): Promise<void>;
  update(id: number, entity: Partial<ISavedSearch>): Promise<ISavedSearch>;
}

interface IListingRepository {
  getById(id: number): Promise<IListing | undefined>;
}

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAppContext();
  const { favorites, isLoading, refresh } = useFavorites();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  const [tab, setTab] = React.useState('favorites');
  const [collections, setCollections] = React.useState<IFavoriteCollection[]>([]);
  const [savedSearches, setSavedSearches] = React.useState<ISavedSearch[]>([]);
  const [listings, setListings] = React.useState<IListing[]>([]);
  const [collectionOpen, setCollectionOpen] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;
    const container = ServiceContainer.getInstance();
    Promise.all([
      container.resolve<IFavoriteCollectionRepository>(SERVICE_KEYS.FavoriteRepository).getByUser(userId).catch(() => []),
      container.resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository).getByUser(userId)
    ]).then(([cols, searches]) => {
      setCollections(cols as IFavoriteCollection[]);
      setSavedSearches(searches);
    }).catch(() => undefined);
  }, [userId]);

  React.useEffect(() => {
    const repo = ServiceContainer.getInstance().resolve<IListingRepository>(SERVICE_KEYS.ListingRepository);
    Promise.all(favorites.map(f => repo.getById(f.listingId)))
      .then(results => setListings(results.filter((l): l is IListing => !!l)))
      .catch(() => undefined);
  }, [favorites]);

  const handleCreateCollection = async (collection: Partial<IFavoriteCollection>): Promise<void> => {
    if (!userId) return;
    await ServiceContainer.getInstance()
      .resolve<IFavoriteCollectionRepository>(SERVICE_KEYS.FavoriteRepository)
      .create({ ...collection, userId });
    setCollectionOpen(false);
    await refresh();
  };

  return (
    <PageLayout
      title={s.favorites.title}
      actions={<Button appearance="primary" onClick={() => setCollectionOpen(true)}>{s.favorites.createCollection}</Button>}
    >
      <TabBar
        tabs={[
          { key: 'favorites', label: s.favorites.myFavorites },
          { key: 'collections', label: s.favorites.collections },
          { key: 'searches', label: s.search.savedSearches }
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {isLoading ? <LoadingSkeleton rows={4} /> : (
        <>
          {tab === 'favorites' && (
            <ListingGrid
              listings={listings}
              viewMode="grid"
              onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
              emptyTitle={s.favorites.noFavorites}
              emptyDescription={s.favorites.noFavoritesDescription}
            />
          )}
          {tab === 'collections' && (
            <div>
              {collections.map(col => (
                <div key={col.id}>{col.title} — {col.description}</div>
              ))}
            </div>
          )}
          {tab === 'searches' && (
            <SavedSearchList
              searches={savedSearches}
              onRun={(search) => navigate(`${ROUTES.Search}?q=${encodeURIComponent(search.query)}`)}
              onDelete={async (search) => {
                await ServiceContainer.getInstance().resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository).delete(search.id);
                setSavedSearches(prev => prev.filter(x => x.id !== search.id));
              }}
              onToggleNotify={async (search, notify) => {
                const updated = await ServiceContainer.getInstance().resolve<ISavedSearchRepository>(SERVICE_KEYS.SavedSearchRepository).update(search.id, { notifyOnMatch: notify });
                setSavedSearches(prev => prev.map(x => x.id === search.id ? updated : x));
              }}
              notifyLabel={s.search.notifyOnMatch}
              emptyMessage={s.app.noResults}
            />
          )}
        </>
      )}

      <CollectionDialog
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        onSave={handleCreateCollection}
        labels={{ title: s.favorites.collections, name: s.favorites.collectionName, description: s.favorites.collectionDescription, save: s.common.save, cancel: s.common.cancel }}
      />
    </PageLayout>
  );
};

export default FavoritesPage;
