import {
  IListing,
  ICategory,
  ICondition,
  ILocation,
  IFavorite,
  IMessage,
  IReview,
  IReport,
  INotification,
  ISavedSearch,
  ITag,
  ISetting,
  IActivityLog,
  IApprovalQueueItem,
  IAnnouncement,
  IWantedAd,
  IFavoriteCollection,
  ListingStatus,
  ListingType,
  ConditionValue
} from '../interfaces';

type SharePointItem = Record<string, unknown>;

function parseDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  return new Date(String(value));
}

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(';').filter(Boolean);
}

function parseNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

function parseBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function mapListingItem(item: SharePointItem): IListing {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    description: String(item.EC365_Description ?? ''),
    categoryId: parseNumber(item.EC365_CategoryId),
    categoryName: item.EC365_CategoryName ? String(item.EC365_CategoryName) : undefined,
    sellerId: String(item.EC365_SellerId ?? ''),
    sellerDisplayName: item.EC365_SellerDisplayName ? String(item.EC365_SellerDisplayName) : undefined,
    sellerEmail: item.EC365_SellerEmail ? String(item.EC365_SellerEmail) : undefined,
    department: item.EC365_Department ? String(item.EC365_Department) : undefined,
    office: item.EC365_Office ? String(item.EC365_Office) : undefined,
    status: String(item.EC365_Status ?? 'Draft') as ListingStatus,
    listingType: String(item.EC365_ListingType ?? 'Sell') as ListingType,
    condition: String(item.EC365_Condition ?? 'Good') as ConditionValue,
    price: parseNumber(item.EC365_Price),
    currency: String(item.EC365_Currency ?? 'USD'),
    isNegotiable: parseBool(item.EC365_IsNegotiable),
    isFeatured: parseBool(item.EC365_IsFeatured),
    isRental: parseBool(item.EC365_IsRental),
    isAuction: parseBool(item.EC365_IsAuction),
    isDonation: parseBool(item.EC365_IsDonation),
    locationId: item.EC365_LocationId ? parseNumber(item.EC365_LocationId) : undefined,
    locationName: item.EC365_LocationName ? String(item.EC365_LocationName) : undefined,
    building: item.EC365_Building ? String(item.EC365_Building) : undefined,
    city: item.EC365_City ? String(item.EC365_City) : undefined,
    country: item.EC365_Country ? String(item.EC365_Country) : undefined,
    pickupAvailable: parseBool(item.EC365_PickupAvailable),
    shippingAvailable: parseBool(item.EC365_ShippingAvailable),
    imageUrls: parseStringArray(item.EC365_ImageUrls),
    thumbnailUrl: item.EC365_ThumbnailUrl ? String(item.EC365_ThumbnailUrl) : undefined,
    tags: parseStringArray(item.EC365_Tags),
    keywords: item.EC365_Keywords ? String(item.EC365_Keywords) : undefined,
    viewCount: parseNumber(item.EC365_ViewCount),
    favoriteCount: parseNumber(item.EC365_FavoriteCount),
    messageCount: parseNumber(item.EC365_MessageCount),
    expiresOn: item.EC365_ExpiresOn ? parseDate(item.EC365_ExpiresOn) : undefined,
    publishedOn: item.EC365_PublishedOn ? parseDate(item.EC365_PublishedOn) : undefined,
    reservedBy: item.EC365_ReservedBy ? String(item.EC365_ReservedBy) : undefined,
    soldOn: item.EC365_SoldOn ? parseDate(item.EC365_SoldOn) : undefined,
    approvalNotes: item.EC365_ApprovalNotes ? String(item.EC365_ApprovalNotes) : undefined,
    aiGenerated: parseBool(item.EC365_AiGenerated),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified),
    createdBy: item.Author ? String((item.Author as SharePointItem).Title ?? item.Author) : undefined,
    modifiedBy: item.Editor ? String((item.Editor as SharePointItem).Title ?? item.Editor) : undefined
  };
}

