import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IAnnouncement } from '../interfaces';
import { mapAnnouncementItem, mapAnnouncementToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class AnnouncementRepository extends BaseRepository<IAnnouncement> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Announcements);
  }

  protected mapItem(item: ISharePointListItem): IAnnouncement {
    return mapAnnouncementItem(item);
  }

  protected mapToItem(entity: Partial<IAnnouncement>): ISharePointListItem {
    return mapAnnouncementToSharePoint(entity);
  }

  public async getActive(): Promise<IAnnouncement[]> {
    const now = new Date().toISOString();
    const announcements = await this.getAll({
      filter: 'EC365_IsActive eq true',
      orderBy: 'EC365_Priority desc'
    });

    return announcements.filter(announcement => {
      const afterStart = !announcement.startDate || announcement.startDate <= new Date(now);
      const beforeEnd = !announcement.endDate || announcement.endDate >= new Date(now);
      return afterStart && beforeEnd;
    });
  }
}
