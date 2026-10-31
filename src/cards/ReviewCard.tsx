import * as React from 'react';
import { Card, Text, Avatar, makeStyles, tokens } from '@fluentui/react-components';
import { IReview } from '../interfaces';
import { RatingStars } from '../controls/RatingStars';
import { formatRelativeDate, getInitials } from '../utilities';

const useStyles = makeStyles({
  root: { padding: tokens.spacingHorizontalM },
  header: { display: 'flex', gap: tokens.spacingHorizontalS, alignItems: 'center', marginBottom: tokens.spacingVerticalS }
});

export interface IReviewCardProps {
  review: IReview;
}

export const ReviewCard: React.FC<IReviewCardProps> = ({ review }) => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <div className={classes.header}>
        <Avatar name={review.reviewerDisplayName ?? review.reviewerId} initials={getInitials(review.reviewerDisplayName ?? review.reviewerId)} size={32} />
        <div>
          <Text weight="semibold">{review.reviewerDisplayName ?? review.reviewerId}</Text>
          <RatingStars value={review.rating} size={16} />
        </div>
        <Text size={100} style={{ marginLeft: 'auto' }}>{formatRelativeDate(review.created)}</Text>
      </div>
      <Text>{review.comment}</Text>
    </Card>
  );
};
