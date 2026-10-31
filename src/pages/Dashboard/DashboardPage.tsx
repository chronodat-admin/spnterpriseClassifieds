import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import {
  Add24Regular,
  Grid24Regular,
  Mail24Regular,
  ChartMultiple24Regular
} from '@fluentui/react-icons';
import { PageLayout } from '../../layouts';
import {
  LoadingSkeleton,
  ErrorState,
  StatsCard,
  StatChart,
  QuickActions,
  ActivityFeed,
  AnnouncementList,
  SearchInput
} from '../../controls';
import { ListingGrid } from '../../grids';
import { CategoryCard } from '../../cards';
import { useLocalization, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES } from '../../constants';
import {
  IDashboardStats,
  IListing,
  IActivityLog,
  IAnnouncement
} from '../../interfaces';
import styles from './DashboardPage.module.scss';

const useStyles = makeStyles({
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: tokens.spacingHorizontalM },
  sections: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: tokens.spacingHorizontalXL },
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  categories: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: tokens.spacingHorizontalS }
});

interface IAnalyticsService {
  getDashboardStats(): Promise<IDashboardStats>;
}

interface IListingService {
  getFeatured(limit?: number): Promise<IListing[]>;
  getNewest(limit?: number): Promise<IListing[]>;
  getTrending(limit?: number): Promise<IListing[]>;
}

interface IActivityLogRepository {
  getAll(options?: { orderBy?: string; top?: number }): Promise<IActivityLog[]>;
}

interface IAnnouncementRepository {
  getActive(): Promise<IAnnouncement[]>;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { serviceContainerReady, userDisplayName } = useAppContext();

