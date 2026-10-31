import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IUserProfile } from '../interfaces';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { ListingRepository } from '../repositories/ListingRepository';
import { buildSharePointImageUrl } from '../utilities';

interface GraphUser {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string;
  department?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

interface GraphManager {
  displayName?: string;
}

interface GraphPresence {
  availability?: string;
  activity?: string;
}

export class GraphService {
  private _context: WebPartContext;
  private _reviewRepo: ReviewRepository;
  private _listingRepo: ListingRepository;

  constructor(context: WebPartContext) {
    this._context = context;
    this._reviewRepo = new ReviewRepository(context);
    this._listingRepo = new ListingRepository(context);
  }

  private async getClient(): Promise<{
    api: (path: string) => {
      select: (fields: string) => { get: () => Promise<unknown> };
      filter: (expression: string) => { top: (count: number) => { get: () => Promise<{ value: GraphUser[] }> } };
      get: () => Promise<unknown>;
      version: (v: string) => { get: () => Promise<unknown> };
    };
  }> {
    return this._context.msGraphClientFactory.getClient('3') as Promise<{
      api: (path: string) => {
        select: (fields: string) => { get: () => Promise<unknown> };
        filter: (expression: string) => { top: (count: number) => { get: () => Promise<{ value: GraphUser[] }> } };
        get: () => Promise<unknown>;
        version: (v: string) => { get: () => Promise<unknown> };
      };
    }>;
  }

  public async getProfile(userId?: string): Promise<IUserProfile> {
    const client = await this.getClient();
    const endpoint = userId ? `/users/${encodeURIComponent(userId)}` : '/me';
    const user = (await client
      .api(endpoint)
      .select('id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone,officeLocation')
      .get()) as GraphUser;

    const profile: IUserProfile = {
      id: user.id,
      displayName: user.displayName,
      email: user.mail ?? user.userPrincipalName ?? '',
      department: user.department,
      office: user.officeLocation,
      jobTitle: user.jobTitle,
      phone: user.mobilePhone
    };

    if (userId || user.id) {
      const targetId = userId ?? user.id;
      const [rating, listings, soldListings] = await Promise.all([
        this._reviewRepo.getAverageRating(targetId),
        this._listingRepo.getBySeller(targetId),
        this._listingRepo.getBySeller(targetId, 'Sold')
      ]);

      profile.rating = rating;
      profile.reviewCount = (await this._reviewRepo.getBySeller(targetId)).length;
      profile.listingCount = listings.length;
      profile.soldCount = soldListings.length;
    }

    return profile;
  }

  public async getPhoto(userId?: string): Promise<string | undefined> {
    try {
      const client = await this.getClient();
      const endpoint = userId
        ? `/users/${encodeURIComponent(userId)}/photo/$value`
        : '/me/photo/$value';
      const blob = (await client.api(endpoint).get()) as Blob;
      if (blob && typeof blob === 'object') {
        return URL.createObjectURL(blob);
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  public async getManager(userId?: string): Promise<string | undefined> {
    try {
      const client = await this.getClient();
      const endpoint = userId
        ? `/users/${encodeURIComponent(userId)}/manager`
        : '/me/manager';
      const manager = (await client.api(endpoint).select('displayName').get()) as GraphManager;
      return manager.displayName;
    } catch {
      return undefined;
    }
  }

  public async getDepartment(userId?: string): Promise<string | undefined> {
    const profile = await this.getProfile(userId);
    return profile.department;
  }

  public async getPresence(userId: string): Promise<{ availability: string; activity: string }> {
    try {
      const client = await this.getClient();
      const presence = (await client
        .api(`/users/${encodeURIComponent(userId)}/presence`)
        .get()) as GraphPresence;
      return {
        availability: presence.availability ?? 'Unknown',
        activity: presence.activity ?? 'Unknown'
      };
    } catch {
      return { availability: 'Unknown', activity: 'Unknown' };
    }
  }

  public async searchUsers(query: string, limit = 10): Promise<IUserProfile[]> {
    if (!query.trim()) return [];

    const client = await this.getClient();
    const escapedQuery = query.replace(/'/g, "''");
    const response = (await (client
      .api('/users')
      .filter(
        `startswith(displayName,'${escapedQuery}') or startswith(mail,'${escapedQuery}') or startswith(userPrincipalName,'${escapedQuery}')`
      ) as unknown as { top: (count: number) => { select: (fields: string) => { get: () => Promise<{ value: GraphUser[] }> } } })
      .top(limit)
      .select('id,displayName,mail,userPrincipalName,department,jobTitle,officeLocation')
      .get()) as { value: GraphUser[] };

    const users = response.value ?? [];

    return users.map(user => ({
      id: user.id,
      displayName: user.displayName,
      email: user.mail ?? user.userPrincipalName ?? '',
      department: user.department,
      office: user.officeLocation,
      jobTitle: user.jobTitle
    }));
  }

  public buildPhotoUrl(serverRelativeUrl: string): string {
    return buildSharePointImageUrl(this._context.pageContext.web.absoluteUrl, serverRelativeUrl);
  }
}
