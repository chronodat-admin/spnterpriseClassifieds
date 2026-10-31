import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IFavorite } from '../interfaces';
import { mapFavoriteItem, mapFavoriteToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class FavoriteRepository extends BaseRepository<IFavorite> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Favorites);
  }

  protected mapItem(item: ISharePointListItem): IFavorite {
    return mapFavoriteItem(item);
  }

  protected mapToItem(entity: Partial<IFavorite>): ISharePointListItem {
    return mapFavoriteToSharePoint(entity);
  }

  public async getByUser(userId: string): Promise<IFavorite[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}'`,
      orderBy: 'Created desc'
    });
  }

  public async isFavorite(userId: string, listingId: number): Promise<boolean> {
    const items = await this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}' and EC365_ListingId eq ${listingId}`,
      top: 1
    });
    return items.length > 0;
  }

  public async getByUserAndListing(userId: string, listingId: number): Promise<IFavorite | undefined> {
    const items = await this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}' and EC365_ListingId eq ${listingId}`,
      top: 1
    });
    return items[0];
  }
}
