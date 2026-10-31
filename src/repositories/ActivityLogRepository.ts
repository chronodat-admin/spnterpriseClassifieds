import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IActivityLog } from '../interfaces';
import { mapActivityLogItem, mapActivityLogToSharePoint } from '../models';
import { escapeODataString, ISharePointListItem } from '../services/SharePointContextFactory';

export class ActivityLogRepository extends BaseRepository<IActivityLog> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.ActivityLogs);
  }

  protected mapItem(item: ISharePointListItem): IActivityLog {
    return mapActivityLogItem(item);
  }

  protected mapToItem(entity: Partial<IActivityLog>): ISharePointListItem {
    return mapActivityLogToSharePoint(entity);
  }

  public async log(
    entry: Pick<IActivityLog, 'userId' | 'action' | 'entityType' | 'entityId'> &
      Partial<Pick<IActivityLog, 'userDisplayName' | 'details' | 'ipAddress'>>
  ): Promise<IActivityLog> {
    return this.create({
      userId: entry.userId,
      userDisplayName: entry.userDisplayName,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      ipAddress: entry.ipAddress
    });
  }

  public async getByUser(userId: string, limit = 50): Promise<IActivityLog[]> {
    return this.getAll({
      filter: `EC365_UserId eq '${escapeODataString(userId)}'`,
      orderBy: 'Created desc',
      top: limit
    });
  }

  public async getByEntity(entityType: string, entityId: number): Promise<IActivityLog[]> {
    return this.getAll({
      filter: `EC365_EntityType eq '${escapeODataString(entityType)}' and EC365_EntityId eq ${entityId}`,
      orderBy: 'Created desc'
    });
  }
}
