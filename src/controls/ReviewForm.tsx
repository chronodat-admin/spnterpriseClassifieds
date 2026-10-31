import * as React from 'react';
import { Field, Textarea, Button, makeStyles, tokens } from '@fluentui/react-components';
import { RatingStars } from './RatingStars';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }
});

export interface IReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  submitLabel?: string;
  ratingLabel?: string;
  commentLabel?: string;
  commentPlaceholder?: string;
  loading?: boolean;
}

export const ReviewForm: React.FC<IReviewFormProps> = ({
  onSubmit,
  submitLabel = 'Submit review',
  ratingLabel = 'Rating',
  commentLabel = 'Comment',
  commentPlaceholder = 'Share your experience...',
  loading
}) => {
  const classes = useStyles();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const handleSubmit = (): void => {
    if (rating < 1 || !comment.trim()) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  };

  return (
    <div className={classes.root}>
      <Field label={ratingLabel}>
        <RatingStars value={rating} interactive onChange={setRating} />
      </Field>
      <Field label={commentLabel}>
        <Textarea
          value={comment}
          onChange={(_, d) => setComment(d.value)}
          placeholder={commentPlaceholder}
          resize="vertical"
        />
      </Field>
      <Button
        appearance="primary"
        onClick={handleSubmit}
        disabled={rating < 1 || !comment.trim() || loading}
      >
        {submitLabel}
      </Button>
    </div>
  );
};
