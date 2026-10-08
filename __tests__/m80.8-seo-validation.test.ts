/**
 * M80.8 — SEO architecture validation tests
 *
 * 1. Sitemap completeness — every intended indexable route appears in the sitemap.
 * 2. Sitemap correctness — no excluded/internal routes in the sitemap.
 * 3. PDF tools SEO registry — unique titles and descriptions.
 * 4. Registry tools — unique seoTitle and seoDescription per tool.
 */

import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// Sitemap helpers
// ─────────────────────────────────────────────────────────────────────────────

function loadSitemapUrls(): string[] {
  // We can't call the Next.js sitemap() function directly from Jest because it
  // imports server-only modules. Instead we parse the sitemap source for
  // SITE_URL template literals and the getAllIndexablePdfToolPaths() import.
  // For correctness we import and call the sitemap function via the compiled
  // module resolution path. Because Jest's module system handles this we just
  // import it directly.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sitemapModule = require('../src/app/sitemap') as { default: () => Array<{ url: string }> };
  return sitemapModule.default().map((entry) => entry.url);
}

function stripOrigin(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Expected indexable routes
// ─────────────────────────────────────────────────────────────────────────────

// Static pages that must be in the sitemap
const REQUIRED_STATIC_PATHS = [
  '/',
  '/tools',
  '/pdf-tools',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// PDF tools that are publicly listed and must appear in the sitemap
const REQUIRED_PDF_TOOL_PATHS = [
  '/pdf-tools/merge-pdf',
  '/pdf-tools/split-pdf',
  '/pdf-tools/compress-pdf',
  '/pdf-tools/pdf-to-jpg',
  '/pdf-tools/jpg-png-to-pdf',
  '/pdf-tools/organize-pdf',
  '/pdf-tools/crop-pdf',
  '/pdf-tools/extract-pages',
  '/pdf-tools/edit-pdf',
  '/pdf-tools/fill-pdf',
  '/pdf-tools/create-pdf-form',
  '/pdf-tools/pdf-to-html',
  '/pdf-tools/pdf-to-svg',
  '/pdf-tools/pdf-to-webp',
  '/pdf-tools/html-to-pdf',
  '/pdf-tools/webpage-to-pdf',
  '/pdf-tools/pdf-to-word',
  '/pdf-tools/pdf-to-excel',
  '/pdf-tools/pdf-to-powerpoint',
  '/pdf-tools/word-to-pdf',
  '/pdf-tools/excel-to-pdf',
  '/pdf-tools/powerpoint-to-pdf',
  '/pdf-tools/watermark-pdf',
  '/pdf-tools/page-numbers',
  '/pdf-tools/pdf-metadata',
  '/pdf-tools/protect-pdf',
  '/pdf-tools/unlock-pdf',
  '/pdf-tools/redact-pdf',
  '/pdf-tools/pdf-to-text',
  '/pdf-tools/pdf-to-markdown',
  '/pdf-tools/ocr',
  '/pdf-tools/ocr-searchable-pdf',
  '/pdf-tools/ocr-text',
  '/pdf-tools/create-pdf',
  '/pdf-tools/scan-to-pdf',
  '/pdf-tools/compare-pdf',
  '/pdf-tools/repair-pdf',
  '/pdf-tools/pdf-a',
];

// Internal pages that must NOT appear in the sitemap
const EXCLUDED_PATHS = [
  '/pdf-tools/viewer',
  '/pdf-tools/workers',
  '/pdf-tools/workflows',
  '/pdf-tools/performance',
  '/donate/success',
  '/donate/cancelled',
];

// ─────────────────────────────────────────────────────────────────────────────
// Sitemap tests
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.8 sitemap — completeness', () => {
  let paths: string[];

  beforeAll(() => {
    paths = loadSitemapUrls().map(stripOrigin);
  });

  it('contains the homepage', () => {
    expect(paths).toContain('/');
  });

  it.each(REQUIRED_STATIC_PATHS)('contains static page: %s', (p) => {
    expect(paths).toContain(p);
  });

  it.each(REQUIRED_PDF_TOOL_PATHS)('contains PDF tool: %s', (p) => {
    expect(paths).toContain(p);
  });

  it('contains all 13 tool category pages', () => {
    const categoryPaths = paths.filter((p) => p.startsWith('/tools/category/'));
    expect(categoryPaths.length).toBeGreaterThanOrEqual(13);
  });

  it('contains tool pages', () => {
    const toolPaths = paths.filter((p) => p.startsWith('/tools/') && !p.startsWith('/tools/category/'));
    expect(toolPaths.length).toBeGreaterThanOrEqual(80);
  });

  it('has no duplicate URLs', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const p of paths) {
      if (seen.has(p)) dupes.push(p);
      seen.add(p);
    }
    expect(dupes).toHaveLength(0);
  });
});

