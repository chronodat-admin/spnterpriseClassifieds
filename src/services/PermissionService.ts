import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/site-groups/web';
import '@pnp/sp/site-users/web';
import { initializePnP } from './SharePointContextFactory';
import { IPermissionCheck, IAppContext } from '../interfaces';
import { PermissionChecker } from '../permissions/PermissionChecker';
import { ROLES } from '../constants';

function createAppContextFromWebPart(context: WebPartContext): IAppContext {
  return {
    webUrl: context.pageContext.web.absoluteUrl,
    siteUrl: context.pageContext.site.absoluteUrl,
    userId: context.pageContext.user.loginName,
    userDisplayName: context.pageContext.user.displayName,
    userEmail: context.pageContext.user.email,
    isAdmin: false,
    isModerator: false,
    isApprover: false,
    locale: context.pageContext.cultureInfo.currentUICultureName.toLowerCase(),
    isRtl: false,
    isTeams: !!context.sdks.microsoftTeams,
    isDarkTheme: false
  };
}

export class PermissionService {
  private _context: WebPartContext;
  private _groupCache: Map<string, boolean> = new Map();
  public readonly checker: PermissionChecker;

  constructor(context: WebPartContext) {
    this._context = context;
    this.checker = new PermissionChecker(createAppContextFromWebPart(context));
  }

  private async isInGroup(groupName: string): Promise<boolean> {
    if (this._groupCache.has(groupName)) {
      return this._groupCache.get(groupName) ?? false;
    }

    const { sp } = initializePnP(this._context);
    const groups = await sp.web.currentUser.groups();
    const isMember = groups.some((group: { Title: string }) => group.Title === groupName);
    this._groupCache.set(groupName, isMember);
    return isMember;
  }

  public async isOwner(): Promise<boolean> {
    return this.isInGroup(ROLES.Owner);
  }

  public async isModerator(): Promise<boolean> {
    return (await this.isInGroup(ROLES.Moderator)) || (await this.isOwner());
  }

  public async isApprover(): Promise<boolean> {
    return (await this.isInGroup(ROLES.Approver)) || (await this.isOwner());
  }

  public async isContributor(): Promise<boolean> {
    return (
      (await this.isInGroup(ROLES.Contributor)) ||
      (await this.isModerator()) ||
      (await this.isApprover())
    );
  }

  public async isAdmin(): Promise<boolean> {
    return (await this.isOwner()) || (await this.isModerator());
  }

  public async canCreateListing(): Promise<boolean> {
    return (await this.isContributor()) || (await this.isInGroup(ROLES.Visitor));
  }

  public async canEditListing(sellerId: string): Promise<boolean> {
    const currentUser = this._context.pageContext.user.loginName;
    if (sellerId === currentUser) return true;
    return (await this.isModerator()) || (await this.isOwner());
  }

  public async canDeleteListing(sellerId: string): Promise<boolean> {
    return this.canEditListing(sellerId);
  }

  public async canApprove(): Promise<boolean> {
    return (await this.isApprover()) || (await this.isOwner());
  }

  public async canViewReports(): Promise<boolean> {
    return (await this.isModerator()) || (await this.isOwner());
  }

  public async getPermissions(sellerId?: string): Promise<IPermissionCheck> {
    const [canAdmin, canModerate, canApprove, canCreate, canViewReports] = await Promise.all([
      this.isAdmin(),
      this.isModerator(),
      this.canApprove(),
      this.canCreateListing(),
      this.canViewReports()
    ]);

    const canEdit = sellerId ? await this.canEditListing(sellerId) : canModerate;
    const canDelete = sellerId ? await this.canDeleteListing(sellerId) : canModerate;

    return {
      canCreate,
      canEdit,
      canDelete,
      canApprove,
      canModerate,
      canAdmin,
      canViewReports
    };
  }

  public clearCache(): void {
    this._groupCache.clear();
  }
}
