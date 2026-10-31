import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
  Spinner
} from '@fluentui/react-components';
import { IListing } from '../../interfaces';
import { useStrings, useNotifications, useAppContext, usePermissions } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services';
import { formatCurrency } from '../../utilities';

interface IListingService {
  reserve(id: number, reservedBy?: string): Promise<IListing>;
}

export interface IReserveDialogProps {
  open: boolean;
  listing: IListing;
  onDismiss: () => void;
  onReserved?: (listing: IListing) => void;
}

export const ReserveDialog: React.FC<IReserveDialogProps> = ({
  open,
  listing,
  onDismiss,
  onReserved
}) => {
  const strings = useStrings();
  const { success, error } = useNotifications();
  const { userId, userDisplayName, serviceContainerReady } = useAppContext();
  const { canReserve } = usePermissions(listing);

  const [submitting, setSubmitting] = React.useState(false);

  const priceDisplay = listing.isDonation
    ? strings.listings.free
    : formatCurrency(listing.price, listing.currency);

  const handleReserve = async (): Promise<void> => {
    if (!canReserve(listing)) {
      error(strings.permissions.insufficientPermissions);
      return;
    }

    setSubmitting(true);
    try {
      if (serviceContainerReady) {
        const service = ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService);
        const updated = await service.reserve(listing.id, userId);
        success(strings.listings.reserveListing, listing.title);
        onReserved?.(updated);
      }
      onDismiss();
    } catch {
      error(strings.errors.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}>
      <DialogSurface aria-describedby="reserve-dialog-description">
        <DialogBody>
          <DialogTitle>{strings.listings.reserveListing}</DialogTitle>
          <DialogContent id="reserve-dialog-description">
            <Text block weight="semibold">{listing.title}</Text>
            <Text block style={{ marginTop: 8 }}>{priceDisplay}</Text>
            <Text block style={{ marginTop: 16, color: 'var(--colorNeutralForeground3)' }}>
              {strings.common.confirm}: Reserve this listing as {userDisplayName}?
            </Text>
            {listing.reservedBy && (
              <Text block style={{ marginTop: 8, color: 'var(--colorPaletteRedForeground1)' }} role="alert">
                {strings.listings.reservedBy}: {listing.reservedBy}
              </Text>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onDismiss} disabled={submitting}>
              {strings.common.cancel}
            </Button>
            <Button
              appearance="primary"
              onClick={handleReserve}
              disabled={submitting || !canReserve(listing) || !!listing.reservedBy}
              aria-busy={submitting}
            >
              {submitting ? <Spinner size="tiny" /> : strings.listings.reserveListing}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
