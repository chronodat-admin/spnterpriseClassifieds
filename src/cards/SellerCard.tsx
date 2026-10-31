import * as React from 'react';
import { Card, Text, Avatar, Button, makeStyles, tokens } from '@fluentui/react-components';
import { Mail24Regular } from '@fluentui/react-icons';
import { IUserProfile } from '../interfaces';
import { RatingStars } from '../controls/RatingStars';
import { getInitials } from '../utilities';

const useStyles = makeStyles({
  root: { padding: tokens.spacingHorizontalL },
  header: { display: 'flex', gap: tokens.spacingHorizontalM, alignItems: 'center', marginBottom: tokens.spacingVerticalM },
  stats: { display: 'flex', gap: tokens.spacingHorizontalL, marginTop: tokens.spacingVerticalM }
});

export interface ISellerCardProps {
  seller: IUserProfile;
  onContact?: () => void;
  contactLabel?: string;
  labels?: { listings: string; sold: string; reviews: string };
}

export const SellerCard: React.FC<ISellerCardProps> = ({
  seller,
  onContact,
  contactLabel = 'Contact seller',
  labels = { listings: 'Listings', sold: 'Sold', reviews: 'Reviews' }
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <div className={classes.header}>
        <Avatar name={seller.displayName} image={seller.photoUrl ? { src: seller.photoUrl } : undefined} initials={getInitials(seller.displayName)} size={56} />
        <div>
          <Text weight="semibold" size={500}>{seller.displayName}</Text>
          {seller.jobTitle && <Text size={200}>{seller.jobTitle}</Text>}
          {seller.department && <Text size={200}>{seller.department}</Text>}
          {seller.rating !== undefined && (
            <RatingStars value={seller.rating} />
          )}
        </div>
      </div>
      {seller.bio && <Text>{seller.bio}</Text>}
      <div className={classes.stats}>
        <Text size={200}>{seller.listingCount ?? 0} {labels.listings}</Text>
        <Text size={200}>{seller.soldCount ?? 0} {labels.sold}</Text>
        <Text size={200}>{seller.reviewCount ?? 0} {labels.reviews}</Text>
      </div>
      {onContact && (
        <Button appearance="primary" icon={<Mail24Regular />} onClick={onContact} style={{ marginTop: 12 }}>
          {contactLabel}
        </Button>
      )}
    </Card>
  );
};
