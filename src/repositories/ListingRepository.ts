import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IListing, IListingFilter, IPagedResult, ISortOption } from '../interfaces';
import { mapListingItem, mapListingToSharePoint } from '../models';
import { escapeODataString } from '../services/SharePointContextFactory';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class ListingRepository extends BaseRepository<IListing> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Listings);
  }

  protected mapItem(item: ISharePointListItem): IListing {
    return mapListingItem(item);
  }

  protected mapToItem(entity: Partial<IListing>): ISharePointListItem {
    return mapListingToSharePoint(entity);
  }

  public async search(
    filter: IListingFilter,
    page: number,
    pageSize: number,
    sort?: ISortOption
  ): Promise<IPagedResult<IListing>> {
    const filterParts: string[] = [
      `EC365_Status eq '${escapeODataString(filter.status ?? 'Approved')}'`
    ];

    if (filter.searchText) {
      const term = escapeODataString(filter.searchText);
      filterParts.push(`(substringof('${term}', Title) or substringof('${term}', EC365_Description))`);
    }
    if (filter.categoryId) filterParts.push(`EC365_CategoryId eq ${filter.categoryId}`);
    if (filter.department) filterParts.push(`EC365_Department eq '${escapeODataString(filter.department)}'`);
    if (filter.locationId) filterParts.push(`EC365_LocationId eq ${filter.locationId}`);
    if (filter.condition) filterParts.push(`EC365_Condition eq '${filter.condition}'`);
    if (filter.sellerId) filterParts.push(`EC365_SellerId eq '${escapeODataString(filter.sellerId)}'`);
    if (filter.minPrice !== undefined) filterParts.push(`EC365_Price ge ${filter.minPrice}`);
    if (filter.maxPrice !== undefined) filterParts.push(`EC365_Price le ${filter.maxPrice}`);
    if (filter.listingType) filterParts.push(`EC365_ListingType eq '${filter.listingType}'`);
    if (filter.isFeatured) filterParts.push('EC365_IsFeatured eq true');
    if (filter.isRental) filterParts.push('EC365_IsRental eq true');
    if (filter.isAuction) filterParts.push('EC365_IsAuction eq true');
    if (filter.isDonation) filterParts.push('EC365_IsDonation eq true');

    const orderBy = sort
      ? `${sort.field} ${sort.direction === 'desc' ? 'desc' : 'asc'}`
      : 'Created desc';

    return this.getPaged(page, pageSize, {
      filter: filterParts.join(' and '),
      orderBy
    });
  }

  public async getFeatured(limit = 10): Promise<IListing[]> {
    return this.getAll({
      filter: "EC365_Status eq 'Approved' and EC365_IsFeatured eq true",
      orderBy: 'Created desc',
      top: limit
    });
  }

  public async getNewest(limit = 10): Promise<IListing[]> {
    return this.getAll({
      filter: "EC365_Status eq 'Approved'",
      orderBy: 'Created desc',
      top: limit
    });
  }

  public async getTrending(limit = 10): Promise<IListing[]> {
    return this.getAll({
      filter: "EC365_Status eq 'Approved'",
      orderBy: 'EC365_ViewCount desc',
      top: limit
    });
  }

  public async getBySeller(sellerId: string, status?: string): Promise<IListing[]> {
    let filter = `EC365_SellerId eq '${escapeODataString(sellerId)}'`;
    if (status) filter += ` and EC365_Status eq '${status}'`;
    return this.getAll({ filter, orderBy: 'Created desc' });
  }

  public async getRelated(categoryId: number, excludeId: number, limit = 6): Promise<IListing[]> {
    return this.getAll({
      filter: `EC365_CategoryId eq ${categoryId} and EC365_Status eq 'Approved' and Id ne ${excludeId}`,
      orderBy: 'EC365_ViewCount desc',
      top: limit
    });
  }

  public async incrementViewCount(id: number): Promise<void> {
    const listing = await this.getById(id);
    if (listing) {
      await this.update(id, { viewCount: listing.viewCount + 1 });
    }
  }
}
