import * as React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  Text,
  Badge,
  Divider
} from '@fluentui/react-components';
import { DismissRegular, HeartRegular, HeartFilled, MailRegular, LinkRegular } from '@fluentui/react-icons';
import { StatusBadge } from '../../controls';
import { useLocalization, useAppContext } from '../../hooks';
import { IListing } from '../../interfaces';
import { formatListingDisplay, formatListingPrice, formatRelativeDate } from '../../helpers';
import { AppIcons } from '../../icons';
import styles from './ListingDetailPanel.module.scss';

export interface IListingDetailPanelProps {
  open: boolean;
  listing?: IListing;
  onDismiss: () => void;
  onViewFull?: (listing: IListing) => void;
  onContactSeller?: (listing: IListing) => void;
  onToggleFavorite?: (listing: IListing) => void;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
}

export const ListingDetailPanel: React.FC<IListingDetailPanelProps> = ({
  open,
  listing,
  onDismiss,
  onViewFull,
  onContactSeller,
  onToggleFavorite,
  isFavorite = false,
  favoriteLoading = false
}) => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { locale } = useAppContext();

  if (!listing) {
    return (
      <Drawer
        type="overlay"
        separator
        open={open}
        onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}
        position="end"
        size="medium"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button appearance="subtle" aria-label={s.common.close} icon={<DismissRegular />} onClick={onDismiss} />
            }
          >
            {s.listings.viewDetails}
          </DrawerHeaderTitle>
        </DrawerHeader>
      </Drawer>
    );
  }

  const priceDisplay = formatListingPrice(listing, locale, s);
  const locationDisplay = formatListingDisplay(listing).location;
  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls[0];

  return (
    <Drawer
      type="overlay"
      separator
      open={open}
      onOpenChange={(_, data) => { if (!data.open) onDismiss(); }}
      position="end"
      size="medium"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button appearance="subtle" aria-label={s.common.close} icon={<DismissRegular />} onClick={onDismiss} />
          }
        >
          {s.listings.viewDetails}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.panel}>
          <div className={styles.header}>
            {imageUrl ? (
              <img src={imageUrl} alt="" className={styles.image} />
            ) : (
              <div className={styles.noImage} aria-hidden="true">
                <AppIcons name="Image" />
              </div>
            )}
            <Text weight="semibold" size={500}>{listing.title}</Text>
            <span className={styles.price}>{priceDisplay}</span>
            <div className={styles.meta}>
              <StatusBadge status={listing.status} size="small" />
              {listing.categoryName && <Badge appearance="outline">{listing.categoryName}</Badge>}
              {listing.condition && <Badge appearance="outline">{listing.condition}</Badge>}
              {listing.isFeatured && <Badge appearance="filled" color="brand">{s.listings.featured}</Badge>}
            </div>
          </div>

          <Divider />

          <div className={styles.stats}>
            <span className={styles.stat}>
              <AppIcons name="Eye" />
              {listing.viewCount} {s.listings.views}
            </span>
            <span className={styles.stat}>
              <AppIcons name="Heart" />
              {listing.favoriteCount} {s.listings.favorites}
            </span>
            {listing.publishedOn && (
              <Text size={200}>{formatRelativeDate(listing.publishedOn)}</Text>
            )}
          </div>

          {locationDisplay && (
            <Text size={200}>{s.listings.location}: {locationDisplay}</Text>
          )}

          <Text className={styles.description}>{listing.description}</Text>

          {listing.sellerDisplayName && (
            <Text size={200}>{s.listings.seller}: {listing.sellerDisplayName}</Text>
          )}
        </div>
      </DrawerBody>

      <DrawerFooter>
        <div className={styles.actions}>
          {onToggleFavorite && (
            <Button
              appearance="secondary"
              icon={isFavorite ? <HeartFilled /> : <HeartRegular />}
              onClick={() => onToggleFavorite(listing)}
              disabled={favoriteLoading}
            >
              {isFavorite ? s.listings.removeFromFavorites : s.listings.addToFavorites}
            </Button>
          )}
          {onContactSeller && (
            <Button appearance="secondary" icon={<MailRegular />} onClick={() => onContactSeller(listing)}>
              {s.listings.contactSeller}
            </Button>
          )}
          {onViewFull && (
            <Button appearance="primary" icon={<LinkRegular />} onClick={() => onViewFull(listing)}>
              {s.listings.viewDetails}
            </Button>
          )}
        </div>
      </DrawerFooter>
    </Drawer>
  );
};

export default ListingDetailPanel;
