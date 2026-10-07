/**
 * M14 tests — Dataset Library (registry, data content, SEO, data quality)
 *
 * Covers:
 *   Dataset registry functions: getDatasets, getDatasetBySlug, getDatasetsByCategory,
 *   getPopularDatasets, searchDatasets, getCategories
 *
 *   Dataset data: world-countries, mock-users, http-status-codes, science-elements,
 *   programming-languages-list, json-edge-cases
 *
 *   SEO quality: unique titles/descriptions, valid slugs
 *
 *   Data quality: no secrets, valid JSON
 */

import {
  getDatasets,
  getDatasetBySlug,
  getDatasetsByCategory,
  getPopularDatasets,
  searchDatasets,
  getCategories,
} from '@/lib/datasets';

// ---------------------------------------------------------------------------
// 1. Dataset registry tests
// ---------------------------------------------------------------------------

describe('getDatasets()', () => {
  it('returns an array', () => {
    expect(Array.isArray(getDatasets())).toBe(true);
  });

  it('returns 100+ items', () => {
    expect(getDatasets().length).toBeGreaterThanOrEqual(100);
  });

  it('each dataset has required field: id', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.id).toBe('string');
      expect(d.id.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: slug', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.slug).toBe('string');
      expect(d.slug.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: name', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.name).toBe('string');
      expect(d.name.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: description', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.description).toBe('string');
      expect(d.description.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: category', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.category).toBe('string');
      expect(d.category.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: tags (non-empty array)', () => {
    getDatasets().forEach((d) => {
      expect(Array.isArray(d.tags)).toBe(true);
      expect(d.tags.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: fields (non-empty array)', () => {
    getDatasets().forEach((d) => {
      expect(Array.isArray(d.fields)).toBe(true);
      expect(d.fields.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: license', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.license).toBe('string');
      expect(d.license.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: source', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.source).toBe('string');
      expect(d.source.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: seoTitle', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.seoTitle).toBe('string');
      expect(d.seoTitle.length).toBeGreaterThan(0);
    });
  });

  it('each dataset has required field: seoDescription', () => {
    getDatasets().forEach((d) => {
      expect(typeof d.seoDescription).toBe('string');
      expect(d.seoDescription.length).toBeGreaterThan(0);
    });
  });

  it('no duplicate slugs', () => {
    const slugs = getDatasets().map((d) => d.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('all dataset IDs are kebab-case', () => {
    getDatasets().forEach((d) => {
      expect(d.id).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('getDatasetMetadata does not include data arrays', () => {
    const datasets = getDatasets();
    datasets.forEach((d) => {
      expect((d as unknown as Record<string, unknown>).data).toBeUndefined();
    });
  });
});

describe('getDatasetBySlug()', () => {
  it("getDatasetBySlug('world-countries') returns a dataset", () => {
    const ds = getDatasetBySlug('world-countries');
    expect(ds).toBeDefined();
  });

  it("getDatasetBySlug('world-countries') returns dataset with slug 'world-countries'", () => {
    const ds = getDatasetBySlug('world-countries');
    expect(ds?.slug).toBe('world-countries');
  });

  it("getDatasetBySlug('world-countries') returns dataset with data array", () => {
    const ds = getDatasetBySlug('world-countries');
    expect(Array.isArray(ds?.data)).toBe(true);
    expect((ds?.data.length ?? 0)).toBeGreaterThan(0);
  });

  it("getDatasetBySlug('world-countries') returns dataset with name 'World Countries'", () => {
    const ds = getDatasetBySlug('world-countries');
    expect(ds?.name).toBe('World Countries');
  });

  it("getDatasetBySlug('nonexistent-dataset') returns undefined", () => {
    expect(getDatasetBySlug('nonexistent-dataset')).toBeUndefined();
  });

  it('returns full dataset with all metadata fields intact', () => {
    const ds = getDatasetBySlug('world-countries');
    expect(ds?.category).toBe('geographic');
    expect(ds?.license).toBeTruthy();
    expect(ds?.seoTitle).toBeTruthy();
  });
});

describe('getDatasetsByCategory()', () => {
  it("getDatasetsByCategory('geographic') returns an array", () => {
    expect(Array.isArray(getDatasetsByCategory('geographic'))).toBe(true);
  });

  it("getDatasetsByCategory('geographic') returns only geographic datasets", () => {
    const datasets = getDatasetsByCategory('geographic');
    datasets.forEach((d) => {
      expect(d.category).toBe('geographic');
    });
  });

  it("getDatasetsByCategory('geographic') returns multiple datasets", () => {
    const datasets = getDatasetsByCategory('geographic');
    expect(datasets.length).toBeGreaterThan(5);
  });

  it("getDatasetsByCategory('reference') returns only reference datasets", () => {
    const datasets = getDatasetsByCategory('reference');
    datasets.forEach((d) => {
      expect(d.category).toBe('reference');
    });
  });

  it("getDatasetsByCategory('testing') returns only testing datasets", () => {
    const datasets = getDatasetsByCategory('testing');
    datasets.forEach((d) => {
      expect(d.category).toBe('testing');
    });
  });

  it("getDatasetsByCategory('science') returns only science datasets", () => {
    const datasets = getDatasetsByCategory('science');
    datasets.forEach((d) => {
      expect(d.category).toBe('science');
    });
  });

  it("getDatasetsByCategory('api-mocks') returns datasets without data arrays", () => {
    const datasets = getDatasetsByCategory('api-mocks');
    expect(datasets.length).toBeGreaterThan(0);
    datasets.forEach((d) => {
      expect((d as unknown as Record<string, unknown>).data).toBeUndefined();
    });
  });
});

describe('getPopularDatasets()', () => {
  it('returns an array', () => {
    expect(Array.isArray(getPopularDatasets())).toBe(true);
  });

  it('returns datasets with popular: true', () => {
    const popular = getPopularDatasets();
    popular.forEach((d) => {
      expect(d.popular).toBe(true);
    });
  });

  it('returns at least one dataset', () => {
    expect(getPopularDatasets().length).toBeGreaterThan(0);
  });

  it("respects the limit parameter", () => {
    const all = getPopularDatasets();
    const limited = getPopularDatasets(2);
    expect(limited.length).toBeLessThanOrEqual(2);
    if (all.length >= 2) {
      expect(limited.length).toBe(2);
    }
  });

  it("returns all popular datasets when no limit specified", () => {
    const all = getPopularDatasets();
    const limited = getPopularDatasets(1000);
    expect(all.length).toBe(limited.length);
  });
});

describe('searchDatasets()', () => {
  it("searchDatasets('countries') returns results", () => {
    const results = searchDatasets('countries');
    expect(results.length).toBeGreaterThan(0);
  });

  it("searchDatasets('countries') results contain relevant datasets", () => {
    const results = searchDatasets('countries');
    const slugs = results.map((d) => d.slug);
    expect(slugs.some((s) => s.includes('countr'))).toBe(true);
  });

  it("searchDatasets('http') returns http-related datasets", () => {
    const results = searchDatasets('http');
    expect(results.length).toBeGreaterThan(0);
  });

  it("searchDatasets with empty string returns all datasets", () => {
    const all = getDatasets();
    const results = searchDatasets('');
    expect(results.length).toBe(all.length);
  });

  it('returns DatasetMeta without data arrays', () => {
    const results = searchDatasets('countries');
    results.forEach((d) => {
      expect((d as unknown as Record<string, unknown>).data).toBeUndefined();
    });
  });
});

describe('getCategories()', () => {
  it('returns an array', () => {
    expect(Array.isArray(getCategories())).toBe(true);
  });

  it('returns all 13 categories', () => {
    expect(getCategories().length).toBe(13);
  });

  it('each category has id, name, description, icon', () => {
    getCategories().forEach((cat) => {
      expect(typeof cat.id).toBe('string');
      expect(typeof cat.name).toBe('string');
      expect(typeof cat.description).toBe('string');
      expect(typeof cat.icon).toBe('string');
    });
  });

  it("includes 'geographic' category", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toContain('geographic');
  });

  it("includes 'reference' category", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toContain('reference');
  });

  it("includes 'testing' category", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toContain('testing');
  });

  it("includes 'science' category", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toContain('science');
  });

  it("includes 'api-mocks' category", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toContain('api-mocks');
  });

  it("includes all expected categories", () => {
    const expected = [
      'geographic', 'reference', 'configuration', 'testing',
      'api-mocks', 'technology', 'ecommerce', 'finance',
      'social', 'education', 'entertainment', 'science', 'utilities',
    ];
    const ids = getCategories().map((c) => c.id);
    expected.forEach((cat) => {
      expect(ids).toContain(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Dataset data tests
// ---------------------------------------------------------------------------

describe('world-countries data', () => {
  const ds = getDatasetBySlug('world-countries');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has 150+ records', () => {
    expect(ds?.data.length ?? 0).toBeGreaterThanOrEqual(150);
  });

  it('first record has a name field', () => {
    const first = ds?.data[0] as Record<string, unknown>;
    expect(typeof first?.name).toBe('string');
  });

  it('records have country code field', () => {
    const first = ds?.data[0] as Record<string, unknown>;
    // The field is 'code' (iso2-like) in the actual data
    expect(first?.code ?? first?.iso2).toBeTruthy();
  });

  it('records have capital field', () => {
    const first = ds?.data[0] as Record<string, unknown>;
    expect(typeof first?.capital).toBe('string');
  });

  it('all records have a name property', () => {
    ds?.data.forEach((row) => {
      expect(typeof (row as Record<string, unknown>).name).toBe('string');
    });
  });
});

describe('mock-users data', () => {
  const ds = getDatasetBySlug('mock-users');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has 10+ records', () => {
    expect((ds?.data.length ?? 0)).toBeGreaterThanOrEqual(10);
  });

  it('each record has an id field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(r.id).toBeDefined();
    });
  });

  it('each record has a name field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.name).toBe('string');
    });
  });

  it('each record has an email field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.email).toBe('string');
    });
  });

  it('email fields use @example.com domain (safe fake data)', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect((r.email as string)).toContain('@example.com');
    });
  });
});

describe('http-status-codes data', () => {
  const ds = getDatasetBySlug('http-status-codes');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has records', () => {
    expect((ds?.data.length ?? 0)).toBeGreaterThan(0);
  });

  it('contains HTTP 200 OK', () => {
    const found = ds?.data.some((row) => {
      const r = row as Record<string, unknown>;
      return r.code === 200;
    });
    expect(found).toBe(true);
  });

  it('contains HTTP 404 Not Found', () => {
    const found = ds?.data.some((row) => {
      const r = row as Record<string, unknown>;
      return r.code === 404;
    });
    expect(found).toBe(true);
  });

  it('contains HTTP 500 Internal Server Error', () => {
    const found = ds?.data.some((row) => {
      const r = row as Record<string, unknown>;
      return r.code === 500;
    });
    expect(found).toBe(true);
  });

  it('each record has a code and reason/name field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.code).toBe('number');
      // The reference data uses 'reason', the datasets may expose as 'name' or 'reason'
      expect(r.reason ?? r.name).toBeTruthy();
    });
  });
});

