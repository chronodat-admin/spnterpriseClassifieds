import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Text,
  Badge,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  Share24Regular,
  Flag24Regular,
  Heart24Regular,
  Heart24Filled,
  Mail24Regular,
  Edit24Regular
} from '@fluentui/react-icons';
import { PageLayout, TwoColumnLayout } from '../../layouts';
import {
  LoadingSkeleton,
  ErrorState,
  ImageGallery,
  ImageZoom,
  Timeline,
  DocumentList,
  CommentSection,
  ReviewList,
  ReviewForm,
  ConfirmDialog
} from '../../controls';
import { SellerCard } from '../../cards';
import { ListingGrid } from '../../grids';
import { ShareDialog, ReportDialog, ReserveDialog } from '../../dialogs';
import {
  useListing,
  useFavorite,
  useLocalization,
  usePermissions,
  useMessages,
  useAppContext,
  useNotifications
} from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ImageService } from '../../services/ImageService';
import { ROUTES, LISTING_STATUS } from '../../constants';
import { IReview, ReportType, IListing } from '../../interfaces';
import { formatCurrency, formatDate } from '../../utilities';
import styles from './ListingDetailPage.module.scss';

const useStyles = makeStyles({
  meta: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalM },
  actions: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalL },
  price: { fontSize: '24px', fontWeight: tokens.fontWeightSemibold, color: tokens.colorBrandForeground1 }
});

interface IReviewService {
  getByListing(listingId: number): Promise<IReview[]>;
  create(review: { listingId: number; sellerId: string; rating: number; comment: string }): Promise<IReview>;
}

interface IReportRepository {
  create(report: Partial<import('../../interfaces').IReport>): Promise<import('../../interfaces').IReport>;
}

interface IListingService {
  getById(id: number): Promise<IListing | undefined>;
  search(filter: import('../../interfaces').IListingFilter, page: number, pageSize: number): Promise<import('../../interfaces').IPagedResult<IListing>>;
  incrementViewCount(id: number): Promise<void>;
  markSold(id: number): Promise<IListing>;
}

