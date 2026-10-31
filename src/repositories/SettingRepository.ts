import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ISetting, SettingCategory } from '../interfaces';
import { mapSettingItem, mapSettingToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Settings);
  }

  protected mapItem(item: ISharePointListItem): ISetting {
    return mapSettingItem(item);
  }

  protected mapToItem(entity: Partial<ISetting>): ISharePointListItem {
    return mapSettingToSharePoint(entity);
  }

  public async getByKey(key: string): Promise<ISetting | undefined> {
    const items = await this.getAll({
      filter: `Title eq '${escapeODataString(key)}'`,
      top: 1
    });
    return items[0];
  }

  public async getByCategory(category: SettingCategory): Promise<ISetting[]> {
    return this.getAll({
      filter: `EC365_Category eq '${category}'`,
      orderBy: 'Title asc'
    });
  }

  public async getValue(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.getByKey(key);
    return setting?.value ?? defaultValue;
  }
}
