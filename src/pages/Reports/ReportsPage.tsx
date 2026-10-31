import * as React from 'react';
import { PageLayout } from '../../layouts';
import { ReportQueue, LoadingSkeleton, ErrorState } from '../../controls';
import { useLocalization, usePermissions } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { IReport } from '../../interfaces';

interface IAdminService {
  getPendingReports(): Promise<IReport[]>;
  resolveReport(reportId: number, status: 'Reviewed' | 'Dismissed' | 'ActionTaken', adminNotes?: string): Promise<IReport>;
}

export const ReportsPage: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { canModerate, canViewReports } = usePermissions();

  const [reports, setReports] = React.useState<IReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>();

  const load = React.useCallback(async (): Promise<void> => {
    if (!canModerate && !canViewReports) return;
    setIsLoading(true);
    try {
      const admin = ServiceContainer.getInstance().resolve<IAdminService>(SERVICE_KEYS.AdminService);
      const data = await admin.getPendingReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [canModerate, canViewReports]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  if (!canModerate && !canViewReports) {
    return <PageLayout title={s.reports.title}><p>{s.permissions.accessDenied}</p></PageLayout>;
  }

  return (
    <PageLayout title={s.reports.title}>
      {isLoading ? <LoadingSkeleton rows={4} /> : error ? (
        <ErrorState message={error.message} onRetry={load} />
      ) : (
        <ReportQueue
          reports={reports}
          onReview={async (report) => {
            await ServiceContainer.getInstance().resolve<IAdminService>(SERVICE_KEYS.AdminService).resolveReport(report.id, 'Reviewed');
            await load();
          }}
          onDismiss={async (report) => {
            await ServiceContainer.getInstance().resolve<IAdminService>(SERVICE_KEYS.AdminService).resolveReport(report.id, 'Dismissed');
            await load();
          }}
          emptyMessage={s.reports.noReports}
        />
      )}
    </PageLayout>
  );
};

export default ReportsPage;
