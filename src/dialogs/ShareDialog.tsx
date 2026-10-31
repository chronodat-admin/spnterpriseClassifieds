import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field
} from '@fluentui/react-components';
import { Copy24Regular } from '@fluentui/react-icons';
import { useNotifications } from '../hooks/useNotifications';

export interface IShareDialogProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  copyLabel?: string;
  closeLabel?: string;
}

export const ShareDialog: React.FC<IShareDialogProps> = ({
  open,
  onClose,
  url,
  title = 'Share listing',
  copyLabel = 'Copy link',
  closeLabel = 'Close'
}) => {
  const { success } = useNotifications();

  const handleCopy = (): void => {
    navigator.clipboard.writeText(url).then(() => success('Link copied')).catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Field>
              <Input value={url} readOnly />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>{closeLabel}</Button>
            <Button appearance="primary" icon={<Copy24Regular />} onClick={handleCopy}>{copyLabel}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
