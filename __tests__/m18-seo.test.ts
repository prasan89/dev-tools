/**
 * M18 tests — SEO Foundation (site-config, registry SEO completeness, sitemap)
 *
 * Covers:
 *   site-config: SITE_NAME, SITE_URL, siteUrl() helper
 *   Registry SEO completeness: all tools have seoTitle/seoDescription, unique
 *   Categories SEO: all categories have seoTitle
 *   Sitemap: exports a default function
 *   No hardcoded production domains in SEO config
 */

import { SITE_URL, SITE_NAME, siteUrl } from '../src/lib/seo/site-config';
import { getEnabledTools, getCategories } from '../src/lib/registry';

// ---------------------------------------------------------------------------
// 1. Site config tests
// ---------------------------------------------------------------------------

describe('site-config', () => {
  it('SITE_NAME is DevToolsHub', () => expect(SITE_NAME).toBe('DevToolsHub'));

  it('SITE_URL is defined string', () => expect(typeof SITE_URL).toBe('string'));

  it('SITE_URL has no trailing slash', () => expect(SITE_URL).not.toMatch(/\/$/));

  it('siteUrl builds correct path', () => {
    const url = siteUrl('/tools/json-formatter');
    expect(url).toContain('/tools/json-formatter');
    // no double slashes in the path portion (after the protocol)
    const pathPart = url.replace(/^https?:\/\/[^/]+/, '');
    expect(pathPart).not.toMatch(/\/\//);
  });

  it('siteUrl works without leading slash', () => {
    expect(siteUrl('tools/json-formatter')).toContain('/tools/json-formatter');
  });
});

// ---------------------------------------------------------------------------
// 2. Registry SEO completeness tests
// ---------------------------------------------------------------------------

describe('registry SEO completeness', () => {
  it('all tools have seoTitle', () => {
    const tools = getEnabledTools();
    const missing = tools.filter((t) => !t.seoTitle || t.seoTitle.length < 10);
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it('all tools have seoDescription', () => {
    const tools = getEnabledTools();
    const missing = tools.filter(
      (t) => !t.seoDescription || t.seoDescription.length < 50,
    );
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it('all tool seoTitles are unique', () => {
    const titles = getEnabledTools().map((t) => t.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('all tool seoDescriptions are unique', () => {
    const descs = getEnabledTools().map((t) => t.seoDescription);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it('no tool seoTitle hardcodes a domain', () => {
    const tools = getEnabledTools();
    const withDomain = tools.filter((t) => /https?:\/\//.test(t.seoTitle || ''));
    expect(withDomain.map((t) => t.id)).toEqual([]);
  });

  it('all categories have seoTitle', () => {
    const cats = getCategories();
    const missing = cats.filter((c) => !c.seoTitle);
    expect(missing.map((c) => c.id)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Sitemap test
// ---------------------------------------------------------------------------

describe('sitemap', () => {
  it('sitemap is a function', async () => {
    // Just verify it exists and exports a default function
    const mod = await import('../src/app/sitemap');
    expect(typeof mod.default).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 4. No hardcoded production domain test
// ---------------------------------------------------------------------------

describe('no hardcoded production domain in seo config', () => {
  it('SITE_URL does not contain production domains when env var is unset', () => {
    // In test env (no NEXT_PUBLIC_SITE_URL set), should be localhost
    expect(SITE_URL).not.toContain('devtoolshub.dev');
    expect(SITE_URL).not.toContain('run.app');
    expect(SITE_URL).not.toContain('toolbook.dev');
  });
});
