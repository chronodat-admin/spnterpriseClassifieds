import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IListing,
  IListingFilter,
  IPagedResult,
  ISortOption,
  ListingStatus
} from '../interfaces';
import { ListingRepository } from '../repositories/ListingRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { ApprovalQueueRepository } from '../repositories/ApprovalQueueRepository';
import { LISTING_EXPIRY_DAYS, LISTING_STATUS } from '../constants';
import { generateId } from '../utilities';

export class ListingService {
  private _listingRepo: ListingRepository;
  private _activityLogRepo: ActivityLogRepository;
  private _approvalQueueRepo: ApprovalQueueRepository;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._listingRepo = new ListingRepository(context);
    this._activityLogRepo = new ActivityLogRepository(context);
    this._approvalQueueRepo = new ApprovalQueueRepository(context);
  }

  public async getById(id: number): Promise<IListing | undefined> {
    return this._listingRepo.getById(id);
  }

  public async create(listing: Partial<IListing>): Promise<IListing> {
    const sellerId = listing.sellerId ?? this._context.pageContext.user.loginName;
    const sellerDisplayName = listing.sellerDisplayName ?? this._context.pageContext.user.displayName;
    const sellerEmail = listing.sellerEmail ?? this._context.pageContext.user.email;

    const created = await this._listingRepo.create({
      ...listing,
      sellerId,
      sellerDisplayName,
      sellerEmail,
      status: listing.status ?? LISTING_STATUS.Draft,
      viewCount: 0,
      favoriteCount: 0,
      messageCount: 0
    });

    await this._activityLogRepo.log({
      userId: sellerId,
      userDisplayName: sellerDisplayName,
      action: 'ListingCreated',
      entityType: 'Listing',
      entityId: created.id
    });

    return created;
  }

  public async update(id: number, listing: Partial<IListing>): Promise<IListing> {
    const updated = await this._listingRepo.update(id, listing);

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ListingUpdated',
      entityType: 'Listing',
      entityId: id
    });

    return updated;
  }

  public async delete(id: number): Promise<void> {
    await this._listingRepo.delete(id);

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ListingDeleted',
      entityType: 'Listing',
      entityId: id
    });
  }

  public async search(
    filter: IListingFilter,
    page: number,
    pageSize: number,
    sort?: ISortOption
  ): Promise<IPagedResult<IListing>> {
    return this._listingRepo.search(filter, page, pageSize, sort);
  }

  public async publish(id: number, requiresApproval = true): Promise<IListing> {
    const listing = await this._listingRepo.getById(id);
    if (!listing) {
      throw new Error(`Listing ${id} not found`);
    }

    const status: ListingStatus = requiresApproval ? LISTING_STATUS.Pending : LISTING_STATUS.Approved;
    const expiresOn = new Date();
    expiresOn.setDate(expiresOn.getDate() + LISTING_EXPIRY_DAYS);

    const updated = await this._listingRepo.update(id, {
      status,
      publishedOn: new Date(),
      expiresOn
    });

    if (requiresApproval) {
      await this._approvalQueueRepo.create({
        listingId: id,
        listingTitle: listing.title,
        submittedBy: listing.sellerId,
        submittedOn: new Date(),
        status: 'Pending'
      });
    }

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ListingPublished',
      entityType: 'Listing',
      entityId: id,
      details: `Status: ${status}`
    });

    return updated;
  }

  public async reserve(id: number, reservedBy?: string): Promise<IListing> {
    const userId = reservedBy ?? this._context.pageContext.user.loginName;
    return this._listingRepo.update(id, {
      status: LISTING_STATUS.Reserved,
      reservedBy: userId
    });
  }

  public async markSold(id: number): Promise<IListing> {
    return this._listingRepo.update(id, {
      status: LISTING_STATUS.Sold,
      soldOn: new Date()
    });
  }

  public async renew(id: number): Promise<IListing> {
    const expiresOn = new Date();
    expiresOn.setDate(expiresOn.getDate() + LISTING_EXPIRY_DAYS);

    return this._listingRepo.update(id, {
      status: LISTING_STATUS.Approved,
      expiresOn,
      publishedOn: new Date()
    });
  }

  public async duplicate(id: number): Promise<IListing> {
    const source = await this._listingRepo.getById(id);
    if (!source) {
      throw new Error(`Listing ${id} not found`);
    }

    return this.create({
      title: `${source.title} (Copy)`,
      description: source.description,
      categoryId: source.categoryId,
      sellerId: source.sellerId,
      sellerDisplayName: source.sellerDisplayName,
      sellerEmail: source.sellerEmail,
      department: source.department,
      office: source.office,
      listingType: source.listingType,
      condition: source.condition,
      price: source.price,
      currency: source.currency,
      isNegotiable: source.isNegotiable,
      isFeatured: false,
      isRental: source.isRental,
      isAuction: source.isAuction,
      isDonation: source.isDonation,
      locationId: source.locationId,
      building: source.building,
      city: source.city,
      country: source.country,
      pickupAvailable: source.pickupAvailable,
      shippingAvailable: source.shippingAvailable,
      thumbnailUrl: source.thumbnailUrl,
      imageUrls: [...source.imageUrls],
      tags: [...source.tags],
      keywords: source.keywords,
      status: LISTING_STATUS.Draft,
      viewCount: 0,
      favoriteCount: 0,
      messageCount: 0,
      aiGenerated: source.aiGenerated
    });
  }

  public async incrementViewCount(id: number): Promise<void> {
    await this._listingRepo.incrementViewCount(id);
  }

  public async getBySeller(sellerId: string, status?: string): Promise<IListing[]> {
    return this._listingRepo.getBySeller(sellerId, status);
  }

  public async getFeatured(limit = 10): Promise<IListing[]> {
    return this._listingRepo.getFeatured(limit);
  }

  public async getNewest(limit = 10): Promise<IListing[]> {
    return this._listingRepo.getNewest(limit);
  }

  public async getTrending(limit = 10): Promise<IListing[]> {
    return this._listingRepo.getTrending(limit);
  }

  public generateConversationId(listingId: number, buyerId: string, sellerId: string): string {
    const participants = [buyerId, sellerId].sort().join('-');
    return `${listingId}-${participants}-${generateId()}`;
  }
}