describe('M80.8 sitemap — exclusions', () => {
  let paths: string[];

  beforeAll(() => {
    paths = loadSitemapUrls().map(stripOrigin);
  });

  it.each(EXCLUDED_PATHS)('does NOT contain excluded path: %s', (p) => {
    expect(paths).not.toContain(p);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF tools SEO registry tests
// ─────────────────────────────────────────────────────────────────────────────

import { getAllIndexablePdfToolPaths, getPdfToolSeo } from '../src/lib/seo/pdf-tools';

describe('M80.8 PDF tools SEO registry', () => {
  const indexablePaths = getAllIndexablePdfToolPaths();

  it('has at least 38 indexable PDF tool paths', () => {
    expect(indexablePaths.length).toBeGreaterThanOrEqual(38);
  });

  it('every indexable path has a non-empty title', () => {
    for (const p of indexablePaths) {
      const slug = p.replace('/pdf-tools/', '');
      const seo = getPdfToolSeo(slug);
      expect(seo?.title.length).toBeGreaterThan(10);
    }
  });

  it('every indexable path has a non-empty description (≥60 chars)', () => {
    for (const p of indexablePaths) {
      const slug = p.replace('/pdf-tools/', '');
      const seo = getPdfToolSeo(slug);
      expect(seo?.description.length ?? 0).toBeGreaterThanOrEqual(60);
    }
  });

  it('all titles are unique', () => {
    const titles = indexablePaths.map((p) => getPdfToolSeo(p.replace('/pdf-tools/', ''))?.title ?? '');
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it('all descriptions are unique', () => {
    const descs = indexablePaths.map((p) => getPdfToolSeo(p.replace('/pdf-tools/', ''))?.description ?? '');
    const unique = new Set(descs);
    expect(unique.size).toBe(descs.length);
  });

  it('every indexable path has a keywords array', () => {
    for (const p of indexablePaths) {
      const slug = p.replace('/pdf-tools/', '');
      const seo = getPdfToolSeo(slug);
      expect(Array.isArray(seo?.keywords)).toBe(true);
      expect((seo?.keywords ?? []).length).toBeGreaterThan(0);
    }
  });

  it('REQUIRED_PDF_TOOL_PATHS are all in getAllIndexablePdfToolPaths()', () => {
    const set = new Set(indexablePaths);
    const missing = REQUIRED_PDF_TOOL_PATHS.filter((p) => !set.has(p));
    expect(missing).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Registry tool SEO uniqueness
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.8 tool registry — SEO uniqueness', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getEnabledTools } = require('../src/lib/registry') as typeof import('../src/lib/registry');
  const tools = getEnabledTools();

  it('every enabled tool has a seoTitle', () => {
    const missing = tools.filter((t) => !t.seoTitle);
    expect(missing.map((t) => t.slug)).toHaveLength(0);
  });

  it('every enabled tool has a seoDescription', () => {
    const missing = tools.filter((t) => !t.seoDescription);
    expect(missing.map((t) => t.slug)).toHaveLength(0);
  });

  it('all seoTitles are unique', () => {
    const titles = tools.map((t) => t.seoTitle);
    const unique = new Set(titles);
    if (unique.size !== titles.length) {
      const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
      expect(dupes).toHaveLength(0);
    }
    expect(unique.size).toBe(titles.length);
  });

  it('all seoDescriptions are unique', () => {
    const descs = tools.map((t) => t.seoDescription);
    const unique = new Set(descs);
    if (unique.size !== descs.length) {
      const dupes = descs.filter((d, i) => descs.indexOf(d) !== i);
      expect(dupes).toHaveLength(0);
    }
    expect(unique.size).toBe(descs.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF tool pages — metadata export presence
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.8 PDF tool pages — metadata exports', () => {
  const pdfPagesDir = path.join(process.cwd(), 'src/app/pdf-tools');

  it.each(REQUIRED_PDF_TOOL_PATHS)('%s page.tsx exports metadata', (toolPath) => {
    const slug = toolPath.replace('/pdf-tools/', '');
    const pagePath = path.join(pdfPagesDir, slug, 'page.tsx');
    const src = fs.readFileSync(pagePath, 'utf8');
    const hasMetadata = src.includes('export const metadata') || src.includes('export async function generateMetadata');
    expect(hasMetadata).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Robots — internal pages must have index: false in the SEO registry
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.8 robots — internal pages noindex', () => {
  const INTERNAL_NOINDEX_SLUGS = ['workers', 'workflows', 'performance', 'viewer'];

  it.each(INTERNAL_NOINDEX_SLUGS)('/pdf-tools/%s is marked index:false in the SEO registry', (slug) => {
    const seo = getPdfToolSeo(slug);
    expect(seo).not.toBeNull();
    expect(seo?.index).toBe(false);
  });
});
