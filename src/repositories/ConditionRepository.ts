import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { ICondition } from '../interfaces';
import { mapConditionItem, mapConditionToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class ConditionRepository extends BaseRepository<ICondition> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Conditions);
  }

  protected mapItem(item: ISharePointListItem): ICondition {
    return mapConditionItem(item);
  }

  protected mapToItem(entity: Partial<ICondition>): ISharePointListItem {
    return mapConditionToSharePoint(entity);
  }

  public async getAllOrdered(): Promise<ICondition[]> {
    return this.getAll({ orderBy: 'EC365_SortOrder asc' });
  }
}
