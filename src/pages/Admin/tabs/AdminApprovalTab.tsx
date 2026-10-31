import * as React from 'react';
import { Button, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Textarea, Field } from '@fluentui/react-components';
import { LoadingSkeleton } from '../../../controls';
import { useLocalization, useNotifications } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { IApprovalQueueItem } from '../../../interfaces';
import { formatDate } from '../../../utilities';

export const AdminApprovalTab: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const { success } = useNotifications();
  const [items, setItems] = React.useState<IApprovalQueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notes, setNotes] = React.useState<Record<number, string>>({});

  const load = React.useCallback(async (): Promise<void> => {
    const data = await ServiceContainer.getInstance().resolve<{ getPendingApprovals(): Promise<IApprovalQueueItem[]> }>(SERVICE_KEYS.AdminService).getPendingApprovals();
    setItems(data);
    setLoading(false);
  }, []);

  React.useEffect(() => { load().catch(() => undefined); }, [load]);

  const handleAction = async (id: number, approve: boolean): Promise<void> => {
    const admin = ServiceContainer.getInstance().resolve<{ approveListing(id: number, notes?: string): Promise<unknown>; rejectListing(id: number, notes?: string): Promise<unknown> }>(SERVICE_KEYS.AdminService);
    if (approve) await admin.approveListing(id, notes[id]); else await admin.rejectListing(id, notes[id]);
    success(approve ? s.admin.approved : s.admin.rejected);
    await load();
  };

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>{s.admin.approvalQueueTitle}</TableHeaderCell>
          <TableHeaderCell>{s.admin.user}</TableHeaderCell>
          <TableHeaderCell>{s.admin.timestamp}</TableHeaderCell>
          <TableHeaderCell>{s.admin.approvalNotes}</TableHeaderCell>
          <TableHeaderCell>{s.common.actions}</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.listingTitle ?? `#${item.listingId}`}</TableCell>
            <TableCell>{item.submittedBy}</TableCell>
            <TableCell>{formatDate(item.submittedOn)}</TableCell>
            <TableCell>
              <Field><Textarea value={notes[item.id] ?? ''} onChange={(_, d) => setNotes(prev => ({ ...prev, [item.id]: d.value }))} /></Field>
            </TableCell>
            <TableCell>
              <Button size="small" onClick={() => handleAction(item.id, true)}>{s.admin.approve}</Button>
              <Button size="small" appearance="secondary" onClick={() => handleAction(item.id, false)}>{s.admin.reject}</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminApprovalTab;
