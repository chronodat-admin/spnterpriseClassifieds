import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ICategory } from '../interfaces';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ActivityLogRepository } from '../repositories/ActivityLogRepository';

export class CategoryService {
  private _categoryRepo: CategoryRepository;
  private _activityLogRepo: ActivityLogRepository;
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
    this._categoryRepo = new CategoryRepository(context);
    this._activityLogRepo = new ActivityLogRepository(context);
  }

  public async getTree(): Promise<ICategory[]> {
    return this._categoryRepo.getTree();
  }

  public async getVisible(): Promise<ICategory[]> {
    return this._categoryRepo.getVisible();
  }

  public async getById(id: number): Promise<ICategory | undefined> {
    return this._categoryRepo.getById(id);
  }

  public async getAll(): Promise<ICategory[]> {
    return this._categoryRepo.getAll({ orderBy: 'EC365_SortOrder asc' });
  }

  public async create(category: Partial<ICategory>): Promise<ICategory> {
    const created = await this._categoryRepo.create({
      isVisible: true,
      approvalRequired: false,
      sortOrder: 0,
      ...category
    });

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'CategoryCreated',
      entityType: 'Category',
      entityId: created.id
    });

    return created;
  }

  public async update(id: number, category: Partial<ICategory>): Promise<ICategory> {
    const updated = await this._categoryRepo.update(id, category);

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'CategoryUpdated',
      entityType: 'Category',
      entityId: id
    });

    return updated;
  }

  public async delete(id: number): Promise<void> {
    await this._categoryRepo.delete(id);

    await this._activityLogRepo.log({
      userId: this._context.pageContext.user.loginName,
      userDisplayName: this._context.pageContext.user.displayName,
      action: 'CategoryDeleted',
      entityType: 'Category',
      entityId: id
    });
  }
}
