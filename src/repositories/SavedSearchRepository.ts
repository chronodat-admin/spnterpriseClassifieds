import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ISavedSearch } from '../interfaces';
import { mapSavedSearchItem, mapSavedSearchToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class SavedSearchRepository extends BaseRepository<ISavedSearch> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.SavedSearches);
  }

  protected mapItem(item: ISharePointListItem): ISavedSearch {
    return mapSavedSearchItem(item);
  }

  protected mapToItem(entity: Partial<ISavedSearch>): ISharePointListItem {
    return mapSavedSearchToSharePoint(entity);
  }

  public async getByUser(userId: string): Promise<ISavedSearch[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}'`,
      orderBy: 'Created desc'
    });
  }
}
