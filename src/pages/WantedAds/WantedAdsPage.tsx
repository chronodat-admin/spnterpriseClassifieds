import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Field, Input, Textarea } from '@fluentui/react-components';
import { PageLayout } from '../../layouts';
import { LoadingSkeleton, EmptyState, CategoryPicker } from '../../controls';
import { WantedAdCard } from '../../cards';
import { useLocalization, useAppContext, useCategories } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES } from '../../constants';
import { IListing, IWantedAd } from '../../interfaces';

interface IWantedAdRepository {
  getByUser(userId: string): Promise<IWantedAd[]>;
  getActive(): Promise<IWantedAd[]>;
  create(ad: Partial<IWantedAd>): Promise<IWantedAd>;
  findMatchingListings(ad: IWantedAd): Promise<IListing[]>;
}

export const WantedAdsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userDisplayName } = useAppContext();
  const { categories } = useCategories();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  const [wantedAds, setWantedAds] = React.useState<IWantedAd[]>([]);
  const [matches, setMatches] = React.useState<Record<number, IListing[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<number | undefined>();

  const load = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const repo = ServiceContainer.getInstance().resolve<IWantedAdRepository>(SERVICE_KEYS.WantedAdRepository);
      const data = userId ? await repo.getByUser(userId) : await repo.getActive();
      const matchEntries = await Promise.all(data.map(async ad => {
        const found = await repo.findMatchingListings(ad);
        return [ad.id, found] as const;
      }));
      const nextMatches = Object.fromEntries(matchEntries);
      setMatches(nextMatches);
      setWantedAds(data.map(ad => ({ ...ad, matchCount: nextMatches[ad.id]?.length ?? 0 })));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const handleCreate = async (): Promise<void> => {
    if (!userId || !title.trim() || !categoryId) return;
    const repo = ServiceContainer.getInstance().resolve<IWantedAdRepository>(SERVICE_KEYS.WantedAdRepository);
    await repo.create({
      userId,
      userDisplayName,
      title,
      description,
      categoryId,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      currency: 'USD',
      isActive: true
    });
    setCreateOpen(false);
    setTitle('');
    setDescription('');
    setMaxPrice('');
    setCategoryId(undefined);
    await load();
  };

  return (
    <PageLayout
      title={s.wantedAds.title}
      actions={<Button appearance="primary" onClick={() => setCreateOpen(true)}>{s.wantedAds.createWantedAd}</Button>}
    >
      {isLoading ? <LoadingSkeleton rows={4} /> : wantedAds.length === 0 ? (
        <EmptyState title={s.wantedAds.noWantedAds} actionLabel={s.wantedAds.createWantedAd} onAction={() => setCreateOpen(true)} />
      ) : (
        wantedAds.map(ad => (
          <div key={ad.id}>
            <WantedAdCard wantedAd={ad} matchCountLabel={s.wantedAds.matchCount} />
            {(matches[ad.id] ?? []).map(listing => (
              <Button
                key={listing.id}
                appearance="subtle"
                onClick={() => navigate(`${ROUTES.Listings}/${listing.id}`)}
              >
                {listing.title}
              </Button>
            ))}
          </div>
        ))
      )}

      <Dialog open={createOpen} onOpenChange={(_, d) => !d.open && setCreateOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{s.wantedAds.createWantedAd}</DialogTitle>
            <DialogContent>
              <Field label="Title" required><Input value={title} onChange={(_, d) => setTitle(d.value)} /></Field>
              <CategoryPicker
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
                label={s.listings.category}
                required
              />
              <Field label={s.wantedAds.description}><Textarea value={description} onChange={(_, d) => setDescription(d.value)} /></Field>
              <Field label={s.wantedAds.maxPrice}><Input type="number" value={maxPrice} onChange={(_, d) => setMaxPrice(d.value)} /></Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setCreateOpen(false)}>{s.common.cancel}</Button>
              <Button appearance="primary" onClick={handleCreate} disabled={!title.trim() || !categoryId}>{s.common.create}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageLayout>
  );
};

export default WantedAdsPage;
