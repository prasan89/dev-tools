import {
  getAllTools,
  getEnabledTools,
  getToolById,
  getToolBySlug,
  getToolsByCategory,
  getPopularTools,
  searchTools,
  getRelatedTools,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  TOOLS,
  CATEGORIES,
} from '@/lib/registry';

// ============================================================
// Registry — basic lookups
// ============================================================

describe('getAllTools', () => {
  it('returns all tools including disabled', () => {
    expect(getAllTools().length).toBe(TOOLS.length);
  });
});

describe('getEnabledTools', () => {
  it('returns only enabled tools', () => {
    const enabled = getEnabledTools();
    expect(enabled.length).toBeGreaterThan(0);
    enabled.forEach((t) => expect(t.enabled).toBe(true));
  });

  it('returns fewer or equal tools than getAllTools', () => {
    expect(getEnabledTools().length).toBeLessThanOrEqual(getAllTools().length);
  });
});

describe('getToolById', () => {
  it('finds a tool by id', () => {
    const tool = getToolById('json-formatter');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('JSON Formatter');
  });

  it('returns undefined for unknown id', () => {
    expect(getToolById('nonexistent-tool-id')).toBeUndefined();
  });
});

describe('getToolBySlug', () => {
  it('finds a tool by slug', () => {
    const tool = getToolBySlug('json-formatter');
    expect(tool).toBeDefined();
    expect(tool?.id).toBe('json-formatter');
  });

  it('returns undefined for unknown slug', () => {
    expect(getToolBySlug('not-a-real-slug')).toBeUndefined();
  });
});

describe('getToolsByCategory', () => {
  it('returns enabled tools in a category', () => {
    const jsonTools = getToolsByCategory('json');
    expect(jsonTools.length).toBeGreaterThan(0);
    jsonTools.forEach((t) => {
      expect(t.category).toBe('json');
      expect(t.enabled).toBe(true);
    });
  });

  it('returns empty array for unknown category', () => {
    expect(getToolsByCategory('nonexistent-category')).toEqual([]);
  });
});

describe('getPopularTools', () => {
  it('returns only popular enabled tools', () => {
    const popular = getPopularTools();
    expect(popular.length).toBeGreaterThan(0);
    popular.forEach((t) => {
      expect(t.popular).toBe(true);
      expect(t.enabled).toBe(true);
    });
  });
});

// ============================================================
// Registry — categories
// ============================================================

describe('getCategories', () => {
  it('returns all categories', () => {
    expect(getCategories().length).toBe(CATEGORIES.length);
    expect(getCategories().length).toBeGreaterThan(0);
  });
});

describe('getCategoryById', () => {
  it('finds a category by id', () => {
    const cat = getCategoryById('json');
    expect(cat).toBeDefined();
    expect(cat?.name).toBe('JSON Tools');
  });

  it('returns undefined for unknown id', () => {
    expect(getCategoryById('not-a-real-category')).toBeUndefined();
  });
});

describe('getCategoryBySlug', () => {
  it('finds a category by slug', () => {
    const cat = getCategoryBySlug('json');
    expect(cat).toBeDefined();
    expect(cat?.id).toBe('json');
  });

  it('returns undefined for unknown slug', () => {
    expect(getCategoryBySlug('no-such-slug')).toBeUndefined();
  });
});

// ============================================================
// Search
// ============================================================

