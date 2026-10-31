import * as React from 'react';
import {
  Card,
  Avatar,
  Text,
  Button,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ChatRegular } from '@fluentui/react-icons';
import { IUserProfile } from '../../interfaces';
import { RatingDisplay } from '../../controls/RatingDisplay/RatingDisplay';
import { useStrings } from '../../hooks';
import { getInitials } from '../../utilities';

const useStyles = makeStyles({
  card: {
    height: '100%'
  },
  header: {
    display: 'flex',
    gap: tokens.spacingHorizontalM
  },
  info: {
    flex: 1
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalS
  },
  stat: {
    textAlign: 'center'
  },
  statValue: {
    fontWeight: tokens.fontWeightSemibold
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200
  },
  actions: {
    marginTop: tokens.spacingVerticalM
  }
});

export interface ISellerCardProps {
  seller: IUserProfile;
  photoUrl?: string;
  onContact?: (seller: IUserProfile) => void;
  onViewProfile?: (seller: IUserProfile) => void;
  contactLabel?: string;
  labels?: { listings: string; sold: string; reviews: string };
}

export const SellerCard: React.FC<ISellerCardProps> = ({
  seller,
  photoUrl,
  onContact,
  onViewProfile,
  contactLabel,
  labels
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const statLabels = labels ?? {
    listings: strings.sellerProfile.listings,
    sold: strings.sellerProfile.soldCount.replace('{count}', ''),
    reviews: strings.sellerProfile.reviews
  };

  return (
    <Card className={styles.card} aria-label={`Seller: ${seller.displayName}`}>
      <div className={styles.header}>
        <Avatar
          name={seller.displayName}
          image={photoUrl ? { src: photoUrl } : undefined}
          initials={getInitials(seller.displayName)}
          size={64}
        />
        <div className={styles.info}>
          <Text weight="semibold" size={400} block>{seller.displayName}</Text>
          {seller.jobTitle && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>
              {seller.jobTitle}
            </Text>
          )}
          {seller.department && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>
              {seller.department}
            </Text>
          )}
          {seller.rating !== undefined && (
            <RatingDisplay
              rating={seller.rating}
              reviewCount={seller.reviewCount}
              size="small"
            />
          )}
        </div>
      </div>

      <div className={styles.stats} role="group" aria-label="Seller statistics">
        <div className={styles.stat}>
          <Text className={styles.statValue} block>{seller.listingCount ?? 0}</Text>
          <Text className={styles.statLabel}>{statLabels.listings}</Text>
        </div>
        <div className={styles.stat}>
          <Text className={styles.statValue} block>{seller.soldCount ?? 0}</Text>
          <Text className={styles.statLabel}>{statLabels.sold}</Text>
        </div>
        <div className={styles.stat}>
          <Text className={styles.statValue} block>{seller.reviewCount ?? 0}</Text>
          <Text className={styles.statLabel}>{statLabels.reviews}</Text>
        </div>
      </div>

      <div className={styles.actions}>
        {onContact && (
          <Button
            appearance="primary"
            icon={<ChatRegular />}
            onClick={() => onContact(seller)}
            aria-label={strings.sellerProfile.contactSeller}
          >
            {contactLabel ?? strings.sellerProfile.contactSeller}
          </Button>
        )}
        {onViewProfile && (
          <Button
            appearance="subtle"
            onClick={() => onViewProfile(seller)}
            aria-label={`View ${seller.displayName} profile`}
          >
            {strings.listings.viewDetails}
          </Button>
        )}
      </div>
    </Card>
  );
};
