import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import '@pnp/sp/security';
import '@pnp/sp/site-groups/web';
import '@pnp/sp/site-users/web';

import { initializePnP } from './SharePointContextFactory';
import { retryAsync } from '../utilities';
import {
  ILibrariesSchema,
  IListSchema,
  IProvisioningResult,
  IProvisioningSummary,
  ISecurityGroup,
  ISecurityGroupsSchema,
  ISchemaColumn,
  ISchemaView
} from './provisioning/types';
import { LIBRARIES_SCHEMA, LIST_SCHEMAS } from './provisioning/schemaRegistry';
import { EVERYONE_EXCEPT_EXTERNAL_LOGIN, LIST_NAMES, ROLES } from '../constants';

import securityGroupsSchema from '../../provisioning/security/groups.json';

const LIST_TEMPLATE_GENERIC = 100;
const LIST_TEMPLATE_DOCUMENT_LIBRARY = 101;

export class ProvisioningService {
  private sp: SPFI;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
    const { sp } = initializePnP(context);
    this.sp = sp;
  }

  public async provisionAll(options?: {
    skipExisting?: boolean;
    seedData?: boolean;
    seedGroupMembers?: boolean;
    groupsFirst?: boolean;
  }): Promise<IProvisioningSummary> {
    const skipExisting = options?.skipExisting ?? true;
    const seedData = options?.seedData ?? true;
    const seedGroupMembers = options?.seedGroupMembers ?? false;
    const groupsFirst = options?.groupsFirst ?? false;

    const schema = securityGroupsSchema as unknown as ISecurityGroupsSchema;

    const provisionGroups = (): Promise<IProvisioningResult[]> =>
      this.provisionSecurityGroups(schema, { skipExisting, seedMembers: seedGroupMembers });

    const listResults: IProvisioningResult[] = [];
    const libraryResults: IProvisioningResult[] = [];
    let groupResults: IProvisioningResult[] = [];

    if (groupsFirst) {
      groupResults = await provisionGroups();
    }

    for (const listSchema of LIST_SCHEMAS) {
      listResults.push(await this.provisionList(listSchema, { skipExisting, seedData }));
    }

    for (const library of LIBRARIES_SCHEMA.libraries) {
      libraryResults.push(await this.provisionLibrary(library, { skipExisting }));
    }

    if (!groupsFirst) {
      groupResults = await provisionGroups();
    }

    return {
      lists: listResults,
      libraries: libraryResults,
      groups: groupResults,
      success: [...listResults, ...libraryResults, ...groupResults].every(r => r.errors.length === 0)
    };
  }

  public async areSecurityGroupsProvisioned(): Promise<boolean> {
    try {
      const requiredGroups = Object.values(ROLES);
      const existingGroups = await this.sp.web.siteGroups.select('Title')();
      const existingTitles = new Set(existingGroups.map(g => g.Title));
      return requiredGroups.every(title => existingTitles.has(title));
    } catch {
      return false;
    }
  }

  public async isCoreListProvisioned(): Promise<boolean> {
    return this.listExists(LIST_NAMES.Settings);
  }

  public async provisionList(
    schema: IListSchema,
    options?: { skipExisting?: boolean; seedData?: boolean }
  ): Promise<IProvisioningResult> {
    const skipExisting = options?.skipExisting ?? true;
    const seedData = options?.seedData ?? true;
    const result: IProvisioningResult = {
      listName: schema.listName,
      created: false,
      skipped: false,
      errors: []
    };

    try {
      const exists = await this.listExists(schema.listName);
      if (exists) {
        if (skipExisting) {
          result.skipped = true;
          return result;
        }
      } else {
        await retryAsync(async () => {
          await this.sp.web.lists.add(
            schema.listName,
            schema.description,
            LIST_TEMPLATE_GENERIC,
            true,
            {
              EnableAttachments: schema.enableAttachments ?? false,
              EnableVersioning: schema.enableVersioning ?? true
            }
          );
        });
        result.created = true;
      }

      await this.ensureColumns(schema.listName, schema.columns, result);
      await this.ensureIndexedColumns(schema.listName, schema.columns, schema.indexedColumns, result);
      await this.ensureViews(schema.listName, schema.views, result);

      if (seedData && schema.seedData?.length) {
        await this.seedListItems(schema.listName, schema.seedData, result);
      }
    } catch (error) {
      result.errors.push(this.formatError(error));
    }

    return result;
  }

  public async provisionLibrary(
    library: ILibrariesSchema['libraries'][number],
    options?: { skipExisting?: boolean }
  ): Promise<IProvisioningResult> {
    const skipExisting = options?.skipExisting ?? true;
    const result: IProvisioningResult = {
      listName: library.listName,
      created: false,
      skipped: false,
      errors: []
    };

    try {
      const exists = await this.listExists(library.listName);
      if (exists) {
        if (skipExisting) {
          result.skipped = true;
          return result;
        }
      } else {
        await retryAsync(async () => {
          await this.sp.web.lists.add(
            library.listName,
            library.description,
            LIST_TEMPLATE_DOCUMENT_LIBRARY,
            true,
            {
              EnableVersioning: library.enableVersioning ?? true,
              EnableMinorVersions: library.enableMinorVersions ?? false
            }
          );
        });
        result.created = true;
      }

      await this.ensureColumns(library.listName, library.columns, result);
      await this.ensureIndexedColumns(library.listName, library.columns, library.indexedColumns, result);
      await this.ensureViews(library.listName, library.views, result);
    } catch (error) {
      result.errors.push(this.formatError(error));
    }

    return result;
  }

  public async provisionSecurityGroups(
    schema: ISecurityGroupsSchema,
    options?: { skipExisting?: boolean; seedMembers?: boolean }
  ): Promise<IProvisioningResult[]> {
    const skipExisting = options?.skipExisting ?? true;
    const seedMembers = options?.seedMembers ?? false;
    const results: IProvisioningResult[] = [];
    const currentUserLogin = this.context.pageContext.user.loginName;

    for (const group of schema.groups) {
      const result: IProvisioningResult = {
        listName: group.title,
        created: false,
        skipped: false,
        errors: []
      };

      try {
        const existingGroups = await this.sp.web.siteGroups.select('Title')();
        const exists = existingGroups.some(g => g.Title === group.title);

        if (exists) {
          if (skipExisting) {
            result.skipped = true;
          }
        } else {
          await retryAsync(async () => {
            await this.sp.web.siteGroups.add({
              Title: group.title,
              Description: group.description,
              AllowMembersEditMembership: group.allowMembersEditMembership,
              AllowRequestToJoinLeave: group.allowRequestToJoinLeave,
              AutoAcceptRequestToJoinLeave: group.autoAcceptRequestToJoinLeave,
              OnlyAllowMembersViewMembership: group.onlyAllowMembersViewMembership
            });
          });
          result.created = true;
        }

        const groupItems = await this.sp.web.siteGroups
          .filter(`Title eq '${group.title.replace(/'/g, "''")}'`)
          .select('Id')();
        const groupId = groupItems[0]?.Id;

        if (groupId) {
          try {
            const roleDef = await this.sp.web.roleDefinitions.getByName(group.permissionLevel)();
            await this.sp.web.roleAssignments.add(groupId, roleDef.Id);
          } catch (assignmentError) {
            if (!this.isAlreadyExistsError(assignmentError)) {
              result.errors.push(this.formatError(assignmentError));
            }
          }

          if (seedMembers) {
            const seedErrors = await this.seedGroupMembers(group.title, group, currentUserLogin);
            result.errors.push(...seedErrors);
          }
        }
      } catch (error) {
        result.errors.push(this.formatError(error));
      }

      results.push(result);
    }

    return results;
  }

  private async seedGroupMembers(
    groupTitle: string,
    group: ISecurityGroup,
    currentUserLogin: string
  ): Promise<string[]> {
    const errors: string[] = [];
    const membersToAdd = new Set<string>();

    group.defaultMembers.forEach(member => {
      if (member.trim()) membersToAdd.add(member.trim());
    });

    const rules = group.seedRules;
    if (rules?.includeCurrentUser && currentUserLogin) {
      membersToAdd.add(currentUserLogin);
    }

    if (rules?.includeSiteCollectionAdmins) {
      try {
        const admins = await this.sp.web.siteUsers
          .filter('IsSiteAdmin eq true')
          .select('LoginName')();
        admins.forEach(admin => {
          if (admin.LoginName) membersToAdd.add(String(admin.LoginName));
        });
      } catch (error) {
        errors.push(`Site admins for ${groupTitle}: ${this.formatError(error)}`);
      }
    }

    if (rules?.includeAssociatedGroupMembers) {
      try {
        const webInfo = await this.sp.web.select(
          'AssociatedMemberGroup/Title',
          'AssociatedVisitorGroup/Title'
        ).expand('AssociatedMemberGroup', 'AssociatedVisitorGroup')();

        const associatedTitle = rules.includeAssociatedGroupMembers === 'Members'
          ? (webInfo as { AssociatedMemberGroup?: { Title?: string } }).AssociatedMemberGroup?.Title
          : (webInfo as { AssociatedVisitorGroup?: { Title?: string } }).AssociatedVisitorGroup?.Title;

        if (associatedTitle) {
          const associatedUsers = await this.sp.web.siteGroups
            .getByName(associatedTitle)
            .users.select('LoginName')();
          associatedUsers.forEach(user => {
            if (user.LoginName) membersToAdd.add(String(user.LoginName));
          });
        }
      } catch (error) {
        errors.push(`Associated group members for ${groupTitle}: ${this.formatError(error)}`);
      }
    }

    if (rules?.includeEveryoneExceptExternal) {
      membersToAdd.add(EVERYONE_EXCEPT_EXTERNAL_LOGIN);
    }

    const siteGroup = this.sp.web.siteGroups.getByName(groupTitle);
    for (const loginName of membersToAdd) {
      try {
        await retryAsync(async () => {
          await siteGroup.users.add(loginName);
        }, 2, 500);
      } catch (error) {
        if (!this.isAlreadyExistsError(error)) {
          errors.push(`Member ${loginName} in ${groupTitle}: ${this.formatError(error)}`);
        }
      }
    }

    return errors;
  }

  private isAlreadyExistsError(error: unknown): boolean {
    const message = this.formatError(error).toLowerCase();
    return message.includes('already') ||
      message.includes('duplicate') ||
      message.includes('exists') ||
      message.includes('conflict');
  }

  private async listExists(listTitle: string): Promise<boolean> {
    try {
      const escaped = listTitle.replace(/'/g, "''");
      const matches = await this.sp.web.lists
        .filter(`Title eq '${escaped}'`)
        .select('Id')
        .top(1)();
      return matches.length > 0;
    } catch {
      return false;
    }
  }

  private async ensureColumns(
    listTitle: string,
    columns: ISchemaColumn[],
    result: IProvisioningResult
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(listTitle);
    const existingFields = await list.fields.select('InternalName')();
    const existingNames = new Set(existingFields.map(f => f.InternalName));

    for (const column of columns) {
      if (column.internalName === 'Title' || existingNames.has(column.internalName)) {
        continue;
      }

      try {
        await retryAsync(async () => {
          await this.addField(list, column);
        });
      } catch (error) {
        result.errors.push(`Column ${column.internalName}: ${this.formatError(error)}`);
      }
    }
  }

  private async addField(
    list: ReturnType<SPFI['web']['lists']['getByTitle']>,
    column: ISchemaColumn
  ): Promise<void> {
    const baseProps = {
      Title: column.displayName,
      Required: column.required
    };

    switch (column.type) {
      case 'Text':
        await list.fields.addText(column.internalName, {
          ...baseProps,
          MaxLength: column.validation?.maxLength ?? 255
        });
        break;
      case 'Note':
        await list.fields.addMultilineText(column.internalName, {
          ...baseProps,
          NumberOfLines: column.validation?.numberOfLines ?? 6,
          RichText: false,
          RestrictedMode: true,
          AppendOnly: false
        });
        break;
      case 'Number':
        await list.fields.addNumber(column.internalName, {
          ...baseProps,
          MinimumValue: column.validation?.minValue,
          MaximumValue: column.validation?.maxValue
        });
        break;
      case 'Currency':
        await list.fields.addCurrency(column.internalName, {
          ...baseProps,
          MinimumValue: column.validation?.minValue ?? 0,
          CurrencyLocaleId: column.validation?.currencyLocaleId ?? 1033
        });
        break;
      case 'Boolean':
        await list.fields.addBoolean(column.internalName, baseProps);
        break;
      case 'Choice':
        await list.fields.addChoice(column.internalName, {
          ...baseProps,
          Choices: column.choices ?? [],
          FillInChoice: column.validation?.fillInChoice ?? false
        });
        break;
      case 'DateTime':
        await list.fields.addDateTime(column.internalName, {
          ...baseProps,
          DisplayFormat: column.validation?.displayFormat === 'DateOnly' ? 0 : 1,
          FriendlyDisplayFormat: column.validation?.friendlyFormat === 'Relative' ? 1 : 0
        });
        break;
      case 'URL':
        await list.fields.addUrl(column.internalName, {
          ...baseProps,
          DisplayFormat: column.validation?.format === 'Image' ? 1 : 0
        });
        break;
      default:
        throw new Error(`Unsupported field type: ${column.type}`);
    }

    if (column.defaultValue !== undefined) {
      await list.fields.getByInternalNameOrTitle(column.internalName).update({
        DefaultValue: String(column.defaultValue)
      });
    }
  }

  private async ensureIndexedColumns(
    listTitle: string,
    columns: ISchemaColumn[],
    indexedColumns: IListSchema['indexedColumns'],
    result: IProvisioningResult
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(listTitle);
    const indexedFieldNames = new Set<string>();

    columns.filter(c => c.indexed).forEach(c => indexedFieldNames.add(c.internalName));
    indexedColumns.forEach(idx => idx.columns.forEach(name => indexedFieldNames.add(name)));

    for (const fieldName of indexedFieldNames) {
      if (fieldName === 'Title') continue;
      try {
        await retryAsync(async () => {
          await list.fields.getByInternalNameOrTitle(fieldName).update({ Indexed: true });
        });
      } catch (error) {
        result.errors.push(`Index ${fieldName}: ${this.formatError(error)}`);
      }
    }
  }

  private async ensureViews(
    listTitle: string,
    views: ISchemaView[],
    result: IProvisioningResult
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(listTitle);
    const existingViews = await list.views.select('Title')();
    const existingTitles = new Set(existingViews.map(v => v.Title));

    for (const view of views) {
      if (existingTitles.has(view.title)) {
        continue;
      }

      try {
        await retryAsync(async () => {
          const sortField = view.sort?.[0]?.field ?? 'ID';
          const sortAscending = view.sort?.[0]?.ascending ?? true;

          await list.views.add(view.title, false, {
            RowLimit: view.rowLimit,
            ViewQuery: view.query ?? '',
            ViewFields: view.fields,
            DefaultView: view.default ?? false,
            Paged: true
          });

          if (view.sort?.length) {
            const createdView = list.views.getByTitle(view.title);
            await createdView.fields.move(sortField, 0);
            await createdView.update({
              ViewQuery: view.query ?? `<OrderBy><FieldRef Name='${sortField}' Ascending='${sortAscending ? 'TRUE' : 'FALSE'}'/></OrderBy>`
            });
          }
        });
      } catch (error) {
        result.errors.push(`View ${view.title}: ${this.formatError(error)}`);
      }
    }
  }

  private async seedListItems(
    listTitle: string,
    seedData: Record<string, unknown>[],
    result: IProvisioningResult
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(listTitle);
    const existingItems = await list.items.select('Id').top(1)();

    if (existingItems.length > 0) {
      return;
    }

    for (const item of seedData) {
      try {
        await retryAsync(async () => {
          await list.items.add(item);
        });
      } catch (error) {
        result.errors.push(`Seed data: ${this.formatError(error)}`);
      }
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
