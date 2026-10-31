import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IReview } from '../interfaces';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { NotificationService } from './NotificationService';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { PermissionService } from './PermissionService';

export class ReviewService {
  private _reviewRepo: ReviewRepository;
  private _notificationService: NotificationService;
  private _activityLogRepo: ActivityLogRepository;
  private _permissionService: PermissionService;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._reviewRepo = new ReviewRepository(context);
    this._notificationService = new NotificationService(context);
    this._activityLogRepo = new ActivityLogRepository(context);
    this._permissionService = new PermissionService(context);
  }

  public async getBySeller(sellerId: string): Promise<IReview[]> {
    return this._reviewRepo.getBySeller(sellerId);
  }

  public async getByListing(listingId: number): Promise<IReview[]> {
    return this._reviewRepo.getByListing(listingId);
  }

  public async getAverageRating(sellerId: string): Promise<number> {
    return this._reviewRepo.getAverageRating(sellerId);
  }

  public async create(review: {
    listingId: number;
    sellerId: string;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const reviewerId = this._context.pageContext.user.loginName;
    if (reviewerId === review.sellerId) {
      throw new Error('You cannot review your own listing');
    }

    const created = await this._reviewRepo.create({
      listingId: review.listingId,
      sellerId: review.sellerId,
      reviewerId,
      reviewerDisplayName: this._context.pageContext.user.displayName,
      rating: review.rating,
      comment: review.comment,
      isModerated: false,
      isReported: false
    });

    await this._notificationService.create({
      userId: review.sellerId,
      title: 'New Review',
      message: `${this._context.pageContext.user.displayName} left a ${review.rating}-star review on your listing.`,
      type: 'Review',
      relatedListingId: review.listingId,
      linkUrl: `#/listings/${review.listingId}`
    });

    await this._activityLogRepo.log({
      userId: reviewerId,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ReviewCreated',
      entityType: 'Review',
      entityId: created.id
    });

    return created;
  }

  public async moderate(id: number, isModerated: boolean): Promise<IReview> {
    if (!(await this._permissionService.isModerator())) {
      throw new Error('Insufficient permissions to moderate reviews');
    }
    return this._reviewRepo.update(id, { isModerated });
  }

  public async report(id: number): Promise<IReview> {
    return this._reviewRepo.update(id, { isReported: true });
  }

  public async delete(id: number): Promise<void> {
    if (!(await this._permissionService.isModerator())) {
      throw new Error('Insufficient permissions to delete reviews');
    }
    await this._reviewRepo.delete(id);
  }
}
