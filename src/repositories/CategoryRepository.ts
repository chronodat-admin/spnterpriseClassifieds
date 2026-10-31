import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ICategory } from '../interfaces';
import { buildCategoryTree, mapCategoryItem, mapCategoryToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Categories);
  }

  protected mapItem(item: ISharePointListItem): ICategory {
    return mapCategoryItem(item);
  }

  protected mapToItem(entity: Partial<ICategory>): ISharePointListItem {
    return mapCategoryToSharePoint(entity);
  }

  public async getTree(): Promise<ICategory[]> {
    const categories = await this.getAll({ orderBy: 'EC365_SortOrder asc' });
    return buildCategoryTree(categories);
  }

  public async getVisible(): Promise<ICategory[]> {
    return this.getAll({
      filter: 'EC365_IsVisible eq true',
      orderBy: 'EC365_SortOrder asc'
    });
  }
}
