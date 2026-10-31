import * as React from 'react';
import { Text, Tooltip, makeStyles, tokens } from '@fluentui/react-components';
import { StarFilled, StarRegular } from '@fluentui/react-icons';
import { useStrings } from '../../hooks';
import { clamp } from '../../utilities';

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS
  },
  stars: {
    display: 'inline-flex',
    gap: '1px'
  },
  star: {
    color: tokens.colorPaletteYellowForeground2,
    fontSize: '16px'
  },
  starEmpty: {
    color: tokens.colorNeutralForeground4
  },
  count: {
    color: tokens.colorNeutralForeground3,
    marginLeft: tokens.spacingHorizontalXXS
  }
});

export interface IRatingDisplayProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  showCount?: boolean;
  ariaLabel?: string;
}

export const RatingDisplay: React.FC<IRatingDisplayProps> = ({
  rating,
  maxRating = 5,
  reviewCount,
  size = 'medium',
  showValue = false,
  showCount = true,
  ariaLabel
}) => {
  const strings = useStrings();
  const styles = useStyles();

  const normalizedRating = clamp(rating, 0, maxRating);
  const fullStars = Math.floor(normalizedRating);
  const hasHalf = normalizedRating - fullStars >= 0.5;

  const starSize = size === 'small' ? '12px' : size === 'large' ? '20px' : '16px';

  const resolvedAriaLabel = ariaLabel ?? `${normalizedRating.toFixed(1)} out of ${maxRating} stars${reviewCount !== undefined ? `, ${reviewCount} reviews` : ''}`;

  return (
    <div className={styles.root} role="img" aria-label={resolvedAriaLabel}>
      <span className={styles.stars} aria-hidden="true">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < fullStars || (i === fullStars && hasHalf);
          return filled ? (
            <StarFilled key={i} className={styles.star} style={{ fontSize: starSize }} />
          ) : (
            <StarRegular key={i} className={styles.starEmpty} style={{ fontSize: starSize }} />
          );
        })}
      </span>
      {showValue && (
        <Text size={200} weight="semibold">{normalizedRating.toFixed(1)}</Text>
      )}
      {showCount && reviewCount !== undefined && (
        <Tooltip content={strings.reviews.reviewCount.replace('{count}', String(reviewCount))} relationship="label">
          <Text className={styles.count} size={200}>
            ({reviewCount})
          </Text>
        </Tooltip>
      )}
    </div>
  );
};