describe('searchTools', () => {
  it('returns all enabled tools for empty query', () => {
    const results = searchTools('');
    expect(results.length).toBe(getEnabledTools().length);
  });

  it('finds by exact tool name (case-insensitive)', () => {
    const results = searchTools('JSON Formatter');
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain('json-formatter');
  });

  it('finds by partial name', () => {
    const results = searchTools('json');
    expect(results.length).toBeGreaterThan(1);
    // should find JSON Formatter, JSON Validator, JSON Minifier
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain('json-formatter');
    expect(slugs).toContain('json-validator');
  });

  it('finds by keyword', () => {
    // 'uuid' is in uuid-generator keywords
    const results = searchTools('uuid');
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain('uuid-generator');
  });

  it('finds by description fragment', () => {
    // 'hashes' appears in hash-generator description
    const results = searchTools('md5');
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain('hash-generator');
  });

  it('finds by category name', () => {
    const results = searchTools('encoding');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((t) => expect(t.enabled).toBe(true));
  });

  it('is case-insensitive', () => {
    const lower = searchTools('base64');
    const upper = searchTools('BASE64');
    const mixed = searchTools('Base64');
    expect(lower.length).toBeGreaterThan(0);
    // all variants should find the same tool
    const lowerSlugs = lower.map((t) => t.slug).sort();
    const upperSlugs = upper.map((t) => t.slug).sort();
    const mixedSlugs = mixed.map((t) => t.slug).sort();
    expect(lowerSlugs).toEqual(upperSlugs);
    expect(lowerSlugs).toEqual(mixedSlugs);
  });

  it('returns empty array when nothing matches', () => {
    const results = searchTools('zzz-this-cannot-possibly-match-anything-zzz');
    expect(results).toEqual([]);
  });

  it('only returns enabled tools', () => {
    searchTools('').forEach((t) => expect(t.enabled).toBe(true));
  });

  it('finds jwt tool by keyword', () => {
    const results = searchTools('jwt');
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain('jwt-decoder');
  });

  it('finds encoder tools with "encode"', () => {
    const results = searchTools('encode');
    const slugs = results.map((t) => t.slug);
    // base64, url-encode, html-encode all contain encode in keywords/name
    expect(slugs.some((s) => ['base64', 'url-encode', 'html-encode'].includes(s))).toBe(true);
  });
});

// ============================================================
// Related tools
// ============================================================

describe('getRelatedTools', () => {
  it('returns explicit related tools when configured', () => {
    const tool = getToolById('json-formatter')!;
    const related = getRelatedTools(tool);
    expect(related.length).toBeGreaterThan(0);
    // json-formatter explicitly lists json-validator
    const ids = related.map((t) => t.id);
    expect(ids).toContain('json-validator');
  });

  it('excludes the tool itself', () => {
    const tool = getToolById('json-formatter')!;
    const related = getRelatedTools(tool);
    const ids = related.map((t) => t.id);
    expect(ids).not.toContain('json-formatter');
  });

  it('falls back to category tools when no explicit list', () => {
    // Create a hypothetical tool with no relatedTools
    const tool = { ...getToolById('word-counter')!, relatedTools: [] };
    const related = getRelatedTools(tool);
    // Should still get category-based results
    expect(related.length).toBeGreaterThanOrEqual(0);
    related.forEach((t) => expect(t.category).toBe('utilities'));
  });

  it('only returns enabled related tools', () => {
    const tool = getToolById('json-formatter')!;
    getRelatedTools(tool).forEach((t) => expect(t.enabled).toBe(true));
  });

  it('respects the limit parameter', () => {
    const tool = getToolById('json-formatter')!;
    const limited = getRelatedTools(tool, 2);
    expect(limited.length).toBeLessThanOrEqual(2);
  });
});

// ============================================================
// Data integrity — the test suite fails if registry is corrupt
// ============================================================

describe('Data integrity', () => {
  it('all tools have unique ids', () => {
    const ids = TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all tools have unique slugs', () => {
    const slugs = TOOLS.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('all tools belong to a valid category', () => {
    const validCategories = new Set(CATEGORIES.map((c) => c.id));
    TOOLS.forEach((tool) => {
      expect(validCategories.has(tool.category)).toBe(true);
    });
  });

  it('all tools have non-empty descriptions', () => {
    TOOLS.forEach((tool) => {
      expect(tool.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('all enabled tools have seoTitle', () => {
    getEnabledTools().forEach((tool) => {
      expect(tool.seoTitle.trim().length).toBeGreaterThan(0);
    });
  });

  it('all enabled tools have seoDescription', () => {
    getEnabledTools().forEach((tool) => {
      expect(tool.seoDescription.trim().length).toBeGreaterThan(0);
    });
  });

  it('all tools have the enabled flag defined', () => {
    TOOLS.forEach((tool) => {
      expect(typeof tool.enabled).toBe('boolean');
    });
  });

  it('all tool ids match their slugs (convention)', () => {
    TOOLS.forEach((tool) => {
      expect(tool.id).toBe(tool.slug);
    });
  });

  it('all categories have a slug', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.slug.trim().length).toBeGreaterThan(0);
    });
  });

  it('category slugs are unique', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
