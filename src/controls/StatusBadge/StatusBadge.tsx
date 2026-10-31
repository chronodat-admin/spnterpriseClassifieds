import * as React from 'react';
import { Badge, Tooltip } from '@fluentui/react-components';
import { LISTING_STATUS } from '../../constants';
import { ListingStatus } from '../../interfaces';
import { useStrings } from '../../hooks';

export interface IStatusBadgeProps {
  status: ListingStatus;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showTooltip?: boolean;
}

type BadgeColor = 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning';

const STATUS_COLORS: Record<ListingStatus, BadgeColor> = {
  [LISTING_STATUS.Draft]: 'subtle',
  [LISTING_STATUS.Pending]: 'warning',
  [LISTING_STATUS.Approved]: 'success',
  [LISTING_STATUS.Rejected]: 'danger',
  [LISTING_STATUS.Expired]: 'subtle',
  [LISTING_STATUS.Archived]: 'subtle',
  [LISTING_STATUS.Reserved]: 'informative',
  [LISTING_STATUS.Sold]: 'brand'
};

export const StatusBadge: React.FC<IStatusBadgeProps> = ({
  status,
  size = 'medium',
  showTooltip = true
}) => {
  const strings = useStrings();

  const labelMap: Record<ListingStatus, string> = {
    [LISTING_STATUS.Draft]: strings.listings.status.draft,
    [LISTING_STATUS.Pending]: strings.listings.status.pending,
    [LISTING_STATUS.Approved]: strings.listings.status.approved,
    [LISTING_STATUS.Rejected]: strings.listings.status.rejected,
    [LISTING_STATUS.Expired]: strings.listings.status.expired,
    [LISTING_STATUS.Archived]: strings.listings.status.archived,
    [LISTING_STATUS.Reserved]: strings.listings.status.reserved,
    [LISTING_STATUS.Sold]: strings.listings.status.sold
  };

  const label = labelMap[status] ?? status;
  const color = STATUS_COLORS[status] ?? 'subtle';

  const badge = (
    <Badge appearance="filled" color={color} size={size} aria-label={`Status: ${label}`}>
      {label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <Tooltip content={label} relationship="label">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};
