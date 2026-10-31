import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseRepository } from './BaseRepository';
import { LIST_NAMES } from '../constants';
import { IReport } from '../interfaces';
import { mapReportItem, mapReportToSharePoint } from '../models';
import { ISharePointListItem } from '../services/SharePointContextFactory';

export class ReportRepository extends BaseRepository<IReport> {
  constructor(context: WebPartContext) {
    super(context, LIST_NAMES.Reports);
  }

  protected mapItem(item: ISharePointListItem): IReport {
    return mapReportItem(item);
  }

  protected mapToItem(entity: Partial<IReport>): ISharePointListItem {
    return mapReportToSharePoint(entity);
  }

  public async getPending(): Promise<IReport[]> {
    return this.getAll({
      filter: "EC365_Status eq 'Pending'",
      orderBy: 'Created desc'
    });
  }
}
