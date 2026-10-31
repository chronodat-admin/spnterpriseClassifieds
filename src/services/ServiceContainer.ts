import { IServiceContext } from '../interfaces';

type ServiceFactory<T> = (context: IServiceContext) => T;

export class ServiceContainer {
  private static _instance: ServiceContainer;
  private _context: IServiceContext | undefined;
  private _services = new Map<string, unknown>();
  private _factories = new Map<string, ServiceFactory<unknown>>();

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer._instance) {
      ServiceContainer._instance = new ServiceContainer();
    }
    return ServiceContainer._instance;
  }

  public initialize(context: IServiceContext): void {
    this._context = context;
    this._services.clear();
  }

  public register<T>(key: string, factory: ServiceFactory<T>): void {
    this._factories.set(key, factory as ServiceFactory<unknown>);
  }

  public resolve<T>(key: string): T {
    if (this._services.has(key)) {
      return this._services.get(key) as T;
    }
    const factory = this._factories.get(key);
    if (!factory || !this._context) {
      throw new Error(`Service '${key}' is not registered or context is not initialized.`);
    }
    const service = factory(this._context);
    this._services.set(key, service);
    return service as T;
  }

  public get context(): IServiceContext {
    if (!this._context) {
      throw new Error('ServiceContainer context is not initialized.');
    }
    return this._context;
  }

  public dispose(): void {
    this._services.clear();
    this._context = undefined;
  }
}

export const SERVICE_KEYS = {
  ListingRepository: 'ListingRepository',
  CategoryRepository: 'CategoryRepository',
  ConditionRepository: 'ConditionRepository',
  LocationRepository: 'LocationRepository',
  FavoriteRepository: 'FavoriteRepository',
  MessageRepository: 'MessageRepository',
  ReviewRepository: 'ReviewRepository',
  ReportRepository: 'ReportRepository',
  NotificationRepository: 'NotificationRepository',
  SavedSearchRepository: 'SavedSearchRepository',
  TagRepository: 'TagRepository',
  SettingRepository: 'SettingRepository',
  ActivityLogRepository: 'ActivityLogRepository',
  ApprovalQueueRepository: 'ApprovalQueueRepository',
  AnnouncementRepository: 'AnnouncementRepository',
  WantedAdRepository: 'WantedAdRepository',
  ListingService: 'ListingService',
  CategoryService: 'CategoryService',
  SearchService: 'SearchService',
  GraphService: 'GraphService',
  AiService: 'AiService',
  PermissionService: 'PermissionService',
  TelemetryService: 'TelemetryService',
  NotificationService: 'NotificationService',
  AnalyticsService: 'AnalyticsService',
  ProvisioningService: 'ProvisioningService',
  OnboardingService: 'OnboardingService',
  ImageService: 'ImageService',
  MessageService: 'MessageService',
  ReviewService: 'ReviewService',
  AdminService: 'AdminService'
} as const;
