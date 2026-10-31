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
  Field,
  Text
} from '@fluentui/react-components';
import { CopyRegular, MailRegular, LinkRegular } from '@fluentui/react-icons';
import { ROUTES } from '../../constants';
import { useStrings, useNotifications } from '../../hooks';

export interface IShareDialogProps {
  open: boolean;
  listingId: number;
  listingTitle: string;
  onDismiss: () => void;
}

export const ShareDialog: React.FC<IShareDialogProps> = ({
  open,
  listingId,
  listingTitle,
  onDismiss
}) => {
  const strings = useStrings();
  const { success, info } = useNotifications();

  const shareUrl = React.useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#${ROUTES.ListingDetail.replace(':id', String(listingId))}`;
  }, [listingId]);

  const mailtoLink = `mailto:?subject=${encodeURIComponent(listingTitle)}&body=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      success(strings.common.linkCopied);
    } catch {
      info(strings.common.copyLink, shareUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}>
      <DialogSurface aria-describedby="share-dialog-description">
        <DialogBody>
          <DialogTitle>{strings.listings.shareListing}</DialogTitle>
          <DialogContent id="share-dialog-description">
            <Text block style={{ marginBottom: 12 }}>{listingTitle}</Text>
            <Field label={strings.common.copyLink}>
              <Input
                value={shareUrl}
                readOnly
                contentAfter={
                  <Button
                    appearance="subtle"
                    icon={<CopyRegular />}
                    onClick={handleCopyLink}
                    aria-label={strings.common.copyLink}
                  />
                }
                aria-label="Share link"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onDismiss}>
              {strings.common.close}
            </Button>
            <Button
              appearance="primary"
              icon={<CopyRegular />}
              onClick={handleCopyLink}
            >
              {strings.common.copyLink}
            </Button>
            <Button
              appearance="subtle"
              icon={<MailRegular />}
              onClick={() => { window.location.href = mailtoLink; }}
              aria-label={strings.common.share}
            >
              Email
            </Button>
            <Button
              appearance="subtle"
              icon={<LinkRegular />}
              onClick={handleCopyLink}
            >
              {strings.common.share}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
