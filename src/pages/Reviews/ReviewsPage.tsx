import * as React from 'react';
import { PageLayout } from '../../layouts';
import { ReviewList, LoadingSkeleton } from '../../controls';
import { useLocalization, useAppContext } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { IReview } from '../../interfaces';

interface IReviewService {
  getBySeller(sellerId: string): Promise<IReview[]>;
  getAverageRating(sellerId: string): Promise<number>;
  create(review: { listingId: number; sellerId: string; rating: number; comment: string }): Promise<IReview>;
}

export const ReviewsPage: React.FC = () => {
  const { userId } = useAppContext();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  const [reviews, setReviews] = React.useState<IReview[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;
    const service = ServiceContainer.getInstance().resolve<IReviewService>(SERVICE_KEYS.ReviewService);
    Promise.all([service.getBySeller(userId), service.getAverageRating(userId)])
      .then(([revs, avg]) => { setReviews(revs); setAvgRating(avg); })
      .finally(() => setIsLoading(false))
      .catch(() => undefined);
  }, [userId]);

  return (
    <PageLayout title={s.reviews.title}>
      {isLoading ? <LoadingSkeleton rows={4} /> : (
        <ReviewList reviews={reviews} averageRating={avgRating} emptyMessage={s.reviews.noReviews} />
      )}
    </PageLayout>
  );
};

export default ReviewsPage;
