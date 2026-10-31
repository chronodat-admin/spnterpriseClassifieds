import * as React from 'react';
import { Skeleton, SkeletonItem } from '@fluentui/react-components';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM
  },
  row: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalM
  },
  listItem: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS
  }
});

export type SkeletonVariant = 'text' | 'card' | 'list' | 'grid' | 'avatar' | 'detail';

export interface ILoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  /** Alias for count */
  rows?: number;
  ariaLabel?: string;
}

export const LoadingSkeleton: React.FC<ILoadingSkeletonProps> = ({
  variant = 'text',
  count,
  rows,
  ariaLabel = 'Loading content'
}) => {
  const itemCount = rows ?? count ?? 1;
  const styles = useStyles();

  const renderSingle = (key: number): React.ReactElement => {
    switch (variant) {
      case 'card':
        return (
          <div key={key} className={styles.card} aria-hidden="true">
            <SkeletonItem shape="rectangle" size={128} />
            <SkeletonItem size={16} />
            <SkeletonItem size={12} />
            <SkeletonItem size={12} style={{ width: '60%' }} />
          </div>
        );
      case 'list':
        return (
          <div key={key} className={styles.listItem} aria-hidden="true">
            <SkeletonItem shape="circle" size={40} />
            <div style={{ flex: 1 }}>
              <SkeletonItem size={16} />
              <SkeletonItem size={12} style={{ width: '80%', marginTop: 4 }} />
            </div>
          </div>
        );
      case 'grid':
        return (
          <div key={key} className={styles.card} aria-hidden="true">
            <SkeletonItem shape="rectangle" size={128} style={{ height: '160px' }} />
            <SkeletonItem size={16} />
            <SkeletonItem size={12} />
          </div>
        );
      case 'avatar':
        return (
          <div key={key} className={styles.row} aria-hidden="true">
            <SkeletonItem shape="circle" size={48} />
            <div style={{ flex: 1 }}>
              <SkeletonItem size={16} />
              <SkeletonItem size={12} style={{ width: '50%', marginTop: 4 }} />
            </div>
          </div>
        );
      case 'detail':
        return (
          <div key={key} className={styles.card} aria-hidden="true">
            <SkeletonItem shape="rectangle" size={128} style={{ height: '240px' }} />
            <SkeletonItem size={24} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} style={{ width: '70%' }} />
          </div>
        );
      default:
        return (
          <SkeletonItem key={key} size={16} aria-hidden="true" />
        );
    }
  };

  if (variant === 'grid') {
    return (
      <Skeleton aria-label={ariaLabel}>
        <div className={styles.grid}>
          {Array.from({ length: itemCount }, (_, i) => renderSingle(i))}
        </div>
      </Skeleton>
    );
  }

  return (
    <Skeleton aria-label={ariaLabel}>
      {Array.from({ length: itemCount }, (_, i) => renderSingle(i))}
    </Skeleton>
  );
};
