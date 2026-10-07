import { buildMetadata } from '@/lib/metadata';

describe('buildMetadata', () => {
  it('returns a default title containing site name when no title given', () => {
    const meta = buildMetadata({});
    expect(typeof meta.title).toBe('string');
    expect((meta.title as string)).toContain('DevToolsHub');
  });

  it('includes a custom title in the returned title string', () => {
    const meta = buildMetadata({ title: 'JSON Formatter' });
    expect((meta.title as string)).toContain('JSON Formatter');
    expect((meta.title as string)).toContain('DevToolsHub');
  });

  it('uses provided description', () => {
    const meta = buildMetadata({ description: 'Custom description text' });
    expect(meta.description).toBe('Custom description text');
  });

  it('falls back to a default description when none provided', () => {
    const meta = buildMetadata({});
    expect(typeof meta.description).toBe('string');
    expect((meta.description as string).length).toBeGreaterThan(0);
  });

  it('sets canonical URL from path', () => {
    const meta = buildMetadata({ path: '/tools/json-formatter' });
    const canonical = meta.alternates?.canonical as string;
    expect(canonical).toContain('/tools/json-formatter');
  });

  it('includes openGraph with correct title', () => {
    const meta = buildMetadata({ title: 'Test Tool' });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(String(og.title)).toContain('Test Tool');
  });

  it('includes twitter card summary_large_image', () => {
    const meta = buildMetadata({});
    const tw = meta.twitter as Record<string, unknown>;
    expect(tw).toBeDefined();
    expect(tw.card).toBe('summary_large_image');
  });

  it('sets robots to index + follow by default', () => {
    const meta = buildMetadata({});
    const robots = meta.robots as Record<string, boolean>;
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });
});
