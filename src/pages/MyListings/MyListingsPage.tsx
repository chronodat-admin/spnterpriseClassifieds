import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowSync24Regular, Copy24Regular, DataTrending24Regular } from '@fluentui/react-icons';
import { PageLayout } from '../../layouts';
import { TabBar, LoadingSkeleton, StatChart, ErrorState, ConfirmDialog } from '../../controls';
import { ListingGrid } from '../../grids';
import { useLocalization, useAppContext, useNotifications } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES, LISTING_STATUS } from '../../constants';
import { IListing, IListingAnalytics } from '../../interfaces';

interface IListingService {
  getBySeller(sellerId: string, status?: string): Promise<IListing[]>;
  renew(id: number): Promise<IListing>;
  duplicate(id: number): Promise<IListing>;
}

interface IAnalyticsService {
  getListingAnalytics(listingId: number): Promise<IListingAnalytics>;
}

const useStyles = makeStyles({
  analytics: { marginTop: tokens.spacingVerticalL, padding: tokens.spacingHorizontalL, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium }
});

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const { userId } = useAppContext();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { success } = useNotifications();

  const [tab, setTab] = React.useState('all');
  const [listings, setListings] = React.useState<IListing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>();
  const [analyticsListing, setAnalyticsListing] = React.useState<IListing | undefined>();
  const [analytics, setAnalytics] = React.useState<IListingAnalytics | undefined>();
  const [renewId, setRenewId] = React.useState<number | undefined>();

  const statusTabs = [
    { key: 'all', label: s.common.all },
    { key: LISTING_STATUS.Draft, label: s.listings.status.draft },
    { key: LISTING_STATUS.Pending, label: s.listings.status.pending },
    { key: LISTING_STATUS.Approved, label: s.listings.status.approved },
    { key: LISTING_STATUS.Expired, label: s.listings.status.expired },
    { key: LISTING_STATUS.Sold, label: s.listings.status.sold }
  ];

  const load = React.useCallback(async (): Promise<void> => {
    if (!userId) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const service = ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
      const data = await service.getBySeller(userId);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const filtered = tab === 'all' ? listings : listings.filter(l => l.status === tab);

  const handleRenew = async (): Promise<void> => {
    if (!renewId) return;
    await ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService).renew(renewId);
    success(s.listings.renewListing);
    setRenewId(undefined);
    await load();
  };

  const handleDuplicate = async (id: number): Promise<void> => {
    const dup = await ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService).duplicate(id);
    success(s.listings.duplicateListing);
    navigate(`${ROUTES.Listings}/${dup.id}`);
  };

  const showAnalytics = async (listing: IListing): Promise<void> => {
    setAnalyticsListing(listing);
    const data = await ServiceContainer.getInstance().resolve<IAnalyticsService>(SERVICE_KEYS.AnalyticsService).getListingAnalytics(listing.id);
    setAnalytics(data);
  };

  return (
    <PageLayout
      title={s.listings.myListings}
      actions={<Button appearance="primary" onClick={() => navigate(ROUTES.CreateListing)}>{s.navigation.createListing}</Button>}
    >
      <TabBar tabs={statusTabs.map(t => ({ ...t, badge: t.key === 'all' ? listings.length : listings.filter(l => l.status === t.key).length }))} activeTab={tab} onTabChange={setTab} />

      {isLoading ? <LoadingSkeleton rows={4} /> : error ? (
        <ErrorState message={error.message} onRetry={load} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(l => (
              <div key={l.id} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: 12, border: '1px solid var(--colorNeutralStroke2)', borderRadius: 12, background: 'var(--colorNeutralBackground1)' }}>
                <button type="button" onClick={() => navigate(`${ROUTES.Listings}/${l.id}`)} style={{ flex: 1, minWidth: 180, textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>
                  <strong>{l.title}</strong>
                  <div style={{ color: 'var(--colorNeutralForeground3)', fontSize: 12 }}>{l.status} · {l.price === 0 ? s.listings.free : l.price}</div>
                </button>
                <Button size="small" icon={<ArrowSync24Regular />} onClick={() => setRenewId(l.id)}>{s.listings.renewListing}</Button>
                <Button size="small" icon={<Copy24Regular />} onClick={() => handleDuplicate(l.id)}>{s.listings.duplicateListing}</Button>
                <Button size="small" icon={<DataTrending24Regular />} onClick={() => showAnalytics(l)}>{s.admin.analytics}</Button>
              </div>
            ))}
            {filtered.length === 0 && <ListingGrid listings={[]} viewMode="list" emptyTitle={s.listings.noListings} />}
          </div>
        </>
      )}

      {analyticsListing && analytics && (
        <div className={classes.analytics}>
          <h3>{analyticsListing.title} — {s.admin.analytics}</h3>
          <StatChart data={analytics.viewsByDay.map(d => ({ label: d.date, value: d.count }))} />
        </div>
      )}

      <ConfirmDialog
        open={renewId !== undefined}
        title={s.listings.renewListing}
        message="Renew this listing for another period?"
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={handleRenew}
        onCancel={() => setRenewId(undefined)}
      />
    </PageLayout>
  );
};

export default MyListingsPage;
