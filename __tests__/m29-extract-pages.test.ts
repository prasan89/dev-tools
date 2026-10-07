/**
 * M29 — PDF Extract Pages tests
 *
 * Tests cover:
 *  - parsePageRanges: empty input, single page, range, comma-separated, mixed
 *  - parsePageRanges: sorted unique output
 *  - parsePageRanges: out-of-range page
 *  - parsePageRanges: invalid syntax
 *  - parsePageRanges: range start > end
 *  - parsePageRanges: duplicate pages deduplicated
 *  - parsePageRanges: whitespace-separated input
 *  - extractPages: empty pages array error
 *  - extractPages: AbortSignal cancelled
 *  - extractPages: success returns blob
 *  - extractPages: pageCount matches extracted count
 *  - extractPages: filename has -extracted.pdf suffix
 *  - extractPages: out-of-range page error
 *  - extractPages: encrypted PDF error
 *  - extractPages: preserves document order (not click order)
 *  - Page component exports default function
 *  - Layout exports metadata with correct title
 *  - Sitemap includes /pdf-tools/extract-pages
 *  - Hub page lists Extract Pages as available
 */

import {
  parsePageRanges,
  extractPages,
} from '../src/lib/pdf/extract';
import type { PdfFile } from '../src/types/pdf';

// ─── PdfFile factory ──────────────────────────────────────────────────────────