export function mapListingToSharePoint(listing: Partial<IListing>): SharePointItem {
  return {
    Title: listing.title,
    EC365_Description: listing.description,
    EC365_CategoryId: listing.categoryId,
    EC365_SellerId: listing.sellerId,
    EC365_SellerDisplayName: listing.sellerDisplayName,
    EC365_SellerEmail: listing.sellerEmail,
    EC365_Department: listing.department,
    EC365_Office: listing.office,
    EC365_Status: listing.status,
    EC365_ListingType: listing.listingType,
    EC365_Condition: listing.condition,
    EC365_Price: listing.price,
    EC365_Currency: listing.currency,
    EC365_IsNegotiable: listing.isNegotiable,
    EC365_IsFeatured: listing.isFeatured,
    EC365_IsRental: listing.isRental,
    EC365_IsAuction: listing.isAuction,
    EC365_IsDonation: listing.isDonation,
    EC365_LocationId: listing.locationId,
    EC365_Building: listing.building,
    EC365_City: listing.city,
    EC365_Country: listing.country,
    EC365_PickupAvailable: listing.pickupAvailable,
    EC365_ShippingAvailable: listing.shippingAvailable,
    EC365_ImageUrls: listing.imageUrls?.join(';'),
    EC365_ThumbnailUrl: listing.thumbnailUrl,
    EC365_Tags: listing.tags?.join(';'),
    EC365_Keywords: listing.keywords,
    EC365_ViewCount: listing.viewCount,
    EC365_FavoriteCount: listing.favoriteCount,
    EC365_MessageCount: listing.messageCount,
    EC365_ExpiresOn: listing.expiresOn?.toISOString(),
    EC365_PublishedOn: listing.publishedOn?.toISOString(),
    EC365_ReservedBy: listing.reservedBy,
    EC365_SoldOn: listing.soldOn?.toISOString(),
    EC365_ApprovalNotes: listing.approvalNotes,
    EC365_AiGenerated: listing.aiGenerated
  };
}

