import { ITelemetryEvent } from '../interfaces';
import { TELEMETRY_EVENTS, LOCAL_STORAGE_KEYS, APP_NAMESPACE } from '../constants';
import { readLocalStorage, writeLocalStorage } from '../utilities';

export class TelemetryClient {
  private _userId: string;
  private _sessionId: string;
  private _optIn: boolean;

  constructor(userId: string) {
    this._userId = userId;
    this._sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this._optIn = readLocalStorage<boolean>(LOCAL_STORAGE_KEYS.TelemetryOptIn, true);
  }

  public get isOptIn(): boolean {
    return this._optIn;
  }

  public setOptIn(optIn: boolean): void {
    this._optIn = optIn;
    writeLocalStorage(LOCAL_STORAGE_KEYS.TelemetryOptIn, optIn);
  }

  public trackEvent(event: ITelemetryEvent): void {
    if (!this._optIn) return;

    const payload = {
      namespace: APP_NAMESPACE,
      sessionId: this._sessionId,
      userId: this._userId,
      timestamp: new Date().toISOString(),
      name: event.name,
      properties: event.properties ?? {},
      measurements: event.measurements ?? {}
    };

    if (typeof window !== 'undefined' && (window as unknown as { appInsights?: { trackEvent: (data: unknown) => void } }).appInsights) {
      (window as unknown as { appInsights: { trackEvent: (data: unknown) => void } }).appInsights.trackEvent({
        name: event.name,
        properties: payload.properties as Record<string, string>
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Telemetry]', payload);
    }
  }

  public trackPageView(pageName: string, properties?: Record<string, string | number | boolean>): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.PageView,
      properties: { pageName, ...properties }
    });
  }

  public trackError(error: Error, context?: string): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.Error,
      properties: {
        message: error.message,
        context: context ?? 'unknown',
        stack: error.stack?.substring(0, 500) ?? ''
      }
    });
  }

  public trackListingCreated(listingId: number): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.ListingCreated,
      properties: { listingId: String(listingId) }
    });
  }

  public trackListingViewed(listingId: number): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.ListingViewed,
      properties: { listingId: String(listingId) }
    });
  }

  public trackSearch(query: string, resultCount: number): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.SearchPerformed,
      properties: { query, resultCount: String(resultCount) }
    });
  }

  public trackFavoriteAdded(listingId: number): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.FavoriteAdded,
      properties: { listingId: String(listingId) }
    });
  }

  public trackMessageSent(conversationId: string): void {
    this.trackEvent({
      name: TELEMETRY_EVENTS.MessageSent,
      properties: { conversationId }
    });
  }
}
