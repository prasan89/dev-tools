'use client';

// ---------------------------------------------------------------------------
// Analytics abstraction
//
// Routes events to GA4 via window.gtag when NEXT_PUBLIC_GA_MEASUREMENT_ID
// is set. All call-sites go through this module exclusively — never call
// window.gtag directly.
//
// PRIVACY CONTRACT:
//   - Only tool metadata is sent (slug, name, category). Never tool content.
//   - Search events send result_count and selected_slug. Never the raw query.
//   - No passwords, JWT payloads, SQL, JSON content, or user data.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEventName =
  | 'page_view'
  | 'tool_opened'
  | 'tool_used'
  | 'tool_executed'
  | 'tool_copied'
  | 'tool_downloaded'
  | 'tool_error'
  | 'search_performed'
  | 'search'
  | 'related_tool_clicked';

export type AnalyticsEventProperties = Record<string, string | number | boolean | undefined>;

export interface AnalyticsProvider {
  trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProperties): void;
}

const noopProvider: AnalyticsProvider = {
  trackEvent() {},
};

const devProvider: AnalyticsProvider = {
  trackEvent(name, props) {
    if (typeof window !== 'undefined') {
      console.debug('[analytics]', name, props ?? {});
    }
  },
};

const ga4Provider: AnalyticsProvider = {
  trackEvent(name, props) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', name, props ?? {});
  },
};

function resolveProvider(): AnalyticsProvider {
  if (process.env.NODE_ENV === 'development') return devProvider;
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return ga4Provider;
  return noopProvider;
}

const provider: AnalyticsProvider = resolveProvider();

export function trackEvent(
  name: AnalyticsEventName,
  props?: AnalyticsEventProperties
): void {
  try {
    provider.trackEvent(name, props);
  } catch {
    // Analytics must never break the application
  }
}
