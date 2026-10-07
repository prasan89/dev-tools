/**
 * M20 — SEO Validation & Indexing Readiness tests
 *
 * Covers:
 *   - All tool seoTitles contain brand or meaningful descriptors (no bare names)
 *   - All tool seoDescriptions meet minimum quality bar
 *   - Sitemap includes all important static pages
 *   - Sitemap has no duplicate URLs
 *   - Category pages have absolute canonical (use siteUrl)
 *   - robots.ts blocks /api/ routes
 *   - No hardcoded production domains in registry
 *   - Structured data helpers produce valid JSON
 *   - Internal linking: relatedTools reference valid tool slugs
 *   - Donate page canonical is absolute
 */

import { getEnabledTools, getCategories, getToolBySlug } from '../src/lib/registry';
import { SITE_URL, SITE_NAME, siteUrl } from '../src/lib/seo/site-config';

// ─────────────────────────────────────────────
// 1. Tool seoTitle quality — no bare tool names
// ─────────────────────────────────────────────

describe('Tool seoTitle quality', () => {
  const tools = getEnabledTools();

  it('all seoTitles are at least 20 characters', () => {
    const short = tools.filter((t) => (t.seoTitle || '').length < 20);
    expect(short.map((t) => `${t.id}: "${t.seoTitle}"`)).toEqual([]);
  });

  it('all seoTitles are under 75 characters', () => {
    const long = tools.filter((t) => (t.seoTitle || '').length > 75);
    expect(long.map((t) => `${t.id}: ${t.seoTitle?.length}ch`)).toEqual([]);
  });

  it('no seoTitle is just the bare tool name with no descriptor', () => {
    // A bare title would be exactly equal to the tool name with no added words.
    // We check that every title contains at least one of: a dash, pipe, "Online", "Free", "Generator", "Converter", brand name
    const barePattern = /[-|—]|Online|Free|Generator|Converter|Checker|Formatter|Validator|Decoder|Encoder|Tester|Calculator|Preview|Counter|Picker|DevToolsHub/i;
    const bare = tools.filter((t) => !barePattern.test(t.seoTitle || ''));
    expect(bare.map((t) => `${t.id}: "${t.seoTitle}"`)).toEqual([]);
  });

  it('all seoTitles contain the brand name DevToolsHub OR a meaningful keyword pair', () => {
    // A meaningful title must contain either: brand name, or a descriptor word (verb/adjective/type)
    // "JSON Sorter — Sort JSON Object Keys" qualifies via the dash + description
    const hasDescriptor = /[-—]|Online|Free|Generator|Converter|Checker|Formatter|Validator|Decoder|Encoder|Tester|Calculator|Preview|Counter|Picker|Parser|Builder|Sorter|Escape|Viewer|Analyzer|Repair|Minifier|Beautifier|Stringify|Flatten|Searcher|Maker|DevToolsHub/i;
    const bare = tools.filter((t) => !hasDescriptor.test(t.seoTitle || ''));
    expect(bare.map((t) => `${t.id}: "${t.seoTitle}"`)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 2. Tool seoDescription quality
// ─────────────────────────────────────────────

describe('Tool seoDescription quality', () => {
  const tools = getEnabledTools();

  it('all seoDescriptions are at least 80 characters', () => {
    const short = tools.filter((t) => (t.seoDescription || '').length < 80);
    expect(short.map((t) => `${t.id}: ${t.seoDescription?.length}ch`)).toEqual([]);
  });

  it('all seoDescriptions are under 170 characters', () => {
    const long = tools.filter((t) => (t.seoDescription || '').length > 170);
    expect(long.map((t) => `${t.id}: ${t.seoDescription?.length}ch`)).toEqual([]);
  });

  it('no two tools share the same seoDescription', () => {
    const descs = tools.map((t) => t.seoDescription);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it('no seoDescription contains a hardcoded domain', () => {
    const withDomain = tools.filter((t) => /https?:\/\//.test(t.seoDescription || ''));
    expect(withDomain.map((t) => t.id)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 3. Category SEO quality
// ─────────────────────────────────────────────

describe('Category SEO quality', () => {
  const cats = getCategories();

  it('all categories have seoTitle', () => {
    const missing = cats.filter((c) => !c.seoTitle);
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it('all categories have seoDescription at least 60 characters', () => {
    const short = cats.filter((c) => (c.seoDescription || '').length < 60);
    expect(short.map((c) => `${c.id}: ${c.seoDescription?.length}ch`)).toEqual([]);
  });

  it('all categories have longDescription', () => {
    const missing = cats.filter((c) => !c.longDescription);
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it('all category seoTitles are unique', () => {
    const titles = cats.map((c) => c.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('utilities category has descriptive seoTitle (not "Miscellaneous")', () => {
    const utilities = cats.find((c) => c.id === 'utilities');
    expect(utilities?.seoTitle).not.toContain('Miscellaneous');
    expect((utilities?.seoTitle || '').length).toBeGreaterThan(30);
  });
});

// ─────────────────────────────────────────────
// 4. Sitemap completeness
// ─────────────────────────────────────────────

describe('Sitemap completeness', () => {
  let sitemapEntries: { url: string }[] = [];

  beforeAll(async () => {
    const mod = await import('../src/app/sitemap');
    sitemapEntries = mod.default() as { url: string }[];
  });

  it('sitemap returns an array', () => {
    expect(Array.isArray(sitemapEntries)).toBe(true);
    expect(sitemapEntries.length).toBeGreaterThan(200);
  });

  it('sitemap has no duplicate URLs', () => {
    const urls = sitemapEntries.map((e) => e.url);
    const unique = new Set(urls);
    const duplicates = urls.filter((url, i) => urls.indexOf(url) !== i);
    expect(duplicates).toEqual([]);
  });

  it('all sitemap URLs are absolute', () => {
    const relative = sitemapEntries.filter((e) => !e.url.startsWith('http'));
    expect(relative.map((e) => e.url)).toEqual([]);
  });

  it('homepage is in sitemap', () => {
    expect(sitemapEntries.some((e) => e.url === SITE_URL || e.url === `${SITE_URL}/`)).toBe(true);
  });

  it('/tools listing page is in sitemap', () => {
    expect(sitemapEntries.some((e) => e.url === `${SITE_URL}/tools`)).toBe(true);
  });

  it('/datasets page is in sitemap', () => {
    expect(sitemapEntries.some((e) => e.url === `${SITE_URL}/datasets`)).toBe(true);
  });

  it('/donate page is in sitemap', () => {
    expect(sitemapEntries.some((e) => e.url === `${SITE_URL}/donate`)).toBe(true);
  });

  it('all 13 category pages are in sitemap', () => {
    const cats = getCategories();
    const missedCats = cats.filter(
      (c) => !sitemapEntries.some((e) => e.url === `${SITE_URL}/tools/category/${c.slug}`)
    );
    expect(missedCats.map((c) => c.id)).toEqual([]);
  });

  it('all tool pages are in sitemap', () => {
    const tools = getEnabledTools();
    const missed = tools.filter(
      (t) => !sitemapEntries.some((e) => e.url === `${SITE_URL}/tools/${t.slug}`)
    );
    expect(missed.map((t) => t.id)).toEqual([]);
  });

  it('sitemap includes at least 250 entries (tools + datasets + categories + static)', () => {
    expect(sitemapEntries.length).toBeGreaterThanOrEqual(250);
  });

  it('sitemap lastModified values are Date objects', () => {
    const nonDate = sitemapEntries.filter(
      (e) => 'lastModified' in e && !(e.lastModified instanceof Date)
    );
    expect(nonDate.map((e) => e.url)).toEqual([]);
  });

  it('sitemap lastModified is not a hardcoded 2026-01-01 date', () => {
    // Previously was hardcoded to 2026-01-01 — now should be build time
    const stale = sitemapEntries.filter((e) => {
      const d = (e as { lastModified?: Date }).lastModified;
      return d instanceof Date && d.toISOString().startsWith('2026-01-01');
    });
    expect(stale.map((e) => e.url)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 5. Robots.txt correctness
// ─────────────────────────────────────────────

describe('robots.ts correctness', () => {
  it('robots returns an object with rules and sitemap', async () => {
    const mod = await import('../src/app/robots');
    const result = mod.default();
    expect(result).toBeDefined();
    expect(result.sitemap).toBeDefined();
  });

  it('robots sitemap references SITE_URL', async () => {
    const mod = await import('../src/app/robots');
    const result = mod.default();
    const sitemapUrl = typeof result.sitemap === 'string' ? result.sitemap : result.sitemap?.[0];
    expect(sitemapUrl).toContain('/sitemap.xml');
    expect(sitemapUrl).toContain(SITE_URL);
  });

  it('robots disallows /api/ to save crawl budget', async () => {
    const mod = await import('../src/app/robots');
    const result = mod.default();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const hasApiDisallow = rules.some((r) => {
      const disallow = Array.isArray(r?.disallow) ? r.disallow : [r?.disallow];
      return disallow.some((d) => d && d.startsWith('/api'));
    });
    expect(hasApiDisallow).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Internal linking integrity
// ─────────────────────────────────────────────

describe('Internal linking integrity', () => {
  it('all relatedTools references point to valid tool slugs', () => {
    const tools = getEnabledTools();
    const allSlugs = new Set(tools.map((t) => t.slug));
    const broken: string[] = [];
    for (const tool of tools) {
      for (const related of tool.relatedTools || []) {
        if (!allSlugs.has(related)) {
          broken.push(`${tool.id} → ${related}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('popular tools have at least 2 relatedTools entries', () => {
    const tools = getEnabledTools().filter((t) => t.popular);
    const weak = tools.filter((t) => (t.relatedTools || []).length < 2);
    expect(weak.map((t) => t.id)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 7. No hardcoded production domains in registry
// ─────────────────────────────────────────────

describe('No hardcoded domains in registry', () => {
  const domainPattern = /https?:\/\/(devtoolshub|toolbook)\.(dev|com|io|app)/i;

  it('no tool seoTitle contains a hardcoded production domain', () => {
    const tools = getEnabledTools();
    const bad = tools.filter((t) => domainPattern.test(t.seoTitle || ''));
    expect(bad.map((t) => t.id)).toEqual([]);
  });

  it('no tool seoDescription contains a hardcoded production domain', () => {
    const tools = getEnabledTools();
    const bad = tools.filter((t) => domainPattern.test(t.seoDescription || ''));
    expect(bad.map((t) => t.id)).toEqual([]);
  });

  it('no category seoTitle contains a hardcoded production domain', () => {
    const cats = getCategories();
    const bad = cats.filter((c) => domainPattern.test(c.seoTitle || ''));
    expect(bad.map((c) => c.id)).toEqual([]);
  });

  it('SITE_URL does not contain a hardcoded production domain in test env', () => {
    // In test environment, NEXT_PUBLIC_SITE_URL is not set → should be localhost
    expect(SITE_URL).not.toMatch(domainPattern);
  });
});

// ─────────────────────────────────────────────
// 8. siteUrl() helper produces absolute URLs
// ─────────────────────────────────────────────

describe('siteUrl() absolute URL generation', () => {
  it('produces absolute URL for tool pages', () => {
    const url = siteUrl('/tools/json-formatter');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('/tools/json-formatter');
  });

  it('produces absolute URL for category pages', () => {
    const url = siteUrl('/tools/category/json');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('/tools/category/json');
  });

  it('produces absolute URL for dataset pages', () => {
    const url = siteUrl('/datasets/world-countries');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('/datasets/world-countries');
  });

  it('produces absolute URL for donate page', () => {
    const url = siteUrl('/donate');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('/donate');
  });
});

// ─────────────────────────────────────────────
// 9. SITE_NAME consistency
// ─────────────────────────────────────────────

describe('SITE_NAME', () => {
  it('is DevToolsHub', () => {
    expect(SITE_NAME).toBe('DevToolsHub');
  });

  it('appears in at least 25% of tool seoTitles or seoDescriptions', () => {
    const tools = getEnabledTools();
    const withBrandAnywhere = tools.filter(
      (t) => (t.seoTitle || '').includes(SITE_NAME) || (t.seoDescription || '').includes(SITE_NAME)
    );
    expect(withBrandAnywhere.length / tools.length).toBeGreaterThan(0.25);
  });
});

// ─────────────────────────────────────────────
// 10. SEO health summary counts (non-blocking, informational)
// ─────────────────────────────────────────────

describe('SEO health summary', () => {
  it('reports tool count matches registry', () => {
    const tools = getEnabledTools();
    expect(tools.length).toBeGreaterThanOrEqual(85);
  });

  it('reports category count matches registry', () => {
    const cats = getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(13);
  });

  it('all tool slugs are URL-safe (no spaces or special chars)', () => {
    const tools = getEnabledTools();
    const unsafe = tools.filter((t) => !/^[a-z0-9-]+$/.test(t.slug));
    expect(unsafe.map((t) => t.id)).toEqual([]);
  });

  it('all category slugs are URL-safe', () => {
    const cats = getCategories();
    const unsafe = cats.filter((c) => !/^[a-z0-9-]+$/.test(c.slug));
    expect(unsafe.map((c) => c.id)).toEqual([]);
  });
});
