import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../../layouts';
import { AdminLayout } from '../../layouts';
import { useLocalization, usePermissions } from '../../hooks';
import {
  AdminDashboardTab,
  AdminCategoriesTab,
  AdminSettingsTab,
  AdminApprovalTab,
  AdminReportsTab,
  AdminUsersTab,
  AdminBrandingTab,
  AdminEmailTab,
  AdminTeamsTab,
  AdminAiTab,
  AdminLicenseTab,
  AdminStorageTab,
  AdminTelemetryTab
} from './tabs';

export const AdminCenterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { canAdmin } = usePermissions();
  const activeTab = searchParams.get('tab') ?? 'dashboard';

  if (!canAdmin) {
    return <PageLayout title={s.admin.title}><p>{s.permissions.adminRequired}</p></PageLayout>;
  }

  const setTab = (key: string): void => {
    setSearchParams({ tab: key });
  };

  const tabs = [
    { key: 'dashboard', label: s.admin.dashboard, content: <AdminDashboardTab /> },
    { key: 'categories', label: s.categories.title, content: <AdminCategoriesTab /> },
    { key: 'settings', label: s.admin.settings, content: <AdminSettingsTab /> },
    { key: 'approval', label: s.admin.approvalQueue, content: <AdminApprovalTab /> },
    { key: 'reports', label: s.admin.reports, content: <AdminReportsTab /> },
    { key: 'users', label: s.admin.users, content: <AdminUsersTab /> },
    { key: 'branding', label: s.admin.branding, content: <AdminBrandingTab /> },
    { key: 'email', label: s.admin.emailTemplates, content: <AdminEmailTab /> },
    { key: 'teams', label: s.admin.settingsCategories.teams, content: <AdminTeamsTab /> },
    { key: 'ai', label: s.admin.aiSettings.title, content: <AdminAiTab /> },
    { key: 'license', label: s.admin.settingsCategories.license, content: <AdminLicenseTab /> },
    { key: 'storage', label: s.admin.settingsCategories.storage, content: <AdminStorageTab /> },
    { key: 'telemetry', label: s.settings.telemetry, content: <AdminTelemetryTab /> }
  ];

  return (
    <PageLayout title={s.admin.title}>
      <AdminLayout tabs={tabs} activeTab={activeTab} onTabChange={setTab} />
    </PageLayout>
  );
};

export default AdminCenterPage;
