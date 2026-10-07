import { trackEvent, AnalyticsEventName } from '@/lib/analytics';

describe('analytics abstraction', () => {
  it('exports trackEvent function', () => {
    expect(typeof trackEvent).toBe('function');
  });

  it('does not throw for any valid event name', () => {
    const events: AnalyticsEventName[] = [
      'page_view',
      'tool_opened',
      'tool_executed',
      'tool_copied',
      'tool_downloaded',
      'tool_error',
      'search',
      'related_tool_clicked',
    ];
    events.forEach((name) => {
      expect(() => trackEvent(name)).not.toThrow();
      expect(() => trackEvent(name, { tool: 'test', count: 1 })).not.toThrow();
    });
  });

  it('accepts optional properties object', () => {
    expect(() =>
      trackEvent('tool_executed', { tool: 'json-formatter', input_length: 42 })
    ).not.toThrow();
  });

  it('accepts undefined properties', () => {
    expect(() => trackEvent('page_view', undefined)).not.toThrow();
  });
});
