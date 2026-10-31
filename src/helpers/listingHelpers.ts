import { LISTING_STATUS } from '../constants';
import { IListing, ListingStatus } from '../interfaces';
import { IAppStrings } from '../localization/en-us';
import { formatCurrency, truncateText } from '../utilities';

export type ListingBadgeColor =
  | 'brand'
  | 'danger'
  | 'important'
  | 'informative'
  | 'severe'
  | 'subtle'
  | 'success'
  | 'warning';

const STATUS_COLORS: Record<ListingStatus, ListingBadgeColor> = {
  [LISTING_STATUS.Draft]: 'subtle',
  [LISTING_STATUS.Pending]: 'warning',
  [LISTING_STATUS.Approved]: 'success',
  [LISTING_STATUS.Rejected]: 'danger',
  [LISTING_STATUS.Expired]: 'subtle',
  [LISTING_STATUS.Archived]: 'subtle',
  [LISTING_STATUS.Reserved]: 'informative',
  [LISTING_STATUS.Sold]: 'brand'
};

export interface IListingDisplayInfo {
  title: string;
  price: string;
  location: string;
  statusLabel: string;
  statusColor: ListingBadgeColor;
  sellerName: string;
  categoryName: string;
}

export function getStatusColor(status: ListingStatus): ListingBadgeColor {
  return STATUS_COLORS[status] ?? 'subtle';
}

export function getStatusLabel(status: ListingStatus, strings: IAppStrings): string {
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
  return labelMap[status] ?? status;
}

export function formatListingPrice(
  listing: Pick<IListing, 'price' | 'currency' | 'isDonation' | 'isNegotiable'>,
  locale = 'en-US',
  strings?: IAppStrings
): string {
  if (listing.isDonation) {
    return strings?.listings.donation ?? strings?.listings.free ?? 'Free';
  }
  if (listing.price > 0) {
    return formatCurrency(listing.price, listing.currency, locale);
  }
  return strings?.listings.negotiable ?? 'Negotiable';
}

export function formatListingLocation(
  listing: Pick<IListing, 'locationName' | 'building' | 'city' | 'country' | 'office'>
): string {
  const parts = [
    listing.locationName,
    listing.building,
    listing.city,
    listing.country,
    listing.office
  ].filter(Boolean);
  return parts.join(', ');
}

export function formatListingDisplay(
  listing: IListing,
  locale = 'en-US',
  strings?: IAppStrings,
  titleMaxLength = 80
): IListingDisplayInfo {
  return {
    title: truncateText(listing.title, titleMaxLength),
    price: formatListingPrice(listing, locale, strings),
    location: formatListingLocation(listing),
    statusLabel: strings ? getStatusLabel(listing.status, strings) : listing.status,
    statusColor: getStatusColor(listing.status),
    sellerName: listing.sellerDisplayName ?? strings?.common.unknown ?? 'Unknown',
    categoryName: listing.categoryName ?? strings?.listings.category ?? 'Category'
  };
}

export function isListingActive(listing: IListing): boolean {
  return listing.status === LISTING_STATUS.Approved || listing.status === LISTING_STATUS.Reserved;
}

export function isListingEditable(listing: IListing): boolean {
  return listing.status === LISTING_STATUS.Draft
    || listing.status === LISTING_STATUS.Pending
    || listing.status === LISTING_STATUS.Approved
    || listing.status === LISTING_STATUS.Rejected;
}
