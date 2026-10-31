import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { IReview } from '../interfaces';
import { ReviewCard } from '../cards/ReviewCard';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  header: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM }
});

export interface IReviewListProps {
  reviews: IReview[];
  averageRating?: number;
  emptyMessage?: string;
}

export const ReviewList: React.FC<IReviewListProps> = ({ reviews, averageRating, emptyMessage }) => {
  const classes = useStyles();
  if (reviews.length === 0) {
    return emptyMessage ? <Text>{emptyMessage}</Text> : null;
  }
  return (
    <div className={classes.root}>
      {averageRating !== undefined && (
        <div className={classes.header}>
          <Text weight="semibold">{averageRating.toFixed(1)}</Text>
          <Text size={200}>({reviews.length} reviews)</Text>
        </div>
      )}
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};
