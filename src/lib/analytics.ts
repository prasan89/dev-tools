// ---------------------------------------------------------------------------
// Analytics abstraction
//
// The application tracks events through this module exclusively.
// Swap in GA4/Mixpanel/Plausible by replacing the `provider` assignment below
// without touching any call-site.
// ---------------------------------------------------------------------------

export type AnalyticsEventName =
  | 'page_view'
  | 'tool_opened'
  | 'tool_executed'
  | 'tool_copied'
  | 'tool_downloaded'
  | 'tool_error'
  | 'search'
  | 'related_tool_clicked';

export type AnalyticsEventProperties = Record<string, string | number | boolean | undefined>;

export interface AnalyticsProvider {
  trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProperties): void;
}

// No-op provider used in development and until a real provider is configured.
const noopProvider: AnalyticsProvider = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackEvent(_name, _props) {
    // intentionally empty
  },
};

// Development provider logs to console so engineers can verify tracking calls.
const devProvider: AnalyticsProvider = {
  trackEvent(name, props) {
    if (typeof window !== 'undefined') {
      console.debug('[analytics]', name, props ?? {});
    }
  },
};

const provider: AnalyticsProvider =
  process.env.NODE_ENV === 'development' ? devProvider : noopProvider;

export function trackEvent(
  name: AnalyticsEventName,
  props?: AnalyticsEventProperties
): void {
  provider.trackEvent(name, props);
}
