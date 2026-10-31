import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IReview } from '../interfaces';
import { mapReviewItem, mapReviewToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class ReviewRepository extends BaseRepository<IReview> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Reviews);
  }

  protected mapItem(item: ISharePointListItem): IReview {
    return mapReviewItem(item);
  }

  protected mapToItem(entity: Partial<IReview>): ISharePointListItem {
    return mapReviewToSharePoint(entity);
  }

  public async getBySeller(sellerId: string): Promise<IReview[]> {
    return this.getAll({
      filter: `EC365_SellerId eq '${escapeODataString(sellerId)}'`,
      orderBy: 'Created desc'
    });
  }

  public async getByListing(listingId: number): Promise<IReview[]> {
    return this.getAll({
      filter: `EC365_ListingId eq ${listingId}`,
      orderBy: 'Created desc'
    });
  }

  public async getAverageRating(sellerId: string): Promise<number> {
    const reviews = await this.getBySeller(sellerId);
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }
}
