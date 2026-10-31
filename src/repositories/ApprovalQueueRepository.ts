import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IApprovalQueueItem } from '../interfaces';
import { mapApprovalQueueItem, mapApprovalQueueToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class ApprovalQueueRepository extends BaseRepository<IApprovalQueueItem> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.ApprovalQueue);
  }

  protected mapItem(item: ISharePointListItem): IApprovalQueueItem {
    return mapApprovalQueueItem(item);
  }

  protected mapToItem(entity: Partial<IApprovalQueueItem>): ISharePointListItem {
    return mapApprovalQueueToSharePoint(entity);
  }

  public async getPending(): Promise<IApprovalQueueItem[]> {
    return this.getAll({
      filter: "EC365_Status eq 'Pending'",
      orderBy: 'EC365_SubmittedOn asc'
    });
  }

  public async getByListing(listingId: number): Promise<IApprovalQueueItem | undefined> {
    const items = await this.getAll({
      filter: `EC365_ListingId eq ${listingId}`,
      orderBy: 'Created desc',
      top: 1
    });
    return items[0];
  }
}
