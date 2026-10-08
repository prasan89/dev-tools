/**
 * M80.4 — Homepage Simplification & PDF Tools First Tests
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

describe('Homepage: simplified structure', () => {
  let src: string;
  beforeAll(() => {
    src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
  });

  it('page.tsx is a Server Component (no "use client")', () => {
    expect(src).not.toMatch(/^['"]use client['"]/m);
  });

  it('does not import getPopularTools', () => {
    expect(src).not.toContain('getPopularTools');
  });

  it('does not import getPopularDatasets', () => {
    expect(src).not.toContain('getPopularDatasets');
  });

  it('does not have "Why DevToolsHub" section', () => {
    expect(src).not.toContain('Why DevToolsHub');
  });

  it('does not have "Popular Tools" section', () => {
    expect(src).not.toContain('Popular Tools');
  });

  it('does not have "All Tools" section', () => {
    expect(src).not.toContain('all-tools-heading');
  });

  it('has Browse by Category heading', () => {
    expect(src).toContain('Browse by Category');
  });

  it('imports getOrderedCategories (deterministic order)', () => {
    expect(src).toContain('getOrderedCategories');
  });
});

describe('Homepage: PDF Tools appears first', () => {
  let src: string;
  beforeAll(() => {
    src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
  });

  it('links to /pdf-tools', () => {
    expect(src).toContain('href="/pdf-tools"');
  });

  it('PDF Tools card appears before the categories map', () => {
    const pdfPos = src.indexOf('href="/pdf-tools"');
    const mapPos = src.indexOf('categories.map');
    expect(pdfPos).toBeGreaterThan(-1);
    expect(mapPos).toBeGreaterThan(-1);
    expect(pdfPos).toBeLessThan(mapPos);
  });

  it('PDF Tools label appears in page', () => {
    expect(src).toContain('PDF Tools');
  });
});

describe('Homepage: no heavy PDF library imports', () => {
  let src: string;
  beforeAll(() => {
    src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
  });

  const forbidden = ['pdfjs-dist', 'pdf-lib', '@cantoo/pdf-lib', 'tesseract.js', 'mammoth', 'xlsx', 'jszip'];
  for (const lib of forbidden) {
    it(`does not import '${lib}'`, () => {
      expect(src).not.toContain(lib);
    });
  }
});

describe('AdSenseConditional: skips homepage', () => {
  let src: string;
  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/components/ads/AdSenseConditional.tsx'),
      'utf8',
    );
  });

  it('uses usePathname to check route', () => {
    expect(src).toContain('usePathname');
  });

  it('returns null for homepage path "/"', () => {
    expect(src).toContain("pathname === '/'");
    // null return must exist
    expect(src).toContain('return null');
  });

  it('renders AdSenseScript for other routes', () => {
    expect(src).toContain('AdSenseScript');
  });
});

describe('layout.tsx: uses AdSenseConditional not AdSenseScript directly', () => {
  let src: string;
  beforeAll(() => {
    src = fs.readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
  });

  it('imports AdSenseConditional', () => {
    expect(src).toContain('AdSenseConditional');
  });

  it('does not directly import AdSenseScript', () => {
    expect(src).not.toContain("from '@/components/ads/AdSenseScript'");
  });
});

describe('Registry: CATEGORY_ORDER and getOrderedCategories', () => {
  it('exports CATEGORY_ORDER', async () => {
    const mod = await import('../src/lib/registry');
    expect(Array.isArray((mod as unknown as Record<string, unknown>).CATEGORY_ORDER)).toBe(true);
  });

  it('CATEGORY_ORDER starts with json', async () => {
    const mod = await import('../src/lib/registry');
    const order = (mod as unknown as Record<string, string[]>).CATEGORY_ORDER;
    expect(order[0]).toBe('json');
  });

  it('exports getOrderedCategories function', async () => {
    const mod = await import('../src/lib/registry');
    expect(typeof (mod as unknown as Record<string, unknown>).getOrderedCategories).toBe('function');
  });

  it('getOrderedCategories returns categories in CATEGORY_ORDER order', async () => {
    const mod = await import('../src/lib/registry');
    const fn = (mod as unknown as Record<string, () => Array<{id: string}>>).getOrderedCategories;
    const ordered = fn();
    expect(ordered[0].id).toBe('json');
    expect(ordered[1].id).toBe('encoding');
  });

  it('getOrderedCategories returns all categories', async () => {
    const mod = await import('../src/lib/registry');
    const fn = (mod as unknown as Record<string, () => unknown[]>).getOrderedCategories;
    const getCategories = mod.getCategories;
    expect(fn().length).toBe(getCategories().length);
  });
});
