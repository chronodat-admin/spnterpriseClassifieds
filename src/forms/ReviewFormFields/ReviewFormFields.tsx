import * as React from 'react';
import { Field, Textarea } from '@fluentui/react-components';
import { RatingStars } from '../../controls';
import { useStrings } from '../../hooks';
import styles from './ReviewFormFields.module.scss';

export interface IReviewFormFieldsProps {
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  disabled?: boolean;
  errors?: { rating?: string; comment?: string };
}

export const ReviewFormFields: React.FC<IReviewFormFieldsProps> = ({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  disabled = false,
  errors
}) => {
  const strings = useStrings();

  return (
    <div className={styles.fields}>
      <Field
        label={strings.reviews.rating}
        required
        validationMessage={errors?.rating}
        validationState={errors?.rating ? 'error' : 'none'}
      >
        <RatingStars
          value={rating}
          interactive={!disabled}
          onChange={disabled ? undefined : onRatingChange}
        />
      </Field>

      <Field
        label={strings.reviews.comment}
        required
        validationMessage={errors?.comment}
        validationState={errors?.comment ? 'error' : 'none'}
      >
        <Textarea
          value={comment}
          onChange={(_, d) => onCommentChange(d.value)}
          placeholder={strings.reviews.comment}
          resize="vertical"
          rows={4}
          disabled={disabled}
        />
      </Field>
    </div>
  );
};

export default ReviewFormFields;
