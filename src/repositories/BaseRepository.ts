import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { initializePnP } from '../services/SharePointContextFactory';
import { IListQueryOptions, ISharePointListItem } from '../services/SharePointContextFactory';
import { IPagedResult } from '../interfaces';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { retryAsync } from '../utilities';

export abstract class BaseRepository<TEntity, TItem extends ISharePointListItem = ISharePointListItem> {
  protected sp: SPFI;
  protected listTitle: string;

  constructor(context: WebPartContext, listTitle: string) {
    const { sp } = initializePnP(context);
    this.sp = sp;
    this.listTitle = listTitle;
  }

  protected abstract mapItem(item: TItem): TEntity;
  protected abstract mapToItem(entity: Partial<TEntity>): TItem;

  public async getById(id: number): Promise<TEntity | undefined> {
    return retryAsync(async () => {
      const item = await this.sp.web.lists.getByTitle(this.listTitle).items.getById(id)();
      return this.mapItem(item as TItem);
    });
  }

  public async getAll(options?: IListQueryOptions): Promise<TEntity[]> {
    return retryAsync(async () => {
      let query = this.sp.web.lists.getByTitle(this.listTitle).items;
      if (options?.filter) query = query.filter(options.filter) as typeof query;
      if (options?.select) query = query.select(...options.select) as typeof query;
      if (options?.expand) query = query.expand(...options.expand) as typeof query;
      if (options?.orderBy) {
        const parsed = /^(.+?)\s+(asc|desc)$/i.exec(options.orderBy.trim());
        query = parsed
          ? query.orderBy(parsed[1], parsed[2].toLowerCase() !== 'desc') as typeof query
          : query.orderBy(options.orderBy, true) as typeof query;
      }
      if (options?.top) query = query.top(options.top) as typeof query;
      const items = await query();
      return (items as TItem[]).map(item => this.mapItem(item));
    });
  }

  public async getPaged(
    page: number,
    pageSize: number = DEFAULT_PAGE_SIZE,
    options?: IListQueryOptions
  ): Promise<IPagedResult<TEntity>> {
    // SharePoint list items do not support $skip, so page by taking the window from the top.
    const fetchCount = page * pageSize;
    const items = await this.getAll({ ...options, top: fetchCount + 1 });
    const start = (page - 1) * pageSize;
    const resultItems = items.slice(start, start + pageSize);
    const hasMore = items.length > start + pageSize;
    return {
      items: resultItems,
      totalCount: hasMore ? start + pageSize + 1 : start + resultItems.length,
      page,
      pageSize,
      hasMore
    };
  }

  public async create(entity: Partial<TEntity>): Promise<TEntity> {
    return retryAsync(async () => {
      const item = this.omitUndefined(this.mapToItem(entity));
      const result = await this.sp.web.lists.getByTitle(this.listTitle).items.add(item);
      const created = await this.sp.web.lists.getByTitle(this.listTitle).items.getById(result.data.Id)();
      return this.mapItem(created as TItem);
    });
  }

  public async update(id: number, entity: Partial<TEntity>): Promise<TEntity> {
    return retryAsync(async () => {
      const item = this.omitUndefined(this.mapToItem(entity));
      await this.sp.web.lists.getByTitle(this.listTitle).items.getById(id).update(item);
      const updated = await this.sp.web.lists.getByTitle(this.listTitle).items.getById(id)();
      return this.mapItem(updated as TItem);
    });
  }

  public async delete(id: number): Promise<void> {
    return retryAsync(async () => {
      await this.sp.web.lists.getByTitle(this.listTitle).items.getById(id).delete();
    });
  }

  private omitUndefined(item: TItem): TItem {
    const cleaned: Record<string, unknown> = {};
    Object.keys(item).forEach(key => {
      const value = (item as Record<string, unknown>)[key];
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned as TItem;
  }

  public async count(filter?: string): Promise<number> {
    return retryAsync(async () => {
      let query = this.sp.web.lists.getByTitle(this.listTitle).items.select('Id');
      if (filter) query = query.filter(filter) as typeof query;
      const items = await query.top(5000)();
      return items.length;
    });
  }
}
