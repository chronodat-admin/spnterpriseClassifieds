import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ILocation } from '../interfaces';
import { mapLocationItem, mapLocationToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class LocationRepository extends BaseRepository<ILocation> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Locations);
  }

  protected mapItem(item: ISharePointListItem): ILocation {
    return mapLocationItem(item);
  }

  protected mapToItem(entity: Partial<ILocation>): ISharePointListItem {
    return mapLocationToSharePoint(entity);
  }

  public async getAllOrdered(): Promise<ILocation[]> {
    return this.getAll({ orderBy: 'EC365_SortOrder asc' });
  }
}
