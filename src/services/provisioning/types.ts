export type SharePointFieldType =
  | 'Text'
  | 'Note'
  | 'Number'
  | 'Currency'
  | 'Boolean'
  | 'Choice'
  | 'MultiChoice'
  | 'DateTime'
  | 'User'
  | 'URL'
  | 'Lookup';

export interface IFieldValidation {
  maxLength?: number;
  minLength?: number;
  minValue?: number;
  maxValue?: number;
  decimals?: number;
  pattern?: string;
  fillInChoice?: boolean;
  allowHyperlink?: boolean;
  numberOfLines?: number;
  displayFormat?: 'DateOnly' | 'DateTime';
  friendlyFormat?: 'Disabled' | 'Relative';
  format?: 'Hyperlink' | 'Image';
  currencyLocaleId?: number;
}

export interface ISchemaColumn {
  internalName: string;
  displayName: string;
  type: SharePointFieldType;
  required: boolean;
  indexed: boolean;
  defaultValue?: string | number | boolean;
  choices?: string[];
  validation?: IFieldValidation;
}

export interface IIndexedColumn {
  columns: string[];
  primary: boolean;
}

export interface ISchemaContentType {
  name: string;
  id: string;
  description: string;
  group: string;
  parentContentType?: string;
  fields: string[];
}

export interface ISchemaViewSort {
  field: string;
  ascending: boolean;
}

export interface ISchemaView {
  title: string;
  viewType: 'HTML' | 'GANTT' | 'CALENDAR';
  rowLimit: number;
  default?: boolean;
  query?: string;
  fields: string[];
  sort?: ISchemaViewSort[];
}

export interface IListSchema {
  schemaVersion: string;
  listName: string;
  displayName: string;
  description: string;
  template: 'GenericList' | 'DocumentLibrary';
  enableAttachments?: boolean;
  enableVersioning?: boolean;
  enableMinorVersions?: boolean;
  enableContentTypes?: boolean;
  enableThumbnails?: boolean;
  columns: ISchemaColumn[];
  indexedColumns: IIndexedColumn[];
  contentTypes: ISchemaContentType[];
  views: ISchemaView[];
  seedData?: Record<string, unknown>[];
}

export interface ILibraryDefinition extends Omit<IListSchema, 'template'> {
  template: 'DocumentLibrary';
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export interface ILibrariesSchema {
  schemaVersion: string;
  description: string;
  libraries: ILibraryDefinition[];
}

export interface ISecurityGroupSeedRules {
  includeCurrentUser?: boolean;
  includeSiteCollectionAdmins?: boolean;
  includeAssociatedGroupMembers?: 'Members' | 'Visitors';
  includeEveryoneExceptExternal?: boolean;
}

export interface ISecurityGroup {
  title: string;
  description: string;
  allowMembersEditMembership: boolean;
  allowRequestToJoinLeave: boolean;
  autoAcceptRequestToJoinLeave: boolean;
  onlyAllowMembersViewMembership: boolean;
  permissionLevel: string;
  defaultMembers: string[];
  seedRules?: ISecurityGroupSeedRules;
  listPermissions: {
    default: string;
    overrides: Record<string, string>;
  };
}

export interface ISecurityGroupsSchema {
  schemaVersion: string;
  description: string;
  siteCollectionAdministrators: string[];
  groups: ISecurityGroup[];
  permissionLevels: Record<string, { roleTypeKind: number; description: string }>;
  breakInheritanceLists: string[];
  uniqueRoleAssignments: Record<string, string[]>;
}

export interface IProvisioningResult {
  listName: string;
  created: boolean;
  skipped: boolean;
  errors: string[];
}

export interface IProvisioningSummary {
  lists: IProvisioningResult[];
  libraries: IProvisioningResult[];
  groups: IProvisioningResult[];
  success: boolean;
}

export type OnboardingStepId =
  | 'validate'
  | 'groups'
  | 'lists'
  | 'libraries'
  | 'settings'
  | 'complete';

export interface IOnboardingStepResult {
  step: OnboardingStepId;
  label: string;
  success: boolean;
  message?: string;
  errors: string[];
}

export interface IOnboardingResult {
  required: boolean;
  success: boolean;
  steps: IOnboardingStepResult[];
  summary?: IProvisioningSummary;
}

export interface IOnboardingStatus {
  required: boolean;
  complete: boolean;
  groupsProvisioned: boolean;
  listsProvisioned: boolean;
  canRunOnboarding: boolean;
  message?: string;
}
