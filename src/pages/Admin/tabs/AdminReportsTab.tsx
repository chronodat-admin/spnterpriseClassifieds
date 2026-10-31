import * as React from 'react';
import { ReportQueue, LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { IReport } from '../../../interfaces';

export const AdminReportsTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [reports, setReports] = React.useState<IReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = async (): Promise<void> => {
    const data = await ServiceContainer.getInstance().resolve<{ getPendingReports(): Promise<IReport[]> }>(SERVICE_KEYS.AdminService).getPendingReports();
    setReports(data);
    setLoading(false);
  };

  React.useEffect(() => { load().catch(() => undefined); }, []);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <ReportQueue
      reports={reports}
      emptyMessage={s.reports.noReports}
      onReview={async (r) => { await ServiceContainer.getInstance().resolve<{ resolveReport(id: number, status: 'Reviewed' | 'Dismissed' | 'ActionTaken'): Promise<IReport> }>(SERVICE_KEYS.AdminService).resolveReport(r.id, 'Reviewed'); await load(); }}
      onDismiss={async (r) => { await ServiceContainer.getInstance().resolve<{ resolveReport(id: number, status: 'Reviewed' | 'Dismissed' | 'ActionTaken'): Promise<IReport> }>(SERVICE_KEYS.AdminService).resolveReport(r.id, 'Dismissed'); await load(); }}
    />
  );
};

export default AdminReportsTab;
