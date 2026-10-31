import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text
} from '@fluentui/react-components';
import { useStrings } from '../../hooks';

export interface IConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmAppearance?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'transparent';
  destructive?: boolean;
  /** Alias for destructive styling */
  intent?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<IConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmAppearance = 'primary',
  destructive = false,
  intent,
  loading = false,
  onConfirm,
  onCancel
}) => {
  const strings = useStrings();
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async (): Promise<void> => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  const isDestructive = destructive || intent === 'danger';

  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onCancel(); }}>
      <DialogSurface aria-describedby="confirm-dialog-message">
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Text id="confirm-dialog-message">{message}</Text>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={onCancel}
              disabled={confirming || loading}
            >
              {cancelLabel ?? strings.common.cancel}
            </Button>
            <Button
              appearance={isDestructive ? 'primary' : confirmAppearance}
              onClick={handleConfirm}
              disabled={confirming || loading}
              aria-busy={confirming || loading}
            >
              {confirmLabel ?? strings.common.confirm}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
