import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ITag } from '../interfaces';
import { mapTagItem, mapTagToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class TagRepository extends BaseRepository<ITag> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Tags);
  }

  protected mapItem(item: ISharePointListItem): ITag {
    return mapTagItem(item);
  }

  protected mapToItem(entity: Partial<ITag>): ISharePointListItem {
    return mapTagToSharePoint(entity);
  }

  public async getPopular(limit = 20): Promise<ITag[]> {
    return this.getAll({
      orderBy: 'EC365_UsageCount desc',
      top: limit
    });
  }

  public async findByTitle(title: string): Promise<ITag | undefined> {
    const items = await this.getAll({
      filter: `Title eq '${escapeODataString(title)}'`,
      top: 1
    });
    return items[0];
  }
}
