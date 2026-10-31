import { LISTING_STATUS, LISTING_TYPE, CONDITION_VALUES } from '../constants';

export type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];
export type ListingType = typeof LISTING_TYPE[keyof typeof LISTING_TYPE];
export type ConditionValue = typeof CONDITION_VALUES[keyof typeof CONDITION_VALUES];

export interface IEntityBase {
  id: number;
  created: Date;
  modified: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IListing extends IEntityBase {
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  sellerId: string;
  sellerDisplayName?: string;
  sellerEmail?: string;
  department?: string;
  office?: string;
  status: ListingStatus;
  listingType: ListingType;
  condition: ConditionValue;
  price: number;
  currency: string;
  isNegotiable: boolean;
  isFeatured: boolean;
  isRental: boolean;
  isAuction: boolean;
  isDonation: boolean;
  locationId?: number;
  locationName?: string;
  building?: string;
  city?: string;
  country?: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  imageUrls: string[];
  thumbnailUrl?: string;
  tags: string[];
  keywords?: string;
  viewCount: number;
  favoriteCount: number;
  messageCount: number;
  expiresOn?: Date;
  publishedOn?: Date;
  reservedBy?: string;
  soldOn?: Date;
  approvalNotes?: string;
  aiGenerated: boolean;
}

export interface ICategory extends IEntityBase {
  title: string;
  description?: string;
  parentId?: number;
  iconName?: string;
  color?: string;
  imageUrl?: string;
  sortOrder: number;
  isVisible: boolean;
  approvalRequired: boolean;
  listingCount?: number;
  children?: ICategory[];
}

export interface ICondition extends IEntityBase {
  title: string;
  description?: string;
  sortOrder: number;
}

export interface ILocation extends IEntityBase {
  title: string;
  office?: string;
  building?: string;
  city?: string;
  country?: string;
  sortOrder: number;
}

export interface IFavorite extends IEntityBase {
  userId: string;
  listingId: number;
  collectionId?: number;
  notifyOnChange: boolean;
}

export interface IFavoriteCollection extends IEntityBase {
  title: string;
  userId: string;
  description?: string;
  isDefault: boolean;
}

export interface IMessage extends IEntityBase {
  conversationId: string;
  senderId: string;
  senderDisplayName?: string;
  recipientId: string;
  recipientDisplayName?: string;
  listingId?: number;
  listingTitle?: string;
  body: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface IReview extends IEntityBase {
  listingId: number;
  reviewerId: string;
  reviewerDisplayName?: string;
  sellerId: string;
  rating: number;
  comment: string;
  isModerated: boolean;
  isReported: boolean;
}

export interface IReport extends IEntityBase {
  listingId: number;
  reporterId: string;
  reportType: ReportType;
  reason: string;
  status: ReportStatus;
  adminNotes?: string;
  reviewedBy?: string;
}

export type ReportType = 'Spam' | 'Duplicate' | 'Fraud' | 'Inappropriate' | 'Other';
export type ReportStatus = 'Pending' | 'Reviewed' | 'Dismissed' | 'ActionTaken';

export interface INotification extends IEntityBase {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
  isRead: boolean;
  relatedListingId?: number;
}

export type NotificationType =
  | 'Message'
  | 'Approval'
  | 'Expiration'
  | 'Match'
  | 'Review'
  | 'System'
  | 'Sold'
  | 'Reserved';

export interface ISavedSearch extends IEntityBase {
  userId: string;
  title: string;
  query: string;
  filtersJson: string;
  notifyOnMatch: boolean;
  lastRun?: Date;
}

export interface ITag extends IEntityBase {
  title: string;
  usageCount: number;
}

export interface ISetting extends IEntityBase {
  key: string;
  value: string;
  category: SettingCategory;
  description?: string;
}

export type SettingCategory =
  | 'General'
  | 'Branding'
  | 'Email'
  | 'Approval'
  | 'AI'
  | 'Storage'
  | 'Retention'
  | 'Notifications'
  | 'Teams'
  | 'License';

export interface IActivityLog extends IEntityBase {
  userId: string;
  userDisplayName?: string;
  action: string;
  entityType: string;
  entityId: number;
  details?: string;
  ipAddress?: string;
}

export interface IApprovalQueueItem extends IEntityBase {
  listingId: number;
  listingTitle?: string;
  submittedBy: string;
  submittedOn: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedOn?: Date;
  notes?: string;
}

export interface IAnnouncement extends IEntityBase {
  title: string;
  body: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
}

export interface IWantedAd extends IEntityBase {
  title: string;
  description: string;
  categoryId: number;
  userId: string;
  userDisplayName?: string;
  maxPrice?: number;
  currency?: string;
  locationId?: number;
  isActive: boolean;
  matchCount?: number;
}

export interface IUserProfile {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  department?: string;
  office?: string;
  manager?: string;
  jobTitle?: string;
  phone?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  followerCount?: number;
  listingCount?: number;
  soldCount?: number;
}

export interface IListingFilter {
  searchText?: string;
  categoryId?: number;
  department?: string;
  locationId?: number;
  condition?: ConditionValue;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  listingType?: ListingType;
  tags?: string[];
  isFeatured?: boolean;
  isRental?: boolean;
  isAuction?: boolean;
  isDonation?: boolean;
  isWanted?: boolean;
  isReserved?: boolean;
  isSold?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ISortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IListingAnalytics {
  listingId: number;
  views: number;
  favorites: number;
  messages: number;
  conversions: number;
  viewsByDay: { date: string; count: number }[];
}

export interface IDashboardStats {
  totalListings: number;
  activeListings: number;
  pendingApprovals: number;
  totalUsers: number;
  messagesToday: number;
  viewsToday: number;
  topCategories: { categoryId: number; name: string; count: number }[];
}

export interface IAiGenerateRequest {
  type: 'title' | 'description' | 'keywords' | 'category' | 'tags' | 'improve' | 'rewrite' | 'summarize' | 'translate';
  content: string;
  context?: string;
  targetLanguage?: string;
}

export interface IAiGenerateResponse {
  result: string;
  suggestions?: string[];
  confidence?: number;
}

export interface IAiModerationResult {
  isApproved: boolean;
  flags: string[];
  score: number;
  reason?: string;
}

export interface ICreateListingWizardState {
  step: number;
  categoryId?: number;
  title: string;
  description: string;
  keywords: string;
  tags: string[];
  images: IListingImageUpload[];
  price: number;
  currency: string;
  isNegotiable: boolean;
  isRental: boolean;
  isAuction: boolean;
  isDonation: boolean;
  listingType: ListingType;
  condition: ConditionValue;
  locationId?: number;
  building?: string;
  city?: string;
  country?: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  status: ListingStatus;
}

export interface IListingImageUpload {
  id: string;
  file?: File;
  url?: string;
  previewUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface IAppContext {
  webUrl: string;
  siteUrl: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  isAdmin: boolean;
  isModerator: boolean;
  isApprover: boolean;
  locale: string;
  isRtl: boolean;
  isTeams: boolean;
  isDarkTheme: boolean;
}

export interface IServiceContext {
  webUrl: string;
  spHttpClient: import('@microsoft/sp-http').SPHttpClient;
  msGraphClientFactory: import('@microsoft/sp-http').MSGraphClientFactory;
  pageContext: import('@microsoft/sp-page-context').PageContext;
}

export interface INavigationItem {
  key: string;
  label: string;
  icon?: string;
  path: string;
  badge?: number;
  roles?: string[];
  children?: INavigationItem[];
}

export interface IBreadcrumbItem {
  key: string;
  text: string;
  path?: string;
}

export interface ICommandBarItem {
  key: string;
  text: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  split?: boolean;
  subMenuItems?: ICommandBarItem[];
}

export interface IViewMode {
  key: 'grid' | 'list' | 'compact' | 'gallery';
  label: string;
  icon: string;
}

export interface IEmailTemplate {
  key: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export interface IBrandingSettings {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  appTitle?: string;
}

export interface ITelemetryEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  measurements?: Record<string, number>;
}

export interface ILocalizationStrings {
  [key: string]: string | ILocalizationStrings;
}

export interface IPermissionCheck {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canModerate: boolean;
  canAdmin: boolean;
  canViewReports: boolean;
}

export interface ISearchSuggestion {
  text: string;
  type: 'history' | 'category' | 'tag' | 'listing' | 'ai';
  metadata?: Record<string, string>;
}

export interface IConversation {
  id: string;
  participants: string[];
  listingId?: number;
  listingTitle?: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
}

export interface IFeatureRequest extends IEntityBase {
  title: string;
  description: string;
  submittedBy: string;
  votes: number;
  status: 'Open' | 'Planned' | 'InProgress' | 'Completed' | 'Declined';
}
