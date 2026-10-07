import { searchTools, getToolBySlug, getPopularTools, getToolsByCategory, TOOLS, CATEGORIES } from '@/lib/registry';

describe('registry', () => {
  it('returns all tools', () => {
    expect(TOOLS.length).toBeGreaterThan(0);
  });

  it('finds tool by slug', () => {
    const tool = getToolBySlug('json-formatter');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('JSON Formatter');
  });

  it('returns undefined for unknown slug', () => {
    expect(getToolBySlug('nonexistent-tool')).toBeUndefined();
  });

  it('returns popular tools', () => {
    const popular = getPopularTools();
    expect(popular.length).toBeGreaterThan(0);
    popular.forEach((t) => expect(t.popular).toBe(true));
  });

  it('filters tools by category', () => {
    const json = getToolsByCategory('json');
    expect(json.length).toBeGreaterThan(0);
    json.forEach((t) => expect(t.category).toBe('json'));
  });

  it('searches tools by name', () => {
    const results = searchTools('json');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((t) =>
      expect(
        t.name.toLowerCase().includes('json') ||
          t.description.toLowerCase().includes('json') ||
          t.keywords.some((k) => k.includes('json'))
      ).toBe(true)
    );
  });

  it('returns all tools for empty query', () => {
    expect(searchTools('').length).toBe(TOOLS.length);
  });

  it('all tools have required fields', () => {
    TOOLS.forEach((tool) => {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.icon).toBeTruthy();
      expect(Array.isArray(tool.keywords)).toBe(true);
    });
  });

  it('all categories are valid', () => {
    const validCategories = CATEGORIES.map((c) => c.id);
    TOOLS.forEach((tool) => {
      expect(validCategories).toContain(tool.category);
    });
  });
});
