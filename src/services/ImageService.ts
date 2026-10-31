import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { initializePnP } from './SharePointContextFactory';
import { LIBRARY_NAMES, IMAGE_MAX_SIZE_MB, MAX_IMAGES_PER_LISTING } from '../constants';
import { buildSharePointImageUrl, retryAsync } from '../utilities';

export class ImageService {
  private _context: WebPartContext;

  constructor(context: WebPartContext) {
    this._context = context;
  }

  private validateFile(file: File): void {
    const maxBytes = IMAGE_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`Image exceeds maximum size of ${IMAGE_MAX_SIZE_MB}MB`);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image type. Allowed: JPEG, PNG, GIF, WebP');
    }
  }

  private async ensureFolder(listingId: number): Promise<string> {
    const { sp } = initializePnP(this._context);
    const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
    const libraryPath = `${webRelativeUrl}/${LIBRARY_NAMES.ListingImages}`;
    const folderPath = `${libraryPath}/${listingId}`;

    try {
      await sp.web.getFolderByServerRelativePath(folderPath)();
    } catch {
      await sp.web.getFolderByServerRelativePath(libraryPath).folders.addUsingPath(String(listingId));
    }

    return folderPath;
  }

  public async upload(listingId: number, file: File, sortOrder = 0): Promise<string> {
    this.validateFile(file);

    const existing = await this.getImages(listingId);
    if (existing.length >= MAX_IMAGES_PER_LISTING) {
      throw new Error(`Maximum of ${MAX_IMAGES_PER_LISTING} images per listing`);
    }

    return retryAsync(async () => {
      const { sp } = initializePnP(this._context);
      const folderPath = await this.ensureFolder(listingId);
      const fileName = `${sortOrder}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addUsingPath(fileName, file, { Overwrite: true });

      return buildSharePointImageUrl(
        this._context.pageContext.web.absoluteUrl,
        result.ServerRelativeUrl
      );
    });
  }

  public async uploadMultiple(listingId: number, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await this.upload(listingId, files[i], i);
      urls.push(url);
    }
    return urls;
  }

  public async getImages(listingId: number): Promise<string[]> {
    const { sp } = initializePnP(this._context);
    const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
    const folderPath = `${webRelativeUrl}/${LIBRARY_NAMES.ListingImages}/${listingId}`;

    try {
      const folder = await sp.web.getFolderByServerRelativePath(folderPath).expand('Files')();
      const files = (folder as { Files?: Array<{ Name: string; ServerRelativeUrl: string }> }).Files ?? [];
      return files
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map(f => buildSharePointImageUrl(this._context.pageContext.web.absoluteUrl, f.ServerRelativeUrl));
    } catch {
      return [];
    }
  }

  public async delete(listingId: number, fileName: string): Promise<void> {
    const { sp } = initializePnP(this._context);
    const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
    const filePath = `${webRelativeUrl}/${LIBRARY_NAMES.ListingImages}/${listingId}/${fileName}`;
    await sp.web.getFileByServerRelativePath(filePath).delete();
  }

  public async uploadAttachment(
    listingId: number,
    sellerId: string,
    file: File
  ): Promise<{ id: string; name: string; url: string }> {
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('Attachment exceeds maximum size of 15MB');
    }

    return retryAsync(async () => {
      const { sp } = initializePnP(this._context);
      const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl.replace(/\/$/, '');
      const libraryPath = `${webRelativeUrl}/${LIBRARY_NAMES.SellerAttachments}`;
      const folderPath = `${libraryPath}/${listingId}`;

      try {
        await sp.web.getFolderByServerRelativePath(folderPath)();
      } catch {
        await sp.web.getFolderByServerRelativePath(libraryPath).folders.addUsingPath(String(listingId));
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addUsingPath(fileName, file, { Overwrite: true });

      const item = await sp.web.getFileByServerRelativePath(result.ServerRelativeUrl).getItem();
      await item.update({
        EC365_ListingId: listingId,
        EC365_SellerId: sellerId,
        EC365_AttachmentType: 'Other'
      });

      return {
        id: fileName,
        name: file.name,
        url: buildSharePointImageUrl(this._context.pageContext.web.absoluteUrl, result.ServerRelativeUrl)
      };
    });
  }

  public async getAttachments(listingId: number): Promise<Array<{ id: string; name: string; url: string }>> {
    const { sp } = initializePnP(this._context);
    const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl.replace(/\/$/, '');
    const folderPath = `${webRelativeUrl}/${LIBRARY_NAMES.SellerAttachments}/${listingId}`;

    try {
      const folder = await sp.web.getFolderByServerRelativePath(folderPath).expand('Files')();
      const files = (folder as { Files?: Array<{ Name: string; ServerRelativeUrl: string }> }).Files ?? [];
      return files.map(file => ({
        id: file.Name,
        name: file.Name.replace(/^\d+-/, ''),
        url: buildSharePointImageUrl(this._context.pageContext.web.absoluteUrl, file.ServerRelativeUrl)
      }));
    } catch {
      return [];
    }
  }

  public async deleteAll(listingId: number): Promise<void> {
    const images = await this.getImages(listingId);
    const webRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
    const basePath = `${webRelativeUrl}/${LIBRARY_NAMES.ListingImages}/${listingId}/`;

    await Promise.all(
      images.map(url => {
        const fileName = url.split('/').pop() ?? '';
        if (fileName) {
          const { sp } = initializePnP(this._context);
          return sp.web.getFileByServerRelativePath(`${basePath}${fileName}`).delete();
        }
        return Promise.resolve();
      })
    );
  }
}
