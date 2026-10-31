import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ServiceContainer, SERVICE_KEYS } from './ServiceContainer';
import { createServiceContext } from './SharePointContextFactory';
import {
  ListingRepository,
  CategoryRepository,
  ConditionRepository,
  LocationRepository,
  FavoriteRepository,
  MessageRepository,
  ReviewRepository,
  ReportRepository,
  NotificationRepository,
  SavedSearchRepository,
  TagRepository,
  SettingRepository,
  ActivityLogRepository,
  ApprovalQueueRepository,
  AnnouncementRepository,
  WantedAdRepository
} from '../repositories';
import { ListingService } from './ListingService';
import { CategoryService } from './CategoryService';
import { SearchService } from './SearchService';
import { GraphService } from './GraphService';
import { AiService } from './AiService';
import { PermissionService } from './PermissionService';
import { TelemetryService } from './TelemetryService';
import { NotificationService } from './NotificationService';
import { AnalyticsService } from './AnalyticsService';
import { ImageService } from './ImageService';
import { MessageService } from './MessageService';
import { ReviewService } from './ReviewService';
import { AdminService } from './AdminService';
import { ProvisioningService } from './ProvisioningService';
import { OnboardingService } from './OnboardingService';

export function registerServices(context: WebPartContext): ServiceContainer {
  const container = ServiceContainer.getInstance();
  const serviceContext = createServiceContext(context);
  container.initialize(serviceContext);

  container.register(SERVICE_KEYS.ListingRepository, () => new ListingRepository(context));
  container.register(SERVICE_KEYS.CategoryRepository, () => new CategoryRepository(context));
  container.register(SERVICE_KEYS.ConditionRepository, () => new ConditionRepository(context));
  container.register(SERVICE_KEYS.LocationRepository, () => new LocationRepository(context));
  container.register(SERVICE_KEYS.FavoriteRepository, () => new FavoriteRepository(context));
  container.register(SERVICE_KEYS.MessageRepository, () => new MessageRepository(context));
  container.register(SERVICE_KEYS.ReviewRepository, () => new ReviewRepository(context));
  container.register(SERVICE_KEYS.ReportRepository, () => new ReportRepository(context));
  container.register(SERVICE_KEYS.NotificationRepository, () => new NotificationRepository(context));
  container.register(SERVICE_KEYS.SavedSearchRepository, () => new SavedSearchRepository(context));
  container.register(SERVICE_KEYS.TagRepository, () => new TagRepository(context));
  container.register(SERVICE_KEYS.SettingRepository, () => new SettingRepository(context));
  container.register(SERVICE_KEYS.ActivityLogRepository, () => new ActivityLogRepository(context));
  container.register(SERVICE_KEYS.ApprovalQueueRepository, () => new ApprovalQueueRepository(context));
  container.register(SERVICE_KEYS.AnnouncementRepository, () => new AnnouncementRepository(context));
  container.register(SERVICE_KEYS.WantedAdRepository, () => new WantedAdRepository(context));

  container.register(SERVICE_KEYS.ListingService, () => new ListingService(context));
  container.register(SERVICE_KEYS.CategoryService, () => new CategoryService(context));
  container.register(SERVICE_KEYS.SearchService, () => new SearchService(context));
  container.register(SERVICE_KEYS.GraphService, () => new GraphService(context));
  container.register(SERVICE_KEYS.AiService, () => new AiService(context));
  container.register(SERVICE_KEYS.PermissionService, () => new PermissionService(context));
  container.register(SERVICE_KEYS.TelemetryService, () => new TelemetryService(context));
  container.register(SERVICE_KEYS.NotificationService, () => new NotificationService(context));
  container.register(SERVICE_KEYS.AnalyticsService, () => new AnalyticsService(context));
  container.register(SERVICE_KEYS.ImageService, () => new ImageService(context));
  container.register(SERVICE_KEYS.MessageService, () => new MessageService(context));
  container.register(SERVICE_KEYS.ReviewService, () => new ReviewService(context));
  container.register(SERVICE_KEYS.AdminService, () => new AdminService(context));
  container.register(SERVICE_KEYS.ProvisioningService, () => new ProvisioningService(context));
  container.register(SERVICE_KEYS.OnboardingService, () => new OnboardingService(context));

  return container;
}

export function getService<T>(key: keyof typeof SERVICE_KEYS): T {
  return ServiceContainer.getInstance().resolve<T>(SERVICE_KEYS[key]);
}
