import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Dropdown,
  Option,
  Textarea
} from '@fluentui/react-components';
import { ReportType } from '../interfaces';

export interface IReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reportType: ReportType, reason: string) => void;
  labels: {
    title: string;
    reportType: string;
    reason: string;
    submit: string;
    cancel: string;
    types: Record<string, string>;
  };
  loading?: boolean;
}

export const ReportDialog: React.FC<IReportDialogProps> = ({
  open,
  onClose,
  onSubmit,
  labels,
  loading
}) => {
  const [reportType, setReportType] = React.useState<ReportType>('Other');
  const [reason, setReason] = React.useState('');

  const handleSubmit = (): void => {
    if (!reason.trim()) return;
    onSubmit(reportType, reason.trim());
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogContent>
            <Field label={labels.reportType}>
              <Dropdown
                selectedOptions={[reportType]}
                onOptionSelect={(_, d) => setReportType((d.optionValue as ReportType) ?? 'Other')}
              >
                {Object.entries(labels.types).map(([key, label]) => (
                  <Option key={key} value={key.charAt(0).toUpperCase() + key.slice(1)} text={label}>
                    {label}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label={labels.reason}>
              <Textarea value={reason} onChange={(_, d) => setReason(d.value)} resize="vertical" />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>{labels.cancel}</Button>
            <Button appearance="primary" onClick={handleSubmit} disabled={!reason.trim() || loading}>{labels.submit}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
