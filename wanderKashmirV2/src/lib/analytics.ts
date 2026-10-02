/**
 * Lightweight, safe analytics event tracker for WanderKashmir.
 * Integrates safely with existing window.gtag or window.dataLayer if present.
 * Does not expose PII (names, emails, phone numbers).
 */

export interface AnalyticsEventPayload {
  triggerType?: "time" | "scroll" | "exit_intent" | "cta";
  sourceType?: string;
  sourcePage?: string;
  tourSlug?: string;
  travelStyle?: string;
  destination?: string;
  propertyId?: string;
  experienceId?: string;
  referenceId?: string;
  [key: string]: any;
}

export function trackEvent(eventName: string, payload?: AnalyticsEventPayload) {
  if (typeof window === "undefined") return;

  try {
    const win = window as any;
    if (typeof win.gtag === "function") {
      win.gtag("event", eventName, payload);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event: eventName, ...payload });
    }
  } catch {
    // Silently handle tracking failures in non-browser or ad-blocked environments
  }
}