describe('science-elements data (chemical elements with full scientific properties)', () => {
  const ds = getDatasetBySlug('science-elements');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has 118 records (all known chemical elements)', () => {
    expect(ds?.data.length).toBe(118);
  });

  it('first element is Hydrogen', () => {
    const first = ds?.data[0] as Record<string, unknown>;
    expect((first?.name as string).toLowerCase()).toContain('hydrogen');
  });

  it('contains element with atomic number 118 (Oganesson)', () => {
    const found = ds?.data.some(
      (row) => (row as Record<string, unknown>).atomicNumber === 118,
    );
    expect(found).toBe(true);
  });

  it('each record has a symbol', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.symbol).toBe('string');
      expect((r.symbol as string).length).toBeGreaterThan(0);
    });
  });

  it('each record has an atomicNumber', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.atomicNumber).toBe('number');
    });
  });
});

describe('programming-languages-list data', () => {
  const ds = getDatasetBySlug('programming-languages-list');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has records', () => {
    expect((ds?.data.length ?? 0)).toBeGreaterThan(0);
  });

  it('each record has a name field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.name).toBe('string');
    });
  });

  it('each record has a year field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      // Field is 'year' or 'first_appeared'
      const yr = r.year ?? r.first_appeared;
      expect(typeof yr).toBe('number');
    });
  });

  it('years are plausible (between 1940 and 2030)', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      const yr = (r.year ?? r.first_appeared) as number;
      expect(yr).toBeGreaterThan(1940);
      expect(yr).toBeLessThan(2030);
    });
  });

  it('includes well-known languages (C or Python or JavaScript)', () => {
    const names = ds?.data.map((row) => (row as Record<string, unknown>).name as string) ?? [];
    const hasWellKnown = names.some((n) =>
      ['C', 'Python', 'JavaScript', 'Java', 'Ruby'].includes(n),
    );
    expect(hasWellKnown).toBe(true);
  });
});

