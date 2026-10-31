import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IDashboardStats, IListingAnalytics } from '../interfaces';
import { ListingRepository } from '../repositories/ListingRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ApprovalQueueRepository } from '../repositories/ApprovalQueueRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { FavoriteRepository } from '../repositories/FavoriteRepository';
import { LISTING_STATUS } from '../constants';

export class AnalyticsService {
  private _listingRepo: ListingRepository;
  private _categoryRepo: CategoryRepository;
  private _approvalQueueRepo: ApprovalQueueRepository;
  private _messageRepo: MessageRepository;
  private _favoriteRepo: FavoriteRepository;

  constructor(context: WebPartContext) {
    this._listingRepo = new ListingRepository(context);
    this._categoryRepo = new CategoryRepository(context);
    this._approvalQueueRepo = new ApprovalQueueRepository(context);
    this._messageRepo = new MessageRepository(context);
    this._favoriteRepo = new FavoriteRepository(context);
  }

  public async getDashboardStats(): Promise<IDashboardStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const [allListings, activeListings, pendingApprovals, categories, todayMessages] = await Promise.all([
      this._listingRepo.count(),
      this._listingRepo.count(`EC365_Status eq '${LISTING_STATUS.Approved}'`),
      this._approvalQueueRepo.getPending(),
      this._categoryRepo.getAll(),
      this._messageRepo.getAll({
        filter: `Created ge datetime'${todayIso}'`
      })
    ]);

    const categoryCounts = new Map<number, { name: string; count: number }>();
    const approvedListings = await this._listingRepo.getAll({
      filter: `EC365_Status eq '${LISTING_STATUS.Approved}'`,
      select: ['Id', 'EC365_CategoryId', 'EC365_ViewCount', 'Created']
    });

    approvedListings.forEach(listing => {
      const existing = categoryCounts.get(listing.categoryId);
      if (existing) {
        existing.count += 1;
      } else {
        const category = categories.find(c => c.id === listing.categoryId);
        categoryCounts.set(listing.categoryId, {
          name: category?.title ?? `Category ${listing.categoryId}`,
          count: 1
        });
      }
    });

    const topCategories = Array.from(categoryCounts.entries())
      .map(([categoryId, data]) => ({ categoryId, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const viewsToday = approvedListings
      .filter(l => l.created >= todayStart)
      .reduce((sum, l) => sum + l.viewCount, 0);

    const sellerIds = new Set(approvedListings.map(l => l.sellerId));

    return {
      totalListings: allListings,
      activeListings,
      pendingApprovals: pendingApprovals.length,
      totalUsers: sellerIds.size,
      messagesToday: todayMessages.length,
      viewsToday,
      topCategories
    };
  }

  public async getListingAnalytics(listingId: number): Promise<IListingAnalytics> {
    const listing = await this._listingRepo.getById(listingId);
    if (!listing) {
      throw new Error(`Listing ${listingId} not found`);
    }

    const favorites = await this._favoriteRepo.getAll({
      filter: `EC365_ListingId eq ${listingId}`
    });

    const messages = await this._messageRepo.getAll({
      filter: `EC365_ListingId eq ${listingId}`
    });

    const soldCount = listing.status === LISTING_STATUS.Sold ? 1 : 0;

    return {
      listingId,
      views: listing.viewCount,
      favorites: favorites.length,
      messages: messages.length,
      conversions: soldCount,
      viewsByDay: [
        {
          date: listing.created.toISOString().split('T')[0],
          count: listing.viewCount
        }
      ]
    };
  }
}