  const [stats, setStats] = React.useState<IDashboardStats | undefined>();
  const [featured, setFeatured] = React.useState<IListing[]>([]);
  const [newest, setNewest] = React.useState<IListing[]>([]);
  const [trending, setTrending] = React.useState<IListing[]>([]);
  const [activities, setActivities] = React.useState<IActivityLog[]>([]);
  const [announcements, setAnnouncements] = React.useState<IAnnouncement[]>([]);
  const [heroQuery, setHeroQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>();

  const load = React.useCallback(async (): Promise<void> => {
    if (!serviceContainerReady) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const container = ServiceContainer.getInstance();
      const analytics = container.resolve<IAnalyticsService>(SERVICE_KEYS.AnalyticsService);
      const listingService = container.resolve<IListingService>(SERVICE_KEYS.ListingService);
      const activityRepo = container.resolve<IActivityLogRepository>(SERVICE_KEYS.ActivityLogRepository);
      const announcementRepo = container.resolve<IAnnouncementRepository>(SERVICE_KEYS.AnnouncementRepository);

      const [statsData, featuredData, newestData, trendingData, activityData, announcementData] = await Promise.all([
        analytics.getDashboardStats(),
        listingService.getFeatured(6),
        listingService.getNewest(6),
        listingService.getTrending(6),
        activityRepo.getAll({ orderBy: 'Created desc', top: 10 }),
        announcementRepo.getActive()
      ]);

      setStats(statsData);
      setFeatured(featuredData);
      setNewest(newestData);
      setTrending(trendingData);
      setActivities(activityData);
      setAnnouncements(announcementData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [serviceContainerReady]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const quickActions = [
    { key: 'create', label: s.dashboard.createNewListing, icon: <Add24Regular />, onClick: () => navigate(ROUTES.CreateListing) },
    { key: 'categories', label: s.dashboard.browseCategories, icon: <Grid24Regular />, onClick: () => navigate(ROUTES.Categories) },
    { key: 'messages', label: s.dashboard.viewMessages, icon: <Mail24Regular />, onClick: () => navigate(ROUTES.Messages) },
    { key: 'listings', label: s.navigation.listings, icon: <ChartMultiple24Regular />, onClick: () => navigate(ROUTES.Listings) }
  ];

  if (isLoading && !stats) {
    return <LoadingSkeleton rows={8} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={load} retryLabel={s.app.retry} />;
  }

  return (
    <PageLayout
      title={s.dashboard.title}
      subtitle={`${s.dashboard.welcome}, ${userDisplayName}! ${s.dashboard.welcomeMessage}`}
    >
      <section className={styles.hero}>
        <h2>{s.dashboard.welcomeMessage}</h2>
        <p>{s.app.name ?? 'Enterprise Classifieds 365'} · {s.listings.pickupAvailable}</p>
        <div className={styles.heroSearch}>
          <SearchInput
            value={heroQuery}
            onChange={setHeroQuery}
            onSearch={(query) => navigate(`${ROUTES.Listings}?q=${encodeURIComponent(query)}`)}
            placeholder={s.search.placeholder}
          />
        </div>
        <div className={styles.chips}>
          <Button shape="circular" appearance="primary" onClick={() => navigate(ROUTES.Listings)}>{s.listings.allListings}</Button>
          <Button shape="circular" onClick={() => navigate(`${ROUTES.Listings}?type=free`)}>{s.listings.free}</Button>
          <Button shape="circular" onClick={() => navigate(`${ROUTES.Listings}?type=rent`)}>{s.listings.type.rent}</Button>
          <Button shape="circular" onClick={() => navigate(`${ROUTES.Listings}?type=donate`)}>{s.listings.type.donate}</Button>
          <Button shape="circular" onClick={() => navigate(`${ROUTES.Listings}?type=wanted`)}>{s.listings.type.wanted}</Button>
          <Button shape="circular" onClick={() => navigate(ROUTES.WantedAds)}>{s.wantedAds.title}</Button>
        </div>
      </section>

      <AnnouncementList announcements={announcements} />

      {stats && (
        <div className={classes.stats}>
          <StatsCard label={s.dashboard.stats.totalListings} value={stats.totalListings} />
          <StatsCard label={s.dashboard.stats.activeListings} value={stats.activeListings} />
          <StatsCard label={s.dashboard.stats.pendingApprovals} value={stats.pendingApprovals} />
          <StatsCard label={s.dashboard.stats.totalUsers} value={stats.totalUsers} />
          <StatsCard label={s.dashboard.stats.messagesToday} value={stats.messagesToday} />
          <StatsCard label={s.dashboard.stats.viewsToday} value={stats.viewsToday} />
        </div>
      )}

      <div className={styles.quickActions}>
        <h3>{s.dashboard.quickActions}</h3>
        <QuickActions actions={quickActions} />
      </div>

      <div className={classes.sections}>
        <section className={classes.section}>
          <div className={styles.sectionHeader}>
            <h3>{s.dashboard.featuredListings}</h3>
            <Button appearance="subtle" onClick={() => navigate(ROUTES.Listings)}>{s.app.viewAll}</Button>
          </div>
          <ListingGrid
            listings={featured}
            viewMode="grid"
            onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
            emptyTitle={s.dashboard.noFeaturedListings}
          />
        </section>

        <section className={classes.section}>
          <div className={styles.sectionHeader}>
            <h3>{s.dashboard.newestListings}</h3>
            <Button appearance="subtle" onClick={() => navigate(ROUTES.Listings)}>{s.app.viewAll}</Button>
          </div>
          <ListingGrid
            listings={newest}
            viewMode="compact"
            onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
          />
        </section>

        <section className={classes.section}>
          <div className={styles.sectionHeader}>
            <h3>{s.dashboard.trendingListings}</h3>
            <Button appearance="subtle" onClick={() => navigate(ROUTES.Listings)}>{s.app.viewAll}</Button>
          </div>
          <ListingGrid
            listings={trending}
            viewMode="compact"
            onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
          />
        </section>

        {stats && stats.topCategories.length > 0 && (
          <section className={classes.section}>
            <h3>{s.dashboard.topCategories}</h3>
            <StatChart
              title={s.dashboard.topCategories}
              data={stats.topCategories.map(c => ({ label: c.name, value: c.count }))}
            />
            <div className={classes.categories}>
              {stats.topCategories.map(cat => (
                <CategoryCard
                  key={cat.categoryId}
                  category={{ id: cat.categoryId, title: cat.name, sortOrder: 0, isVisible: true, approvalRequired: false, created: new Date(), modified: new Date(), listingCount: cat.count }}
                  onClick={() => navigate(`${ROUTES.Listings}?category=${cat.categoryId}`)}
                  listingCountLabel={s.categories.listingCount}
                />
              ))}
            </div>
          </section>
        )}

        <section className={classes.section}>
          <h3>{s.dashboard.recentActivity}</h3>
          <ActivityFeed activities={activities} emptyMessage={s.dashboard.noRecentActivity} />
        </section>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
