import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@fluentui/react-components';

export interface IConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  intent?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<IConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  intent = 'info'
}) => (
  <Dialog open={open} onOpenChange={(_, d) => !d.open && onCancel()}>
    <DialogSurface>
      <DialogBody>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button appearance="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button appearance="primary" onClick={onConfirm} {...(intent === 'danger' ? { style: { backgroundColor: 'var(--colorPaletteRedBackground3)' } } : {})}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);
