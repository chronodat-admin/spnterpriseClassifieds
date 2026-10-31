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
  Textarea,
  Spinner
} from '@fluentui/react-components';
import { ReportType } from '../../interfaces';
import { useStrings, useNotifications, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services';

interface IReportRepository {
  create(entity: Partial<{
    listingId: number;
    reporterId: string;
    reportType: ReportType;
    reason: string;
    status: string;
  }>): Promise<unknown>;
}

export interface IReportDialogProps {
  open: boolean;
  listingId: number;
  listingTitle?: string;
  onDismiss: () => void;
  onSubmitted?: () => void;
}

const REPORT_TYPES: ReportType[] = ['Spam', 'Duplicate', 'Fraud', 'Inappropriate', 'Other'];

export const ReportDialog: React.FC<IReportDialogProps> = ({
  open,
  listingId,
  listingTitle,
  onDismiss,
  onSubmitted
}) => {
  const strings = useStrings();
  const { success, error } = useNotifications();
  const { userId, serviceContainerReady } = useAppContext();

  const [reportType, setReportType] = React.useState<ReportType>('Spam');
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (open) {
      setReportType('Spam');
      setReason('');
      setValidationError(undefined);
    }
  }, [open]);

  const typeLabels: Record<ReportType, string> = {
    Spam: strings.reports.types.spam,
    Duplicate: strings.reports.types.duplicate,
    Fraud: strings.reports.types.fraud,
    Inappropriate: strings.reports.types.inappropriate,
    Other: strings.reports.types.other
  };

  const handleSubmit = async (): Promise<void> => {
    if (!reason.trim()) {
      setValidationError(strings.createWizard.validation.descriptionRequired);
      return;
    }

    setSubmitting(true);
    setValidationError(undefined);

    try {
      if (serviceContainerReady) {
        const repo = ServiceContainer.getInstance().resolve<IReportRepository>(SERVICE_KEYS.ReportRepository);
        await repo.create({
          listingId,
          reporterId: userId,
          reportType,
          reason: reason.trim(),
          status: 'Pending'
        });
      }
      success(strings.reports.reportSubmitted);
      onSubmitted?.();
      onDismiss();
    } catch {
      error(strings.errors.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}>
      <DialogSurface aria-describedby="report-dialog-description">
        <DialogBody>
          <DialogTitle>{strings.reports.reportListing}</DialogTitle>
          <DialogContent id="report-dialog-description">
            {listingTitle && <p>{listingTitle}</p>}
            <Field label={strings.reports.reportType} required>
              <Dropdown
                value={typeLabels[reportType]}
                selectedOptions={[reportType]}
                onOptionSelect={(_, data) => {
                  if (data.optionValue) setReportType(data.optionValue as ReportType);
                }}
                aria-label={strings.reports.reportType}
              >
                {REPORT_TYPES.map(type => (
                  <Option key={type} value={type} text={typeLabels[type]}>
                    {typeLabels[type]}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field
              label={strings.reports.reason}
              required
              validationMessage={validationError}
              validationState={validationError ? 'error' : 'none'}
            >
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                rows={4}
                aria-label={strings.reports.reason}
                aria-required="true"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onDismiss} disabled={submitting}>
              {strings.common.cancel}
            </Button>
            <Button appearance="primary" onClick={handleSubmit} disabled={submitting} aria-busy={submitting}>
              {submitting ? <Spinner size="tiny" /> : strings.reports.submitReport}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
