export const APP_NAME = 'Enterprise Classifieds 365';
export const APP_VERSION = '1.0.0.23';
export const APP_NAMESPACE = 'EnterpriseClassifieds365';

export const LIST_NAMES = {
  Listings: 'EC365_Listings',
  Categories: 'EC365_Categories',
  Conditions: 'EC365_Conditions',
  Locations: 'EC365_Locations',
  Favorites: 'EC365_Favorites',
  Messages: 'EC365_Messages',
  Reviews: 'EC365_Reviews',
  Reports: 'EC365_Reports',
  Notifications: 'EC365_Notifications',
  SavedSearches: 'EC365_SavedSearches',
  Tags: 'EC365_Tags',
  Settings: 'EC365_Settings',
  ActivityLogs: 'EC365_ActivityLogs',
  ApprovalQueue: 'EC365_ApprovalQueue',
  Announcements: 'EC365_Announcements',
  FeatureRequests: 'EC365_FeatureRequests',
  WantedAds: 'EC365_WantedAds',
  FavoriteCollections: 'EC365_FavoriteCollections'
} as const;

export const LIBRARY_NAMES = {
  ListingImages: 'EC365_ListingImages',
  Documents: 'EC365_Documents',
  SellerAttachments: 'EC365_SellerAttachments',
  Templates: 'EC365_Templates'
} as const;

export const ROLES = {
  Owner: 'EC365_Owners',
  Moderator: 'EC365_Moderators',
  Approver: 'EC365_Approvers',
  Contributor: 'EC365_Contributors',
  Visitor: 'EC365_Visitors'
} as const;

export const LISTING_STATUS = {
  Draft: 'Draft',
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Expired: 'Expired',
  Archived: 'Archived',
  Reserved: 'Reserved',
  Sold: 'Sold'
} as const;

export const LISTING_TYPE = {
  Sell: 'Sell',
  Buy: 'Buy',
  Rent: 'Rent',
  Exchange: 'Exchange',
  Donate: 'Donate',
  Wanted: 'Wanted'
} as const;

export const CONDITION_VALUES = {
  New: 'New',
  LikeNew: 'LikeNew',
  Good: 'Good',
  Fair: 'Fair',
  Poor: 'Poor'
} as const;

export const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR'] as const;

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
export const SEARCH_DEBOUNCE_MS = 300;
export const CACHE_TTL_MS = 5 * 60 * 1000;
export const IMAGE_MAX_SIZE_MB = 10;
export const MAX_IMAGES_PER_LISTING = 20;
export const LISTING_EXPIRY_DAYS = 90;

export const ROUTES = {
  Dashboard: '/',
  Listings: '/listings',
  ListingDetail: '/listings/:id',
  CreateListing: '/create',
  EditListing: '/edit/:id',
  Categories: '/categories',
  SellerProfile: '/seller/:id',
  Favorites: '/favorites',
  WantedAds: '/wanted',
  MyListings: '/my-listings',
  Messages: '/messages',
  Reviews: '/reviews',
  Reports: '/reports',
  Admin: '/admin',
  Search: '/search',
  Settings: '/settings',
  Privacy: '/privacy',
  Terms: '/terms',
  Help: '/help'
} as const;

export const TELEMETRY_EVENTS = {
  PageView: 'PageView',
  ListingCreated: 'ListingCreated',
  ListingViewed: 'ListingViewed',
  SearchPerformed: 'SearchPerformed',
  FavoriteAdded: 'FavoriteAdded',
  MessageSent: 'MessageSent',
  ReportSubmitted: 'ReportSubmitted',
  AiGenerationUsed: 'AiGenerationUsed',
  Error: 'Error'
} as const;

export const ONBOARDING_SETTINGS = {
  Complete: 'OnboardingComplete',
  CompletedOn: 'OnboardingCompletedOn',
  CompletedBy: 'OnboardingCompletedBy',
  Version: 'OnboardingVersion'
} as const;

/** SharePoint Online claim for "Everyone except external users" */
export const EVERYONE_EXCEPT_EXTERNAL_LOGIN = 'c:0-.f|tenant|everyone';

export const AI_SETTINGS_KEYS = {
  Endpoint: 'AiEndpoint',
  DeploymentName: 'AiDeploymentName',
  ApiKeySecret: 'AiApiKeySecret',
  EnableGeneration: 'AiEnableGeneration',
  EnableModeration: 'AiEnableModeration',
  EnableDuplicateDetection: 'AiEnableDuplicateDetection'
} as const;

export const LOCAL_STORAGE_KEYS = {
  Theme: 'ec365_theme',
  Locale: 'ec365_locale',
  SearchHistory: 'ec365_search_history',
  TelemetryOptIn: 'ec365_telemetry_opt_in',
  RecentViews: 'ec365_recent_views'
} as const;
