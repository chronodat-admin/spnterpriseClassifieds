import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IListing, IWantedAd } from '../interfaces';
import { mapWantedAdItem, mapWantedAdToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';
import { ListingRepository } from './ListingRepository';

export class WantedAdRepository extends BaseRepository<IWantedAd> {
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.WantedAds);
    this._context = context;
  }

  protected mapItem(item: ISharePointListItem): IWantedAd {
    return mapWantedAdItem(item);
  }

  protected mapToItem(entity: Partial<IWantedAd>): ISharePointListItem {
    return mapWantedAdToSharePoint(entity);
  }

  public async getActive(): Promise<IWantedAd[]> {
    return this.getAll({
      filter: 'EC365_IsActive eq true',
      orderBy: 'Created desc'
    });
  }

  public async getByUser(userId: string): Promise<IWantedAd[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}'`,
      orderBy: 'Created desc'
    });
  }

  public async findMatchingListings(ad: IWantedAd): Promise<IListing[]> {
    const listings = new ListingRepository(this._context);
    const filterParts = ["EC365_Status eq 'Approved'"];
    if (ad.categoryId) {
      filterParts.push(`EC365_CategoryId eq ${ad.categoryId}`);
    }
    if (typeof ad.maxPrice === 'number' && ad.maxPrice > 0) {
      filterParts.push(`EC365_Price le ${ad.maxPrice}`);
    }

    const candidates = await listings.getAll({
      filter: filterParts.join(' and '),
      orderBy: 'Created desc',
      top: 50
    });

    const words = `${ad.title} ${ad.description}`
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);

    if (words.length === 0) {
      return candidates.slice(0, 12);
    }

    const matched = candidates.filter(listing => {
      const haystack = `${listing.title} ${listing.description} ${listing.keywords ?? ''}`.toLowerCase();
      return words.some(word => haystack.includes(word));
    });

    return (matched.length > 0 ? matched : candidates).slice(0, 12);
  }
}
