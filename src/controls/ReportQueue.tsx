import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  Badge,
  Text
} from '@fluentui/react-components';
import { IReport } from '../interfaces';
import { formatDate } from '../utilities';

export interface IReportQueueProps {
  reports: IReport[];
  onReview?: (report: IReport) => void;
  onDismiss?: (report: IReport) => void;
  emptyMessage?: string;
  labels?: {
    listing: string;
    type: string;
    reason: string;
    status: string;
    date: string;
    actions: string;
  };
}

export const ReportQueue: React.FC<IReportQueueProps> = ({
  reports,
  onReview,
  onDismiss,
  emptyMessage = 'No reports',
  labels = {
    listing: 'Listing',
    type: 'Type',
    reason: 'Reason',
    status: 'Status',
    date: 'Date',
    actions: 'Actions'
  }
}) => {
  if (reports.length === 0) {
    return <Text>{emptyMessage}</Text>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>{labels.listing}</TableHeaderCell>
          <TableHeaderCell>{labels.type}</TableHeaderCell>
          <TableHeaderCell>{labels.reason}</TableHeaderCell>
          <TableHeaderCell>{labels.status}</TableHeaderCell>
          <TableHeaderCell>{labels.date}</TableHeaderCell>
          <TableHeaderCell>{labels.actions}</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map(report => (
          <TableRow key={report.id}>
            <TableCell>#{report.listingId}</TableCell>
            <TableCell>{report.reportType}</TableCell>
            <TableCell>{report.reason}</TableCell>
            <TableCell><Badge>{report.status}</Badge></TableCell>
            <TableCell>{formatDate(report.created)}</TableCell>
            <TableCell>
              {onReview && <Button size="small" onClick={() => onReview(report)}>Review</Button>}
              {onDismiss && <Button size="small" appearance="subtle" onClick={() => onDismiss(report)}>Dismiss</Button>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