interface IActivityLogRepository {
  getByEntity(entityType: string, entityId: number): Promise<import('../../interfaces').IActivityLog[]>;
  log(entry: {
    userId: string;
    userDisplayName?: string;
    action: string;
    entityType: string;
    entityId: number;
    details?: string;
  }): Promise<import('../../interfaces').IActivityLog>;
}

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const listingId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const classes = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { userId, userDisplayName, webUrl } = useAppContext();
  const { success, error: showError } = useNotifications();

  const { listing, isLoading, error, refresh } = useListing(listingId);
  const { isFavorite, toggle, isToggling } = useFavorite(listingId);
  const permissions = usePermissions(listing);
  const { sendMessage } = useMessages();

  const [zoomIndex, setZoomIndex] = React.useState<number | undefined>();
  const [shareOpen, setShareOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reviews, setReviews] = React.useState<IReview[]>([]);
  const [related, setRelated] = React.useState<IListing[]>([]);
  const [timelineEvents, setTimelineEvents] = React.useState<Array<{ id: string | number; title: string; description?: string; date: Date | string }>>([]);
  const [comments, setComments] = React.useState<Array<{ id: string | number; author: string; body: string; created: Date | string }>>([]);
  const [documents, setDocuments] = React.useState<Array<{ id: string; name: string; url: string }>>([]);
  const [reserveOpen, setReserveOpen] = React.useState(false);
  const [soldOpen, setSoldOpen] = React.useState(false);
  const viewedListingId = React.useRef<number | undefined>();
  const documentInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!listingId || !listing) return;
    const container = ServiceContainer.getInstance();
    Promise.all([
      container.resolve<IReviewService>(SERVICE_KEYS.ReviewService).getByListing(listingId),
      container.resolve<IListingService>(SERVICE_KEYS.ListingService).search({ categoryId: listing.categoryId, status: LISTING_STATUS.Approved }, 1, 4),
      container.resolve<IActivityLogRepository>(SERVICE_KEYS.ActivityLogRepository).getByEntity('Listing', listingId),
      container.resolve<ImageService>(SERVICE_KEYS.ImageService).getAttachments(listingId)
    ]).then(([reviewData, relatedData, activityData, attachmentData]) => {
      setReviews(reviewData);
      setRelated(relatedData.items.filter(l => l.id !== listingId));
      setComments(activityData.filter(a => a.action === 'Comment').map(a => ({
        id: a.id,
        author: a.userDisplayName ?? a.userId,
        body: a.details ?? '',
        created: a.created
      })).reverse());
      setTimelineEvents(activityData.filter(a => a.action !== 'Comment').map(a => ({
        id: a.id,
        title: a.action,
        description: a.details,
        date: a.created
      })));
      setDocuments(attachmentData);
    }).catch(() => undefined);
  }, [listingId, listing]);

  React.useEffect(() => {
    if (!listingId || viewedListingId.current === listingId) return;
    viewedListingId.current = listingId;
    ServiceContainer.getInstance()
      .resolve<IListingService>(SERVICE_KEYS.ListingService)
      .incrementViewCount(listingId)
      .catch(() => undefined);
  }, [listingId]);

  const shareUrl = `${webUrl}${ROUTES.Listings}/${listingId}`;

  const handleReport = async (reportType: ReportType, reason: string): Promise<void> => {
    if (!listingId || !userId) return;
    const repo = ServiceContainer.getInstance().resolve<IReportRepository>(SERVICE_KEYS.ReportRepository);
    await repo.create({ listingId, reporterId: userId, reportType, reason, status: 'Pending' });
    setReportOpen(false);
  };

  const handleReview = async (rating: number, comment: string): Promise<void> => {
    if (!listing) return;
    const service = ServiceContainer.getInstance().resolve<IReviewService>(SERVICE_KEYS.ReviewService);
    const created = await service.create({ listingId: listing.id, sellerId: listing.sellerId, rating, comment });
    setReviews(prev => [created, ...prev]);
  };

  const handleComment = async (body: string): Promise<void> => {
    if (!listingId || !userId) return;
    const repo = ServiceContainer.getInstance().resolve<IActivityLogRepository>(SERVICE_KEYS.ActivityLogRepository);
    const created = await repo.log({
      userId,
      userDisplayName,
      action: 'Comment',
      entityType: 'Listing',
      entityId: listingId,
      details: body
    });
    setComments(prev => [...prev, {
      id: created.id,
      author: userDisplayName || userId,
      body,
      created: created.created
    }]);
  };

  const handleUploadDocument = async (file: File | undefined): Promise<void> => {
    if (!file || !listing) return;
    try {
      const imageService = ServiceContainer.getInstance().resolve<ImageService>(SERVICE_KEYS.ImageService);
      const uploaded = await imageService.uploadAttachment(listing.id, listing.sellerId, file);
      setDocuments(prev => [...prev, uploaded]);
      success(s.common.save);
    } catch (err) {
      showError(s.errors.saveFailed, err instanceof Error ? err.message : String(err));
    }
  };

  const handleMarkSold = async (): Promise<void> => {
    if (!listing) return;
    await ServiceContainer.getInstance().resolve<IListingService>(SERVICE_KEYS.ListingService).markSold(listing.id);
    setSoldOpen(false);
    success(s.listings.markAsSold);
    await refresh();
  };

  const handleContact = async (): Promise<void> => {
    if (!listing) return;
    await sendMessage(listing.sellerId, `Hi, I'm interested in "${listing.title}"`, listing.id);
    navigate(ROUTES.Messages);
  };

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState message={error.message} onRetry={refresh} retryLabel={s.app.retry} />;
  if (!listing) return <ErrorState message={s.errors.notFound} onRetry={() => navigate(ROUTES.Listings)} />;

  const priceLabel = listing.isDonation
    ? s.listings.donation
    : listing.price === 0
      ? s.listings.free
      : formatCurrency(listing.price, listing.currency);

  return (
    <PageLayout title={listing.title}>
      <div className={classes.actions}>
        <Button
          icon={isFavorite ? <Heart24Filled /> : <Heart24Regular />}
          onClick={() => toggle()}
          disabled={isToggling}
        >
          {isFavorite ? s.listings.removeFromFavorites : s.listings.addToFavorites}
        </Button>
        <Button icon={<Share24Regular />} onClick={() => setShareOpen(true)}>{s.listings.shareListing}</Button>
        <Button icon={<Flag24Regular />} onClick={() => setReportOpen(true)}>{s.listings.reportListing}</Button>
        <Button icon={<Mail24Regular />} onClick={handleContact}>{s.listings.contactSeller}</Button>
        {permissions.canReserve(listing) && (
          <Button onClick={() => setReserveOpen(true)}>{s.listings.reserveListing}</Button>
        )}
        {permissions.canMarkSold(listing) && listing.status !== LISTING_STATUS.Sold && (
          <Button onClick={() => setSoldOpen(true)}>{s.listings.markAsSold}</Button>
        )}
        {permissions.isOwner(listing) && (
          <Button icon={<Edit24Regular />} onClick={() => navigate(ROUTES.EditListing.replace(':id', String(listing.id)))}>
            {s.common.edit}
          </Button>
        )}
      </div>

      <TwoColumnLayout
        sidebar={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SellerCard
            seller={{
              id: listing.sellerId,
              displayName: listing.sellerDisplayName ?? listing.sellerId,
              email: listing.sellerEmail ?? '',
              department: listing.department,
              office: listing.office,
              listingCount: 1
            }}
            onContact={handleContact}
            contactLabel={s.listings.contactSeller}
            labels={{ listings: s.sellerProfile.listingCount, sold: s.sellerProfile.soldCount, reviews: s.sellerProfile.reviewCount }}
          />
          <Badge appearance="filled" color="success">Colleague</Badge>
          </div>
        }
      >
        <ImageGallery
          images={listing.imageUrls.length > 0 ? listing.imageUrls : listing.thumbnailUrl ? [listing.thumbnailUrl] : []}
          alt={listing.title}
          onImageClick={setZoomIndex}
        />

        {zoomIndex !== undefined && listing.imageUrls[zoomIndex] && (
          <ImageZoom
            src={listing.imageUrls[zoomIndex]}
            open={zoomIndex !== undefined}
            onClose={() => setZoomIndex(undefined)}
          />
        )}

        <Text className={classes.price}>{priceLabel}</Text>
        <MessageBar intent="info">
          <MessageBarBody>
            Internal listing from {listing.sellerDisplayName || 'a colleague'}. Message in the app and meet at the office.
            {listing.pickupAvailable ? ` ${s.listings.pickupAvailable}.` : ''}
            {listing.shippingAvailable ? ` ${s.listings.shippingAvailable}.` : ''}
          </MessageBarBody>
        </MessageBar>
        <div className={classes.meta}>
          <Badge appearance="filled" color="brand">{s.listings.type[listing.listingType === 'Sell' ? 'sell' : listing.listingType === 'Rent' ? 'rent' : listing.listingType === 'Donate' ? 'donate' : listing.listingType === 'Exchange' ? 'exchange' : listing.listingType === 'Buy' ? 'buy' : 'wanted']}</Badge>
          <Badge appearance="outline">{listing.condition === 'LikeNew' ? s.listings.conditionValues.likeNew : listing.condition}</Badge>
          <Badge>{listing.status}</Badge>
          <Text>{listing.categoryName ?? s.listings.category}</Text>
          <Text>{listing.locationName ?? listing.city ?? s.listings.location}</Text>
          <Text>{s.listings.postedOn}: {formatDate(listing.publishedOn ?? listing.created)}</Text>
          {listing.expiresOn && <Text>{s.listings.expiresOn}: {formatDate(listing.expiresOn)}</Text>}
        </div>

        <section className={styles.section}>
          <h3>{s.listings.description}</h3>
          <Text>{listing.description}</Text>
        </section>

        {listing.tags.length > 0 && (
          <section className={styles.section}>
            <h3>{s.listings.tags}</h3>
            <div className={styles.tags}>{listing.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
          </section>
        )}

        <section className={styles.section}>
          <h3>{s.reviews.title}</h3>
          <ReviewList reviews={reviews} emptyMessage={s.reviews.noReviews} />
          <ReviewForm
            onSubmit={handleReview}
            submitLabel={s.reviews.submitReview}
            ratingLabel={s.reviews.rating}
            commentLabel={s.reviews.comment}
          />
        </section>

        <section className={styles.section}>
          <h3>Comments</h3>
          <CommentSection
            comments={comments}
            onSubmit={handleComment}
            placeholder="Add a comment..."
            submitLabel={s.common.submit}
          />
        </section>

        <section className={styles.section}>
          <h3>Timeline</h3>
          <Timeline events={timelineEvents} />
        </section>

        <section className={styles.section}>
          <h3>Documents</h3>
          {permissions.isOwner(listing) && (
            <>
              <Button appearance="secondary" onClick={() => documentInputRef.current?.click()}>Upload document</Button>
              <input
                ref={documentInputRef}
                type="file"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  handleUploadDocument(file).catch(() => undefined);
                }}
              />
            </>
          )}
          <DocumentList documents={documents} emptyMessage="No documents attached" />
        </section>

        {related.length > 0 && (
          <section className={styles.section}>
            <h3>{s.listings.related}</h3>
            <ListingGrid
              listings={related}
              viewMode="grid"
              onListingClick={(l) => navigate(`${ROUTES.Listings}/${l.id}`)}
            />
          </section>
        )}
      </TwoColumnLayout>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} url={shareUrl} title={s.listings.shareListing} copyLabel={s.common.copyLink} closeLabel={s.common.close} />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        labels={{
          title: s.reports.reportListing,
          reportType: s.reports.reportType,
          reason: s.reports.reason,
          submit: s.reports.submitReport,
          cancel: s.common.cancel,
          types: s.reports.types
        }}
      />
      <ReserveDialog
        open={reserveOpen}
        listing={listing}
        onDismiss={() => setReserveOpen(false)}
        onReserved={() => { refresh().catch(() => undefined); }}
      />
      <ConfirmDialog
        open={soldOpen}
        title={s.listings.markAsSold}
        message={s.listings.markAsSold}
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={handleMarkSold}
        onCancel={() => setSoldOpen(false)}
      />
    </PageLayout>
  );
};

export default ListingDetailPage;
