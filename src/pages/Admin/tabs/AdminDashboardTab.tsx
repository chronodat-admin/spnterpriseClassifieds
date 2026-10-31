import * as React from 'react';
import { StatsCard, StatChart, ActivityFeed, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { IDashboardStats, IActivityLog } from '../../../interfaces';

export const AdminDashboardTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [stats, setStats] = React.useState<IDashboardStats | undefined>();
  const [activities, setActivities] = React.useState<IActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      ServiceContainer.getInstance().resolve<{ getDashboardStats(): Promise<IDashboardStats> }>(SERVICE_KEYS.AnalyticsService).getDashboardStats(),
      ServiceContainer.getInstance().resolve<{ getAll(o?: { orderBy?: string; top?: number }): Promise<IActivityLog[]> }>(SERVICE_KEYS.ActivityLogRepository).getAll({ orderBy: 'Created desc', top: 20 })
    ]).then(([sData, acts]) => { setStats(sData); setActivities(acts); }).finally(() => setLoading(false)).catch(() => undefined);
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (!stats) return null;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        <StatsCard label={s.dashboard.stats.totalListings} value={stats.totalListings} />
        <StatsCard label={s.dashboard.stats.activeListings} value={stats.activeListings} />
        <StatsCard label={s.dashboard.stats.pendingApprovals} value={stats.pendingApprovals} />
        <StatsCard label={s.dashboard.stats.totalUsers} value={stats.totalUsers} />
      </div>
      <StatChart title={s.dashboard.topCategories} data={stats.topCategories.map((c: { name: string; count: number }) => ({ label: c.name, value: c.count }))} />
      <h3>{s.admin.activityLogTitle}</h3>
      <ActivityFeed activities={activities} />
    </>
  );
};

export default AdminDashboardTab;
