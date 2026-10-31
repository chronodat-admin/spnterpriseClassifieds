import { ILibrariesSchema, IListSchema } from './types';

import activityLogsSchema from '../../../provisioning/schemas/activity-logs.schema.json';
import announcementsSchema from '../../../provisioning/schemas/announcements.schema.json';
import approvalQueueSchema from '../../../provisioning/schemas/approval-queue.schema.json';
import categoriesSchema from '../../../provisioning/schemas/categories.schema.json';
import conditionsSchema from '../../../provisioning/schemas/conditions.schema.json';
import favoriteCollectionsSchema from '../../../provisioning/schemas/favorite-collections.schema.json';
import favoritesSchema from '../../../provisioning/schemas/favorites.schema.json';
import librariesSchema from '../../../provisioning/schemas/libraries.schema.json';
import listingsSchema from '../../../provisioning/schemas/listings.schema.json';
import locationsSchema from '../../../provisioning/schemas/locations.schema.json';
import messagesSchema from '../../../provisioning/schemas/messages.schema.json';
import notificationsSchema from '../../../provisioning/schemas/notifications.schema.json';
import reportsSchema from '../../../provisioning/schemas/reports.schema.json';
import reviewsSchema from '../../../provisioning/schemas/reviews.schema.json';
import savedSearchesSchema from '../../../provisioning/schemas/saved-searches.schema.json';
import settingsSchema from '../../../provisioning/schemas/settings.schema.json';
import tagsSchema from '../../../provisioning/schemas/tags.schema.json';
import wantedAdsSchema from '../../../provisioning/schemas/wanted-ads.schema.json';

export const LIST_SCHEMAS: IListSchema[] = [
  categoriesSchema as IListSchema,
  conditionsSchema as IListSchema,
  locationsSchema as IListSchema,
  tagsSchema as IListSchema,
  settingsSchema as IListSchema,
  announcementsSchema as IListSchema,
  listingsSchema as IListSchema,
  favoritesSchema as IListSchema,
  favoriteCollectionsSchema as IListSchema,
  messagesSchema as IListSchema,
  reviewsSchema as IListSchema,
  reportsSchema as IListSchema,
  notificationsSchema as IListSchema,
  savedSearchesSchema as IListSchema,
  activityLogsSchema as IListSchema,
  approvalQueueSchema as IListSchema,
  wantedAdsSchema as IListSchema
];

export const LIBRARIES_SCHEMA = librariesSchema as ILibrariesSchema;

export function getListSchema(listName: string): IListSchema | undefined {
  return LIST_SCHEMAS.find(schema => schema.listName === listName);
}

export function getAllSchemaListNames(): string[] {
  return LIST_SCHEMAS.map(schema => schema.listName);
}

export function getAllLibraryNames(): string[] {
  return LIBRARIES_SCHEMA.libraries.map(lib => lib.listName);
}
