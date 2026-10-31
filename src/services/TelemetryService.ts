import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ITelemetryEvent } from '../interfaces';
import { LOCAL_STORAGE_KEYS, TELEMETRY_EVENTS } from '../constants';
import { readLocalStorage } from '../utilities';

interface ApplicationInsightsInstance {
  trackEvent: (event: {
    name: string;
    properties?: Record<string, string | number | boolean>;
    measurements?: Record<string, number>;
  }) => void;
  trackException: (exception: { exception: Error; properties?: Record<string, string> }) => void;
  trackPageView: (pageView: { name: string; uri?: string; properties?: Record<string, string> }) => void;
  flush: () => void;
}

declare global {
  interface Window {
    appInsights?: ApplicationInsightsInstance;
  }
}

export class TelemetryService {
  private _context: WebPartContext;
  private _enabled: boolean;
  private _buffer: ITelemetryEvent[] = [];

  constructor(context: WebPartContext) {
    this._context = context;
    this._enabled = readLocalStorage<boolean>(LOCAL_STORAGE_KEYS.TelemetryOptIn, true);
  }

  public setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  public isEnabled(): boolean {
    return this._enabled;
  }

  private getAppInsights(): ApplicationInsightsInstance | undefined {
    return window.appInsights;
  }

  public trackEvent(event: ITelemetryEvent): void {
    if (!this._enabled) return;

    const enriched: ITelemetryEvent = {
      ...event,
      properties: {
        ...event.properties,
        webUrl: this._context.pageContext.web.absoluteUrl,
        userId: this._context.pageContext.user.loginName,
        timestamp: new Date().toISOString()
      }
    };

    const ai = this.getAppInsights();
    if (ai) {
      ai.trackEvent({
        name: enriched.name,
        properties: enriched.properties as Record<string, string | number | boolean>,
        measurements: enriched.measurements
      });
    } else {
      this._buffer.push(enriched);
      if (this._buffer.length > 100) {
        this._buffer.shift();
      }
    }
  }

  public trackPageView(pageName: string, uri?: string): void {
    if (!this._enabled) return;

    const ai = this.getAppInsights();
    if (ai) {
      ai.trackPageView({
        name: pageName,
        uri: uri ?? window.location.href,
        properties: {
          webUrl: this._context.pageContext.web.absoluteUrl
        }
      });
    } else {
      this.trackEvent({ name: TELEMETRY_EVENTS.PageView, properties: { pageName, uri: uri ?? '' } });
    }
  }

  public trackError(error: Error, context?: Record<string, string>): void {
    if (!this._enabled) return;

    const ai = this.getAppInsights();
    if (ai) {
      ai.trackException({
        exception: error,
        properties: context
      });
    } else {
      this.trackEvent({
        name: TELEMETRY_EVENTS.Error,
        properties: {
          message: error.message,
          stack: error.stack ?? '',
          ...context
        }
      });
    }
  }

  public flush(): void {
    const ai = this.getAppInsights();
    if (ai) {
      this._buffer.forEach(event => {
        ai.trackEvent({
          name: event.name,
          properties: event.properties as Record<string, string | number | boolean>,
          measurements: event.measurements
        });
      });
      this._buffer = [];
      ai.flush();
    }
  }

  public getBufferedEvents(): ITelemetryEvent[] {
    return [...this._buffer];
  }
}