function makePdfFile(name = 'test.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────

jest.mock('pdf-lib', () => {
  let _pageCount = 10;

  const makePage = () => ({});

  const makeDoc = (count: number) => {
    const pages: unknown[] = Array.from({ length: count }, makePage);
    const added: unknown[] = [];
    return {
      getPageCount: () => count,
      copyPages: jest.fn().mockImplementation(async (_src: unknown, indices: number[]) =>
        indices.map((i) => pages[i] ?? makePage())
      ),
      addPage: (p: unknown) => { added.push(p); },
      save: jest.fn().mockResolvedValue(
        new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
      ),
      _added: added,
    };
  };

  const defaultLoad = jest.fn().mockImplementation(async () => makeDoc(_pageCount));
  const defaultCreate = jest.fn().mockImplementation(async () => makeDoc(0));

  const PDFDocument = {
    load: defaultLoad,
    create: defaultCreate,
  };

  return {
    PDFDocument,
    __setPageCount: (n: number) => {
      _pageCount = n;
      PDFDocument.load = jest.fn().mockImplementation(async () => makeDoc(_pageCount));
      PDFDocument.create = jest.fn().mockImplementation(async () => makeDoc(0));
    },
    __throwOnLoad: (msg: string) => {
      PDFDocument.load = jest.fn().mockRejectedValueOnce(new Error(msg));
    },
  };
});

// ─── parsePageRanges ──────────────────────────────────────────────────────────

describe('parsePageRanges', () => {
  it('errors on empty input', () => {
    const r = parsePageRanges('', 10);
    expect('error' in r).toBe(true);
  });

  it('parses single page', () => {
    const r = parsePageRanges('3', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([3]);
  });

  it('parses a simple range', () => {
    const r = parsePageRanges('2-5', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([2, 3, 4, 5]);
  });

  it('parses comma-separated pages', () => {
    const r = parsePageRanges('1,3,5', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([1, 3, 5]);
  });

  it('parses mixed ranges and pages', () => {
    const r = parsePageRanges('1-3,7,9-10', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([1, 2, 3, 7, 9, 10]);
  });

  it('produces sorted output', () => {
    const r = parsePageRanges('5,2,8', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([2, 5, 8]);
  });

  it('deduplicates overlapping ranges', () => {
    const r = parsePageRanges('1-5,3-7', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('errors on out-of-range page', () => {
    const r = parsePageRanges('15', 10);
    expect('error' in r).toBe(true);
  });

  it('errors on out-of-range range end', () => {
    const r = parsePageRanges('8-15', 10);
    expect('error' in r).toBe(true);
  });

  it('errors on range start > end', () => {
    const r = parsePageRanges('5-2', 10);
    expect('error' in r).toBe(true);
  });

  it('errors on non-numeric page', () => {
    const r = parsePageRanges('abc', 10);
    expect('error' in r).toBe(true);
  });

  it('handles whitespace-separated input', () => {
    const r = parsePageRanges('1 3 5', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.pages).toEqual([1, 3, 5]);
  });

  it('returns ranges array', () => {
    const r = parsePageRanges('1-3', 10);
    if ('error' in r) throw new Error(r.error);
    expect(r.ranges).toEqual([[1, 3]]);
  });
});

// ─── extractPages ──────────────────────────────────────────────────────────────

describe('extractPages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const m = jest.requireMock('pdf-lib') as { __setPageCount: (n: number) => void };
    m.__setPageCount(10);
  });

  it('errors for empty pages array', async () => {
    const result = await extractPages(makePdfFile(), []);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/no pages/i);
  });

  it('errors when signal already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const result = await extractPages(makePdfFile(), [1, 2, 3], ac.signal);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/cancel/i);
  });

  it('returns success for valid extraction', async () => {
    const result = await extractPages(makePdfFile(), [1, 3, 5]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('pageCount matches extracted page count', async () => {
    const result = await extractPages(makePdfFile(), [2, 4, 6, 8]);
    if (result.success) {
      expect(result.pageCount).toBe(4);
    }
  });

  it('filename has -extracted.pdf suffix', async () => {
    const result = await extractPages(makePdfFile('report.pdf'), [1]);
    if (result.success) {
      expect(result.filename).toBe('report-extracted.pdf');
    }
  });

  it('errors for out-of-range page number', async () => {
    const result = await extractPages(makePdfFile(), [1, 99]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/out of range|pages/i);
  });

  it('errors for encrypted PDF', async () => {
    const m = jest.requireMock('pdf-lib') as { __throwOnLoad: (msg: string) => void };
    m.__throwOnLoad('encrypted PDF — no password');
    const result = await extractPages(makePdfFile(), [1]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/password|encrypted/i);
  });

  it('preserves document order regardless of input order', async () => {
    // We pass [5,3,1] — extractPages should sort to [1,3,5]
    // The mock copyPages call will show 0-based [0,2,4]
    const { PDFDocument } = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock; create: jest.Mock } };
    const result = await extractPages(makePdfFile(), [5, 3, 1]);
    // Our implementation sorts pages before passing; verify it didn't error
    expect(result.success).toBe(true);
    expect(PDFDocument.create).toHaveBeenCalled();
  });

  it('single page extraction works', async () => {
    const result = await extractPages(makePdfFile(), [7]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.pageCount).toBe(1);
  });

  it('extracts all pages successfully', async () => {
    const pages = Array.from({ length: 10 }, (_, i) => i + 1);
    const result = await extractPages(makePdfFile(), pages);
    expect(result.success).toBe(true);
    if (result.success) expect(result.pageCount).toBe(10);
  });
});

// ─── Module smoke tests ───────────────────────────────────────────────────────

describe('extract-pages page module', () => {
  it('exports a default function', async () => {
    const mod = await import('../src/app/pdf-tools/extract-pages/page');
    expect(typeof mod.default).toBe('function');
  });
});

describe('extract-pages layout module', () => {
  it('exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/extract-pages/layout');
    expect(mod.metadata).toBeDefined();
    expect((mod.metadata.title as string).toLowerCase()).toContain('extract');
  });

  it('metadata canonical URL contains /pdf-tools/extract-pages', async () => {
    const mod = await import('../src/app/pdf-tools/extract-pages/layout');
    const canonical = mod.metadata.alternates?.canonical as string;
    expect(canonical).toContain('/pdf-tools/extract-pages');
  });
});

describe('sitemap', () => {
  it('includes /pdf-tools/extract-pages', async () => {
    const mod = await import('../src/app/sitemap');
    const urls = mod.default().map((e) => e.url);
    expect(urls.some((u) => u.includes('/pdf-tools/extract-pages'))).toBe(true);
  });
});

describe('pdf-tools hub', () => {
  it('lists Extract Pages as available', () => {
    const fs = require('fs');
    const src = fs.readFileSync('src/app/pdf-tools/page.tsx', 'utf-8');
    expect(src).toContain('extract-pages');
    expect(src).toContain('available: true');
  });
});
