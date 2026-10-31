import * as React from 'react';
import { Skeleton, SkeletonItem, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, padding: tokens.spacingHorizontalL }
});

export interface ILoadingSkeletonProps {
  rows?: number;
  variant?: 'page' | 'card' | 'list';
}

export const LoadingSkeleton: React.FC<ILoadingSkeletonProps> = ({ rows = 3, variant = 'page' }) => {
  const classes = useStyles();
  if (variant === 'card') {
    return (
      <Skeleton aria-label="Loading">
        <SkeletonItem shape="rectangle" size={128} />
        <SkeletonItem size={16} />
        <SkeletonItem size={12} />
      </Skeleton>
    );
  }
  return (
    <div className={classes.root} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i}>
          <SkeletonItem size={24} />
          <SkeletonItem size={16} />
        </Skeleton>
      ))}
    </div>
  );
};