describe('json-edge-cases data', () => {
  const ds = getDatasetBySlug('json-edge-cases');

  it('dataset exists', () => {
    expect(ds).toBeDefined();
  });

  it('has records', () => {
    expect((ds?.data.length ?? 0)).toBeGreaterThan(0);
  });

  it('each record has a case field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(typeof r.case).toBe('string');
    });
  });

  it('each record has a data field', () => {
    ds?.data.forEach((row) => {
      const r = row as Record<string, unknown>;
      expect(r.data).toBeDefined();
    });
  });

  it('dataset can be serialized to JSON', () => {
    expect(() => JSON.stringify(ds?.data)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. SEO tests
// ---------------------------------------------------------------------------

describe('SEO quality', () => {
  let datasets: ReturnType<typeof getDatasets>;

  beforeAll(() => {
    datasets = getDatasets();
  });

  it('all seoTitles are non-empty strings', () => {
    datasets.forEach((d) => {
      expect(typeof d.seoTitle).toBe('string');
      expect(d.seoTitle.trim().length).toBeGreaterThan(0);
    });
  });

  it('all seoDescriptions are non-empty strings', () => {
    datasets.forEach((d) => {
      expect(typeof d.seoDescription).toBe('string');
      expect(d.seoDescription.trim().length).toBeGreaterThan(0);
    });
  });

  it('all seoTitle values are unique', () => {
    const titles = datasets.map((d) => d.seoTitle);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it('all seoDescription values are unique', () => {
    const descriptions = datasets.map((d) => d.seoDescription);
    const unique = new Set(descriptions);
    expect(unique.size).toBe(descriptions.length);
  });

  it('all slugs match /^[a-z0-9-]+$/ pattern', () => {
    datasets.forEach((d) => {
      expect(d.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('seoTitles do not have trailing or leading whitespace', () => {
    datasets.forEach((d) => {
      expect(d.seoTitle).toBe(d.seoTitle.trim());
    });
  });

  it('seoDescriptions do not have trailing or leading whitespace', () => {
    datasets.forEach((d) => {
      expect(d.seoDescription).toBe(d.seoDescription.trim());
    });
  });
});

// ---------------------------------------------------------------------------
// 4. Data quality tests
// ---------------------------------------------------------------------------

describe('Data quality', () => {
  // Patterns that look like secrets/credentials
  // We avoid false positives from legitimate hex strings or example passwords
  const SECRET_PATTERNS = [
    /AKIA[0-9A-Z]{16}/, // AWS access key pattern
    /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, // PEM private keys
    /password\s*[:=]\s*["'][^"']{8,}["']/i, // hardcoded password= "..." with 8+ chars
  ];

  it('no dataset metadata contains strings that look like AWS access keys', () => {
    const datasets = getDatasets();
    const serialized = JSON.stringify(datasets);
    SECRET_PATTERNS.slice(0, 1).forEach((pattern) => {
      expect(serialized).not.toMatch(pattern);
    });
  });

  it('no dataset metadata contains PEM private keys', () => {
    const datasets = getDatasets();
    const serialized = JSON.stringify(datasets);
    expect(serialized).not.toMatch(SECRET_PATTERNS[1]);
  });

  it('all dataset data is valid JSON-serializable', () => {
    const allDatasets = getDatasets();
    const slugs = allDatasets.map((d) => d.slug);

    slugs.forEach((slug) => {
      const ds = getDatasetBySlug(slug);
      expect(() => {
        JSON.stringify(ds?.data);
      }).not.toThrow();
    });
  });

  it('world-countries data serializes to valid JSON', () => {
    const ds = getDatasetBySlug('world-countries');
    const json = JSON.stringify(ds?.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('mock-users data serializes to valid JSON', () => {
    const ds = getDatasetBySlug('mock-users');
    const json = JSON.stringify(ds?.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('http-status-codes data serializes to valid JSON', () => {
    const ds = getDatasetBySlug('http-status-codes');
    const json = JSON.stringify(ds?.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('science-elements data serializes to valid JSON', () => {
    const ds = getDatasetBySlug('science-elements');
    const json = JSON.stringify(ds?.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('json-edge-cases data serializes to valid JSON', () => {
    const ds = getDatasetBySlug('json-edge-cases');
    const json = JSON.stringify(ds?.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('each dataset record count matches the reported recordCount', () => {
    const allDatasets = getDatasets();
    allDatasets.forEach((meta) => {
      const ds = getDatasetBySlug(meta.slug);
      if (ds) {
        expect(ds.data.length).toBe(ds.recordCount);
      }
    });
  });

  it('each dataset reports positive fileSizeBytes', () => {
    getDatasets().forEach((d) => {
      expect(d.fileSizeBytes).toBeGreaterThan(0);
    });
  });
});
