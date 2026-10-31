import * as React from 'react';
import { Text, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from '@fluentui/react-components';
import { LoadingSkeleton } from '../../../controls';
import { useLocalization } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';

export const AdminUsersTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [users, setUsers] = React.useState<Array<{ id: string; displayName: string; listingCount: number }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    ServiceContainer.getInstance()
      .resolve<{ getDashboardStats(): Promise<{ totalUsers: number }> }>(SERVICE_KEYS.AnalyticsService)
      .getDashboardStats()
      .then(() => setUsers([]))
      .finally(() => setLoading(false))
      .catch(() => undefined);
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <Text>{s.admin.users}</Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>{s.admin.user}</TableHeaderCell>
            <TableHeaderCell>{s.sellerProfile.listingCount}</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.displayName}</TableCell>
              <TableCell>{u.listingCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && <Text>{s.app.noResults}</Text>}
    </>
  );
};

export default AdminUsersTab;
