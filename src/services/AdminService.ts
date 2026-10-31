import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IApprovalQueueItem,
  IReport,
  ISetting,
  IAnnouncement,
  SettingCategory
} from '../interfaces';
import { ApprovalQueueRepository } from '../repositories/ApprovalQueueRepository';
import { ReportRepository } from '../repositories/ReportRepository';
import { SettingRepository } from '../repositories/SettingRepository';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { ListingRepository } from '../repositories/ListingRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';
import { NotificationService } from './NotificationService';
import { PermissionService } from './PermissionService';
import { LISTING_STATUS } from '../constants';

export class AdminService {
  private _approvalQueueRepo: ApprovalQueueRepository;
  private _reportRepo: ReportRepository;
  private _settingRepo: SettingRepository;
  private _announcementRepo: AnnouncementRepository;
  private _listingRepo: ListingRepository;
  private _activityLogRepo: ActivityLogRepository;
  private _notificationService: NotificationService;
  private _permissionService: PermissionService;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._approvalQueueRepo = new ApprovalQueueRepository(context);
    this._reportRepo = new ReportRepository(context);
    this._settingRepo = new SettingRepository(context);
    this._announcementRepo = new AnnouncementRepository(context);
    this._listingRepo = new ListingRepository(context);
    this._activityLogRepo = new ActivityLogRepository(context);
    this._notificationService = new NotificationService(context);
    this._permissionService = new PermissionService(context);
  }

  private async ensureAdmin(): Promise<void> {
    if (!(await this._permissionService.isAdmin())) {
      throw new Error('Admin permissions required');
    }
  }

  private async ensureModerator(): Promise<void> {
    if (!(await this._permissionService.isModerator())) {
      throw new Error('Moderator permissions required');
    }
  }

  public async getPendingApprovals(): Promise<IApprovalQueueItem[]> {
    await this.ensureModerator();
    return this._approvalQueueRepo.getPending();
  }

  public async approveListing(
    queueItemId: number,
    notes?: string
  ): Promise<IApprovalQueueItem> {
    await this.ensureModerator();

    const queueItem = await this._approvalQueueRepo.getById(queueItemId);
    if (!queueItem) {
      throw new Error(`Approval queue item ${queueItemId} not found`);
    }

    await this._listingRepo.update(queueItem.listingId, {
      status: LISTING_STATUS.Approved,
      approvalNotes: notes
    });

    const updated = await this._approvalQueueRepo.update(queueItemId, {
      status: 'Approved',
      reviewedBy: this._context.pageContext.user.loginName,
      reviewedOn: new Date(),
      notes
    });

    await this._notificationService.notifyListingApproved(
      queueItem.submittedBy,
      queueItem.listingId,
      queueItem.listingTitle ?? 'Your listing'
    );

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ListingApproved',
      entityType: 'Listing',
      entityId: queueItem.listingId,
      details: notes
    });

    return updated;
  }

  public async rejectListing(
    queueItemId: number,
    notes?: string
  ): Promise<IApprovalQueueItem> {
    await this.ensureModerator();

    const queueItem = await this._approvalQueueRepo.getById(queueItemId);
    if (!queueItem) {
      throw new Error(`Approval queue item ${queueItemId} not found`);
    }

    await this._listingRepo.update(queueItem.listingId, {
      status: LISTING_STATUS.Rejected,
      approvalNotes: notes
    });

    const updated = await this._approvalQueueRepo.update(queueItemId, {
      status: 'Rejected',
      reviewedBy: this._context.pageContext.user.loginName,
      reviewedOn: new Date(),
      notes
    });

    await this._notificationService.create({
      userId: queueItem.submittedBy,
      title: 'Listing Rejected',
      message: `Your listing "${queueItem.listingTitle ?? ''}" was not approved.${notes ? ` Reason: ${notes}` : ''}`,
      type: 'Approval',
      relatedListingId: queueItem.listingId
    });

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ListingRejected',
      entityType: 'Listing',
      entityId: queueItem.listingId,
      details: notes
    });

    return updated;
  }

  public async getPendingReports(): Promise<IReport[]> {
    await this.ensureModerator();
    return this._reportRepo.getPending();
  }

  public async resolveReport(
    reportId: number,
    status: 'Reviewed' | 'Dismissed' | 'ActionTaken',
    adminNotes?: string
  ): Promise<IReport> {
    await this.ensureModerator();

    const updated = await this._reportRepo.update(reportId, {
      status,
      adminNotes,
      reviewedBy: this._context.pageContext.user.loginName
    });

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'ReportResolved',
      entityType: 'Report',
      entityId: reportId,
      details: status
    });

    return updated;
  }

  public async getSettings(category?: SettingCategory): Promise<ISetting[]> {
    await this.ensureAdmin();
    if (category) {
      return this._settingRepo.getByCategory(category);
    }
    return this._settingRepo.getAll({ orderBy: 'Title asc' });
  }

  public async updateSetting(id: number, value: string): Promise<ISetting> {
    await this.ensureAdmin();
    return this._settingRepo.update(id, { value });
  }

  public async getActiveAnnouncements(): Promise<IAnnouncement[]> {
    return this._announcementRepo.getActive();
  }

  public async createAnnouncement(announcement: Partial<IAnnouncement>): Promise<IAnnouncement> {
    await this.ensureAdmin();
    return this._announcementRepo.create({
      isActive: true,
      priority: 0,
      ...announcement
    });
  }

  public async updateAnnouncement(id: number, announcement: Partial<IAnnouncement>): Promise<IAnnouncement> {
    await this.ensureAdmin();
    return this._announcementRepo.update(id, announcement);
  }

  public async deleteAnnouncement(id: number): Promise<void> {
    await this.ensureAdmin();
    await this._announcementRepo.delete(id);
  }
}
