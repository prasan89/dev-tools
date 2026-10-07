/**
 * M46 — Compare PDFs tests
 */

import {
  diffTextPages,
  hasDifferences,
} from '../src/lib/pdf/comparePdf';
import type { PageTextContent } from '../src/lib/pdf/comparePdf';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

// Mock pdfjs-dist
jest.mock('pdfjs-dist', () => {
  const mockGetTextContent = jest.fn().mockResolvedValue({
    items: [{ str: 'Hello world' }, { str: 'line two' }],
  });
  const mockPage = { getTextContent: mockGetTextContent };
  const mockPdf = {
    numPages: 2,
    getPage: jest.fn().mockResolvedValue(mockPage),
  };
  return {
    getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
    GlobalWorkerOptions: { workerPort: null },
    __mockPdf: mockPdf,
    __mockGetTextContent: mockGetTextContent,
  };
});

// ─── diffTextPages ────────────────────────────────────────────────────────────

describe('diffTextPages', () => {
  it('returns no diffs for identical pages', () => {
    const pages: PageTextContent[] = [
      { pageIndex: 0, text: 'line one\nline two\nline three' },
    ];
    const diffs = diffTextPages(pages, pages);
    expect(diffs[0].added).toHaveLength(0);
    expect(diffs[0].removed).toHaveLength(0);
  });

  it('detects added lines in doc2', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'line one' }];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'line one\nnew line' }];
    const diffs = diffTextPages(p1, p2);
    expect(diffs[0].added).toContain('new line');
    expect(diffs[0].removed).toHaveLength(0);
  });

  it('detects removed lines from doc1', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'line one\nline two' }];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'line one' }];
    const diffs = diffTextPages(p1, p2);
    expect(diffs[0].removed).toContain('line two');
    expect(diffs[0].added).toHaveLength(0);
  });

  it('counts unchanged lines', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'same\nremoved' }];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'same\nadded' }];
    const diffs = diffTextPages(p1, p2);
    expect(diffs[0].unchanged).toBe(1);
    expect(diffs[0].added).toContain('added');
    expect(diffs[0].removed).toContain('removed');
  });

  it('handles doc1 having more pages than doc2', () => {
    const p1: PageTextContent[] = [
      { pageIndex: 0, text: 'page 1 content' },
      { pageIndex: 1, text: 'page 2 content' },
    ];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'page 1 content' }];
    const diffs = diffTextPages(p1, p2);
    expect(diffs).toHaveLength(2);
    // page 2 exists only in p1 → removed
    expect(diffs[1].removed).toContain('page 2 content');
  });

  it('handles doc2 having more pages than doc1', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'page 1' }];
    const p2: PageTextContent[] = [
      { pageIndex: 0, text: 'page 1' },
      { pageIndex: 1, text: 'extra page' },
    ];
    const diffs = diffTextPages(p1, p2);
    expect(diffs).toHaveLength(2);
    expect(diffs[1].added).toContain('extra page');
  });

  it('returns empty diff for empty pages', () => {
    const diffs = diffTextPages([], []);
    expect(diffs).toHaveLength(0);
  });
});

// ─── hasDifferences ───────────────────────────────────────────────────────────

describe('hasDifferences', () => {
  it('returns false for identical content', () => {
    const pages: PageTextContent[] = [{ pageIndex: 0, text: 'same content' }];
    const diffs = diffTextPages(pages, pages);
    expect(hasDifferences(diffs)).toBe(false);
  });

  it('returns true when there are additions', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'line one' }];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'line one\nnew line' }];
    const diffs = diffTextPages(p1, p2);
    expect(hasDifferences(diffs)).toBe(true);
  });

  it('returns true when there are removals', () => {
    const p1: PageTextContent[] = [{ pageIndex: 0, text: 'line one\nremoved' }];
    const p2: PageTextContent[] = [{ pageIndex: 0, text: 'line one' }];
    const diffs = diffTextPages(p1, p2);
    expect(hasDifferences(diffs)).toBe(true);
  });

  it('returns false for empty diffs array', () => {
    expect(hasDifferences([])).toBe(false);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('compare-pdf layout metadata', () => {
  it('title contains compare PDF', async () => {
    const mod = await import('../src/app/pdf-tools/compare-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/compare.+pdf/i);
  });

  it('has compare-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/compare-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/compare pdf|pdf diff|pdf comparison/);
  });

  it('canonical url contains compare-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/compare-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('compare-pdf');
  });
});
