import { buildMetadata } from '@/lib/metadata';

describe('buildMetadata', () => {
  it('returns default title when no title given', () => {
    const meta = buildMetadata({});
    expect(typeof meta.title).toBe('string');
    expect((meta.title as string)).toContain('DevToolsHub');
  });

  it('returns custom title with site suffix', () => {
    const meta = buildMetadata({ title: 'JSON Formatter' });
    expect((meta.title as string)).toContain('JSON Formatter');
    expect((meta.title as string)).toContain('DevToolsHub');
  });

  it('includes description', () => {
    const meta = buildMetadata({ description: 'Test description' });
    expect(meta.description).toBe('Test description');
  });

  it('sets canonical URL', () => {
    const meta = buildMetadata({ path: '/tools/json-formatter' });
    expect(meta.alternates?.canonical).toContain('/tools/json-formatter');
  });

  it('has openGraph data', () => {
    const meta = buildMetadata({ title: 'Test Tool' });
    expect(meta.openGraph).toBeDefined();
    const og = meta.openGraph as { title?: string };
    expect(og.title).toContain('Test Tool');
  });

  it('has twitter card data', () => {
    const meta = buildMetadata({});
    expect(meta.twitter).toBeDefined();
    const tw = meta.twitter as { card?: string };
    expect(tw.card).toBe('summary_large_image');
  });
});