export function mapCategoryItem(item: SharePointItem): ICategory {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    description: item.EC365_Description ? String(item.EC365_Description) : undefined,
    parentId: item.EC365_ParentId ? parseNumber(item.EC365_ParentId) : undefined,
    iconName: item.EC365_IconName ? String(item.EC365_IconName) : undefined,
    color: item.EC365_Color ? String(item.EC365_Color) : undefined,
    imageUrl: item.EC365_ImageUrl ? String(item.EC365_ImageUrl) : undefined,
    sortOrder: parseNumber(item.EC365_SortOrder),
    isVisible: parseBool(item.EC365_IsVisible ?? true),
    approvalRequired: parseBool(item.EC365_ApprovalRequired),
    listingCount: item.EC365_ListingCount ? parseNumber(item.EC365_ListingCount) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapConditionItem(item: SharePointItem): ICondition {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    description: item.EC365_Description ? String(item.EC365_Description) : undefined,
    sortOrder: parseNumber(item.EC365_SortOrder),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapLocationItem(item: SharePointItem): ILocation {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    office: item.EC365_Office ? String(item.EC365_Office) : undefined,
    building: item.EC365_Building ? String(item.EC365_Building) : undefined,
    city: item.EC365_City ? String(item.EC365_City) : undefined,
    country: item.EC365_Country ? String(item.EC365_Country) : undefined,
    sortOrder: parseNumber(item.EC365_SortOrder),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapFavoriteItem(item: SharePointItem): IFavorite {
  return {
    id: parseNumber(item.Id),
    userId: String(item.EC365_UserId ?? ''),
    listingId: parseNumber(item.EC365_ListingId),
    collectionId: item.EC365_CollectionId ? parseNumber(item.EC365_CollectionId) : undefined,
    notifyOnChange: parseBool(item.EC365_NotifyOnChange),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapMessageItem(item: SharePointItem): IMessage {
  return {
    id: parseNumber(item.Id),
    conversationId: String(item.EC365_ConversationId ?? ''),
    senderId: String(item.EC365_SenderId ?? ''),
    senderDisplayName: item.EC365_SenderDisplayName ? String(item.EC365_SenderDisplayName) : undefined,
    recipientId: String(item.EC365_RecipientId ?? ''),
    recipientDisplayName: item.EC365_RecipientDisplayName ? String(item.EC365_RecipientDisplayName) : undefined,
    listingId: item.EC365_ListingId ? parseNumber(item.EC365_ListingId) : undefined,
    listingTitle: item.EC365_ListingTitle ? String(item.EC365_ListingTitle) : undefined,
    body: String(item.EC365_Body ?? ''),
    isRead: parseBool(item.EC365_IsRead),
    attachmentUrl: item.EC365_AttachmentUrl ? String(item.EC365_AttachmentUrl) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapReviewItem(item: SharePointItem): IReview {
  return {
    id: parseNumber(item.Id),
    listingId: parseNumber(item.EC365_ListingId),
    reviewerId: String(item.EC365_ReviewerId ?? ''),
    reviewerDisplayName: item.EC365_ReviewerDisplayName ? String(item.EC365_ReviewerDisplayName) : undefined,
    sellerId: String(item.EC365_SellerId ?? ''),
    rating: parseNumber(item.EC365_Rating),
    comment: String(item.EC365_Comment ?? ''),
    isModerated: parseBool(item.EC365_IsModerated),
    isReported: parseBool(item.EC365_IsReported),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapReportItem(item: SharePointItem): IReport {
  return {
    id: parseNumber(item.Id),
    listingId: parseNumber(item.EC365_ListingId),
    reporterId: String(item.EC365_ReporterId ?? ''),
    reportType: String(item.EC365_ReportType ?? 'Other') as IReport['reportType'],
    reason: String(item.EC365_Reason ?? ''),
    status: String(item.EC365_Status ?? 'Pending') as IReport['status'],
    adminNotes: item.EC365_AdminNotes ? String(item.EC365_AdminNotes) : undefined,
    reviewedBy: item.EC365_ReviewedBy ? String(item.EC365_ReviewedBy) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapNotificationItem(item: SharePointItem): INotification {
  return {
    id: parseNumber(item.Id),
    userId: String(item.EC365_UserId ?? ''),
    title: String(item.Title ?? ''),
    message: String(item.EC365_Message ?? ''),
    type: String(item.EC365_Type ?? 'System') as INotification['type'],
    linkUrl: item.EC365_LinkUrl ? String(item.EC365_LinkUrl) : undefined,
    isRead: parseBool(item.EC365_IsRead),
    relatedListingId: item.EC365_RelatedListingId ? parseNumber(item.EC365_RelatedListingId) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapSavedSearchItem(item: SharePointItem): ISavedSearch {
  return {
    id: parseNumber(item.Id),
    userId: String(item.EC365_UserId ?? ''),
    title: String(item.Title ?? ''),
    query: String(item.EC365_Query ?? ''),
    filtersJson: String(item.EC365_FiltersJson ?? '{}'),
    notifyOnMatch: parseBool(item.EC365_NotifyOnMatch),
    lastRun: item.EC365_LastRun ? parseDate(item.EC365_LastRun) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapTagItem(item: SharePointItem): ITag {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    usageCount: parseNumber(item.EC365_UsageCount),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapSettingItem(item: SharePointItem): ISetting {
  return {
    id: parseNumber(item.Id),
    key: String(item.Title ?? ''),
    value: String(item.EC365_Value ?? ''),
    category: String(item.EC365_Category ?? 'General') as ISetting['category'],
    description: item.EC365_Description ? String(item.EC365_Description) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapActivityLogItem(item: SharePointItem): IActivityLog {
  return {
    id: parseNumber(item.Id),
    userId: String(item.EC365_UserId ?? ''),
    userDisplayName: item.EC365_UserDisplayName ? String(item.EC365_UserDisplayName) : undefined,
    action: String(item.EC365_Action ?? ''),
    entityType: String(item.EC365_EntityType ?? ''),
    entityId: parseNumber(item.EC365_EntityId),
    details: item.EC365_Details ? String(item.EC365_Details) : undefined,
    ipAddress: item.EC365_IpAddress ? String(item.EC365_IpAddress) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapApprovalQueueItem(item: SharePointItem): IApprovalQueueItem {
  return {
    id: parseNumber(item.Id),
    listingId: parseNumber(item.EC365_ListingId),
    listingTitle: item.EC365_ListingTitle ? String(item.EC365_ListingTitle) : undefined,
    submittedBy: String(item.EC365_SubmittedBy ?? ''),
    submittedOn: parseDate(item.EC365_SubmittedOn),
    status: String(item.EC365_Status ?? 'Pending') as IApprovalQueueItem['status'],
    reviewedBy: item.EC365_ReviewedBy ? String(item.EC365_ReviewedBy) : undefined,
    reviewedOn: item.EC365_ReviewedOn ? parseDate(item.EC365_ReviewedOn) : undefined,
    notes: item.EC365_Notes ? String(item.EC365_Notes) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapAnnouncementItem(item: SharePointItem): IAnnouncement {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    body: String(item.EC365_Body ?? ''),
    isActive: parseBool(item.EC365_IsActive ?? true),
    startDate: item.EC365_StartDate ? parseDate(item.EC365_StartDate) : undefined,
    endDate: item.EC365_EndDate ? parseDate(item.EC365_EndDate) : undefined,
    priority: parseNumber(item.EC365_Priority),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapWantedAdItem(item: SharePointItem): IWantedAd {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    description: String(item.EC365_Description ?? ''),
    categoryId: parseNumber(item.EC365_CategoryId),
    userId: String(item.EC365_UserId ?? ''),
    userDisplayName: item.EC365_UserDisplayName ? String(item.EC365_UserDisplayName) : undefined,
    maxPrice: item.EC365_MaxPrice ? parseNumber(item.EC365_MaxPrice) : undefined,
    currency: item.EC365_Currency ? String(item.EC365_Currency) : undefined,
    locationId: item.EC365_LocationId ? parseNumber(item.EC365_LocationId) : undefined,
    isActive: parseBool(item.EC365_IsActive ?? true),
    matchCount: item.EC365_MatchCount ? parseNumber(item.EC365_MatchCount) : undefined,
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapFavoriteCollectionItem(item: SharePointItem): IFavoriteCollection {
  return {
    id: parseNumber(item.Id),
    title: String(item.Title ?? ''),
    userId: String(item.EC365_UserId ?? ''),
    description: item.EC365_Description ? String(item.EC365_Description) : undefined,
    isDefault: parseBool(item.EC365_IsDefault),
    created: parseDate(item.Created),
    modified: parseDate(item.Modified)
  };
}

export function mapCategoryToSharePoint(category: Partial<ICategory>): SharePointItem {
  return {
    Title: category.title,
    EC365_Description: category.description,
    EC365_ParentId: category.parentId,
    EC365_IconName: category.iconName,
    EC365_Color: category.color,
    EC365_ImageUrl: category.imageUrl,
    EC365_SortOrder: category.sortOrder,
    EC365_IsVisible: category.isVisible,
    EC365_ApprovalRequired: category.approvalRequired,
    EC365_ListingCount: category.listingCount
  };
}

export function mapConditionToSharePoint(condition: Partial<ICondition>): SharePointItem {
  return {
    Title: condition.title,
    EC365_Description: condition.description,
    EC365_SortOrder: condition.sortOrder
  };
}

export function mapLocationToSharePoint(location: Partial<ILocation>): SharePointItem {
  return {
    Title: location.title,
    EC365_Office: location.office,
    EC365_Building: location.building,
    EC365_City: location.city,
    EC365_Country: location.country,
    EC365_SortOrder: location.sortOrder
  };
}

export function mapFavoriteToSharePoint(favorite: Partial<IFavorite>): SharePointItem {
  return {
    Title: `Favorite-${favorite.listingId ?? 0}`,
    EC365_UserId: favorite.userId,
    EC365_ListingId: favorite.listingId,
    EC365_CollectionId: favorite.collectionId,
    EC365_NotifyOnChange: favorite.notifyOnChange
  };
}

export function mapMessageToSharePoint(message: Partial<IMessage>): SharePointItem {
  return {
    Title: message.conversationId ?? `Message-${Date.now()}`,
    EC365_ConversationId: message.conversationId,
    EC365_SenderId: message.senderId,
    EC365_SenderDisplayName: message.senderDisplayName,
    EC365_RecipientId: message.recipientId,
    EC365_RecipientDisplayName: message.recipientDisplayName,
    EC365_ListingId: message.listingId,
    EC365_ListingTitle: message.listingTitle,
    EC365_Body: message.body,
    EC365_IsRead: message.isRead,
    EC365_AttachmentUrl: message.attachmentUrl
  };
}

export function mapReviewToSharePoint(review: Partial<IReview>): SharePointItem {
  return {
    Title: `Review-${review.listingId ?? 0}`,
    EC365_ListingId: review.listingId,
    EC365_ReviewerId: review.reviewerId,
    EC365_ReviewerDisplayName: review.reviewerDisplayName,
    EC365_SellerId: review.sellerId,
    EC365_Rating: review.rating,
    EC365_Comment: review.comment,
    EC365_IsModerated: review.isModerated,
    EC365_IsReported: review.isReported
  };
}

export function mapReportToSharePoint(report: Partial<IReport>): SharePointItem {
  return {
    Title: `Report-${report.listingId ?? 0}`,
    EC365_ListingId: report.listingId,
    EC365_ReporterId: report.reporterId,
    EC365_ReportType: report.reportType,
    EC365_Reason: report.reason,
    EC365_Status: report.status,
    EC365_AdminNotes: report.adminNotes,
    EC365_ReviewedBy: report.reviewedBy
  };
}

export function mapNotificationToSharePoint(notification: Partial<INotification>): SharePointItem {
  return {
    Title: notification.title,
    EC365_UserId: notification.userId,
    EC365_Message: notification.message,
    EC365_Type: notification.type,
    EC365_LinkUrl: notification.linkUrl,
    EC365_IsRead: notification.isRead,
    EC365_RelatedListingId: notification.relatedListingId
  };
}

export function mapSavedSearchToSharePoint(search: Partial<ISavedSearch>): SharePointItem {
  return {
    Title: search.title,
    EC365_UserId: search.userId,
    EC365_Query: search.query,
    EC365_FiltersJson: search.filtersJson,
    EC365_NotifyOnMatch: search.notifyOnMatch,
    EC365_LastRun: search.lastRun?.toISOString()
  };
}

export function mapTagToSharePoint(tag: Partial<ITag>): SharePointItem {
  return {
    Title: tag.title,
    EC365_UsageCount: tag.usageCount
  };
}

export function mapSettingToSharePoint(setting: Partial<ISetting>): SharePointItem {
  return {
    Title: setting.key,
    EC365_Value: setting.value,
    EC365_Category: setting.category,
    EC365_Description: setting.description
  };
}

export function mapActivityLogToSharePoint(log: Partial<IActivityLog>): SharePointItem {
  return {
    Title: `${log.action ?? 'Activity'}-${log.entityId ?? 0}`,
    EC365_UserId: log.userId,
    EC365_UserDisplayName: log.userDisplayName,
    EC365_Action: log.action,
    EC365_EntityType: log.entityType,
    EC365_EntityId: log.entityId,
    EC365_Details: log.details,
    EC365_IpAddress: log.ipAddress
  };
}

export function mapApprovalQueueToSharePoint(item: Partial<IApprovalQueueItem>): SharePointItem {
  return {
    Title: item.listingTitle ?? `Approval-${item.listingId ?? 0}`,
    EC365_ListingId: item.listingId,
    EC365_ListingTitle: item.listingTitle,
    EC365_SubmittedBy: item.submittedBy,
    EC365_SubmittedOn: item.submittedOn?.toISOString(),
    EC365_Status: item.status,
    EC365_ReviewedBy: item.reviewedBy,
    EC365_ReviewedOn: item.reviewedOn?.toISOString(),
    EC365_Notes: item.notes
  };
}

export function mapAnnouncementToSharePoint(announcement: Partial<IAnnouncement>): SharePointItem {
  return {
    Title: announcement.title,
    EC365_Body: announcement.body,
    EC365_IsActive: announcement.isActive,
    EC365_StartDate: announcement.startDate?.toISOString(),
    EC365_EndDate: announcement.endDate?.toISOString(),
    EC365_Priority: announcement.priority
  };
}

export function mapWantedAdToSharePoint(wantedAd: Partial<IWantedAd>): SharePointItem {
  return {
    Title: wantedAd.title,
    EC365_Description: wantedAd.description,
    EC365_CategoryId: wantedAd.categoryId,
    EC365_UserId: wantedAd.userId,
    EC365_UserDisplayName: wantedAd.userDisplayName,
    EC365_MaxPrice: wantedAd.maxPrice,
    EC365_Currency: wantedAd.currency,
    EC365_LocationId: wantedAd.locationId,
    EC365_IsActive: wantedAd.isActive,
    EC365_MatchCount: wantedAd.matchCount
  };
}

export function buildCategoryTree(categories: ICategory[]): ICategory[] {
  const map = new Map<number, ICategory>();
  const roots: ICategory[] = [];

  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });

  map.forEach(cat => {
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(cat);
      }
    } else {
      roots.push(cat);
    }
  });

  const sortCategories = (items: ICategory[]): void => {
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    items.forEach(item => {
      if (item.children?.length) sortCategories(item.children);
    });
  };

  sortCategories(roots);
  return roots;
}
