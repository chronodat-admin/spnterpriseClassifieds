import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, TabList, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { PageLayout } from '../../layouts';
import { LoadingSkeleton, ErrorState, ReviewList } from '../../controls';
import { SellerCard } from '../../cards';
import { ListingGrid } from '../../grids';
import { useLocalization, useMessages } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES } from '../../constants';
import { IListing, IUserProfile, IReview } from '../../interfaces';

interface IListingService {
  getBySeller(sellerId: string): Promise<IListing[]>;
}

interface IReviewService {
  getBySeller(sellerId: string): Promise<IReview[]>;
  getAverageRating(sellerId: string): Promise<number>;
}

interface IGraphService {
  getProfile(userId?: string): Promise<IUserProfile>;
}

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { sendMessage } = useMessages();

  const [profile, setProfile] = React.useState<IUserProfile | undefined>();
  const [listings, setListings] = React.useState<IListing[]>([]);
  const [reviews, setReviews] = React.useState<IReview[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [tab, setTab] = React.useState('listings');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>();

  React.useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const container = ServiceContainer.getInstance();
    Promise.all([
      container.resolve<IGraphService>(SERVICE_KEYS.GraphService).getProfile(id),
      container.resolve<IListingService>(SERVICE_KEYS.ListingService).getBySeller(id),
      container.resolve<IReviewService>(SERVICE_KEYS.ReviewService).getBySeller(id),
      container.resolve<IReviewService>(SERVICE_KEYS.ReviewService).getAverageRating(id)
    ])
      .then(([prof, list, rev, avg]) => {
        setProfile(prof ?? { id, displayName: id, email: '', listingCount: list.length, reviewCount: rev.length, rating: avg });
        setListings(list);
        setReviews(rev);
        setAvgRating(avg);
      })
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState message={error.message} />;
  if (!profile) return <ErrorState message={s.errors.notFound} />;

  const handleContact = async (): Promise<void> => {
    await sendMessage(profile.id, `Hi ${profile.displayName}, I saw your profile on Enterprise Classifieds.`);
    navigate(ROUTES.Messages);
  };

  return (
    <PageLayout title={profile.displayName} subtitle={s.sellerProfile.title}>
      <SellerCard
        seller={{ ...profile, rating: avgRating, reviewCount: reviews.length, listingCount: listings.length }}
        onContact={handleContact}
        contactLabel={s.sellerProfile.contactSeller}
        labels={{ listings: s.sellerProfile.listings, sold: s.sellerProfile.soldCount, reviews: s.sellerProfile.reviewCount }}
      />

      <TabList selectedValue={tab} onTabSelect={(_: SelectTabEvent, d: SelectTabData) => typeof d.value === 'string' && setTab(d.value)}>
        <Tab value="listings">{s.sellerProfile.listings}</Tab>
        <Tab value="reviews">{s.sellerProfile.reviews}</Tab>
      </TabList>

      {tab === 'listings' && (
        <ListingGrid
          listings={listings}
          viewMode="grid"
          onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
          emptyTitle={s.listings.noListings}
        />
      )}
      {tab === 'reviews' && (
        <ReviewList reviews={reviews} averageRating={avgRating} emptyMessage={s.reviews.noReviews} />
      )}
    </PageLayout>
  );
};

export default SellerProfilePage;
