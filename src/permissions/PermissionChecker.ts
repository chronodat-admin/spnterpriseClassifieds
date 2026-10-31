import { IAppContext, IListing, IPermissionCheck } from '../interfaces';
import { ROLES, LISTING_STATUS } from '../constants';

export class PermissionChecker {
  private _context: IAppContext;
  private _userRoles: Set<string>;

  constructor(context: IAppContext, userRoles: string[] = []) {
    this._context = context;
    this._userRoles = new Set(userRoles);
  }

  public updateContext(partial: Partial<IAppContext>): void {
    this._context = { ...this._context, ...partial };
  }

  public setUserRoles(roles: string[]): void {
    this._userRoles = new Set(roles);
  }

  public hasRole(role: string): boolean {
    if (this._context.isAdmin && role === ROLES.Owner) return true;
    if (this._context.isModerator && role === ROLES.Moderator) return true;
    if (this._context.isApprover && role === ROLES.Approver) return true;
    return this._userRoles.has(role);
  }

  public isOwner(listing?: IListing): boolean {
    if (!listing) return false;
    return listing.sellerId === this._context.userId;
  }

  public canCreate(): boolean {
    return this.hasRole(ROLES.Contributor) ||
      this.hasRole(ROLES.Approver) ||
      this.hasRole(ROLES.Moderator) ||
      this.hasRole(ROLES.Owner) ||
      this._context.isAdmin;
  }

  public canEdit(listing?: IListing): boolean {
    if (this._context.isAdmin || this.hasRole(ROLES.Moderator)) return true;
    if (listing) return this.isOwner(listing);
    return this.hasRole(ROLES.Contributor);
  }

  public canDelete(listing?: IListing): boolean {
    if (this._context.isAdmin || this.hasRole(ROLES.Moderator)) return true;
    if (listing) return this.isOwner(listing);
    return false;
  }

  public canApprove(): boolean {
    return this._context.isAdmin ||
      this._context.isApprover ||
      this.hasRole(ROLES.Approver) ||
      this.hasRole(ROLES.Owner);
  }

  public canModerate(): boolean {
    return this._context.isAdmin ||
      this._context.isModerator ||
      this.hasRole(ROLES.Moderator) ||
      this.hasRole(ROLES.Owner);
  }

  public canAdmin(): boolean {
    return this._context.isAdmin || this.hasRole(ROLES.Owner);
  }

  public canViewReports(): boolean {
    return this.canModerate() || this.canAdmin();
  }

  public canPublish(listing?: IListing): boolean {
    if (this.canApprove()) return true;
    if (listing && this.isOwner(listing)) {
      return listing.status === LISTING_STATUS.Draft || listing.status === LISTING_STATUS.Pending;
    }
    return false;
  }

  public canReserve(listing?: IListing): boolean {
    if (!listing) return false;
    if (listing.status !== LISTING_STATUS.Approved) return false;
    return !this.isOwner(listing);
  }

  public canMarkSold(listing?: IListing): boolean {
    if (!listing) return false;
    return this.isOwner(listing) || this.canModerate();
  }

  public check(listing?: IListing): IPermissionCheck {
    return {
      canCreate: this.canCreate(),
      canEdit: this.canEdit(listing),
      canDelete: this.canDelete(listing),
      canApprove: this.canApprove(),
      canModerate: this.canModerate(),
      canAdmin: this.canAdmin(),
      canViewReports: this.canViewReports()
    };
  }
}
