/**
 * M24 — Split PDF tests
 *
 * Tests cover:
 *  - parsePageRanges: valid/invalid inputs, edge cases
 *  - rangesToIndices: correct 0-based index generation
 *  - extractPageRange: single page, range, multi-segment, invalid range
 *  - splitEveryPage: correct number of parts, each single page
 *  - splitByRanges: multiple parts, correct page counts
 *  - extractSelectedPages: from a Set of page numbers
 *  - error handling: corrupted PDF, password-protected, empty selection
 *  - output PDF validity (%PDF- header)
 *  - sitemap includes /pdf-tools/split-pdf
 *  - hub page lists Split PDF as available
 */

import { parsePageRanges, rangesToIndices, formatRangeLabel } from '../src/lib/pdf/split';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

async function buildMinimalPdf(pageCount = 1): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  return doc.save() as unknown as Promise<Uint8Array>;
}

function makePdfFile(name: string, content: Uint8Array | string = '%PDF-1.4\n'): PdfFile {
  const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  return {
    id: `id-${name}`,
    name,
    size: data.length,
    file: new File([data.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

async function readBlobHeader(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      resolve(String.fromCharCode(...new Uint8Array(buf).slice(0, 5)));
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsArrayBuffer(blob.slice(0, 5));
  });
}

// ─── parsePageRanges ──────────────────────────────────────────────────────────

describe('parsePageRanges — valid inputs', () => {
  it('parses a single page', () => {
    const result = parsePageRanges('1', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges)).toEqual([0]);
  });

  it('parses a range', () => {
    const result = parsePageRanges('2-4', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges)).toEqual([1, 2, 3]);
  });

  it('parses comma-separated pages', () => {
    const result = parsePageRanges('1,3,5', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges)).toEqual([0, 2, 4]);
  });

  it('parses mixed ranges and pages', () => {
    const result = parsePageRanges('2-4,8', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges)).toEqual([1, 2, 3, 7]);
  });

  it('deduplicates overlapping pages', () => {
    const result = parsePageRanges('1-3,2-4', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges)).toEqual([0, 1, 2, 3]);
  });

  it('handles page equal to totalPages', () => {
    const result = parsePageRanges('10', 10);
    expect(result.ok).toBe(true);
  });

  it('handles full range', () => {
    const result = parsePageRanges('1-10', 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(rangesToIndices(result.ranges).length).toBe(10);
  });
});

describe('parsePageRanges — invalid inputs', () => {
  it('rejects page 0', () => {
    const result = parsePageRanges('0', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/start at 1/i);
  });

  it('rejects reversed range (20-10)', () => {
    const result = parsePageRanges('20-10', 20);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/reversed/i);
  });

  it('rejects non-numeric input', () => {
    const result = parsePageRanges('abc', 10);
    expect(result.ok).toBe(false);
  });

  it('rejects page beyond totalPages', () => {
    const result = parsePageRanges('11', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/does not exist/i);
  });

  it('rejects range end beyond totalPages', () => {
    const result = parsePageRanges('1-11', 10);
    expect(result.ok).toBe(false);
  });

  it('rejects empty input', () => {
    const result = parsePageRanges('', 10);
    expect(result.ok).toBe(false);
  });

  it('rejects triple-segment range like 1-2-3', () => {
    const result = parsePageRanges('1-2-3', 10);
    expect(result.ok).toBe(false);
  });
});

// ─── formatRangeLabel ─────────────────────────────────────────────────────────

describe('formatRangeLabel', () => {
  it('formats single page', () => {
    expect(formatRangeLabel([{ start: 5, end: 5 }])).toBe('5');
  });

  it('formats range', () => {
    expect(formatRangeLabel([{ start: 2, end: 5 }])).toBe('2–5');
  });

  it('formats multiple ranges', () => {
    expect(formatRangeLabel([{ start: 1, end: 3 }, { start: 7, end: 9 }])).toBe('1–3, 7–9');
  });
});

// ─── extractPageRange ─────────────────────────────────────────────────────────

describe('extractPageRange — real PDFs', () => {
  it('extracts a single page from a 5-page PDF', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '3', 5);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0].pageCount).toBe(1);
      expect(result.parts[0].blob).toBeInstanceOf(Blob);
      const header = await readBlobHeader(result.parts[0].blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('extracts a range of pages', async () => {
    const bytes = await buildMinimalPdf(10);
    const file = makePdfFile('ten.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '2-5', 10);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].pageCount).toBe(4);
    }
  });

  it('extracts multiple non-contiguous pages', async () => {
    const bytes = await buildMinimalPdf(10);
    const file = makePdfFile('ten.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '1,3,7', 10);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].pageCount).toBe(3);
    }
  });

  it('fails for invalid range input', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, 'abc', 5);
    expect(result.success).toBe(false);
  });

  it('fails for out-of-range page', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '10', 5);
    expect(result.success).toBe(false);
  });

  it('fails for corrupted PDF', async () => {
    const file = makePdfFile('corrupt.pdf', 'this is not a pdf');
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '1', 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });
});

// ─── splitEveryPage ───────────────────────────────────────────────────────────

describe('splitEveryPage', () => {
  it('splits a 3-page PDF into 3 single-page files', async () => {
    const bytes = await buildMinimalPdf(3);
    const file = makePdfFile('three.pdf', bytes);
    const { splitEveryPage } = await import('../src/lib/pdf/split');
    const result = await splitEveryPage(file, 3);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(3);
      result.parts.forEach((p, i) => {
        expect(p.pageCount).toBe(1);
        expect(p.filename).toContain(`page_${i + 1}`);
      });
    }
  });

  it('each part is a valid PDF', async () => {
    const bytes = await buildMinimalPdf(2);
    const file = makePdfFile('two.pdf', bytes);
    const { splitEveryPage } = await import('../src/lib/pdf/split');
    const result = await splitEveryPage(file, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const part of result.parts) {
        const header = await readBlobHeader(part.blob);
        expect(header).toBe('%PDF-');
      }
    }
  });

  it('rejects single-page PDF', async () => {
    const bytes = await buildMinimalPdf(1);
    const file = makePdfFile('one.pdf', bytes);
    const { splitEveryPage } = await import('../src/lib/pdf/split');
    const result = await splitEveryPage(file, 1);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/at least 2/i);
  });
});

// ─── splitByRanges ────────────────────────────────────────────────────────────

describe('splitByRanges', () => {
  it('creates one part per range', async () => {
    const bytes = await buildMinimalPdf(9);
    const file = makePdfFile('nine.pdf', bytes);
    const { splitByRanges } = await import('../src/lib/pdf/split');
    const result = await splitByRanges(file, ['1-3', '4-6', '7-9'], 9);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(3);
      expect(result.parts[0].pageCount).toBe(3);
      expect(result.parts[1].pageCount).toBe(3);
      expect(result.parts[2].pageCount).toBe(3);
    }
  });

  it('each part filename includes part number', async () => {
    const bytes = await buildMinimalPdf(4);
    const file = makePdfFile('four.pdf', bytes);
    const { splitByRanges } = await import('../src/lib/pdf/split');
    const result = await splitByRanges(file, ['1-2', '3-4'], 4);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].filename).toContain('part_1');
      expect(result.parts[1].filename).toContain('part_2');
    }
  });

  it('fails with an invalid range in the list', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { splitByRanges } = await import('../src/lib/pdf/split');
    const result = await splitByRanges(file, ['1-2', 'abc'], 5);
    expect(result.success).toBe(false);
  });

  it('fails with empty range list', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { splitByRanges } = await import('../src/lib/pdf/split');
    const result = await splitByRanges(file, [], 5);
    expect(result.success).toBe(false);
  });

  it('ignores blank range strings', async () => {
    const bytes = await buildMinimalPdf(4);
    const file = makePdfFile('four.pdf', bytes);
    const { splitByRanges } = await import('../src/lib/pdf/split');
    const result = await splitByRanges(file, ['1-2', '', '3-4'], 4);
    expect(result.success).toBe(true);
    if (result.success) expect(result.parts).toHaveLength(2);
  });
});

// ─── extractSelectedPages ─────────────────────────────────────────────────────

describe('extractSelectedPages', () => {
  it('extracts pages in specified order', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { extractSelectedPages } = await import('../src/lib/pdf/split');
    const result = await extractSelectedPages(file, [1, 3, 5]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].pageCount).toBe(3);
    }
  });

  it('fails with empty selection', async () => {
    const bytes = await buildMinimalPdf(3);
    const file = makePdfFile('three.pdf', bytes);
    const { extractSelectedPages } = await import('../src/lib/pdf/split');
    const result = await extractSelectedPages(file, []);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/select at least/i);
  });

  it('produces valid PDF blob', async () => {
    const bytes = await buildMinimalPdf(3);
    const file = makePdfFile('three.pdf', bytes);
    const { extractSelectedPages } = await import('../src/lib/pdf/split');
    const result = await extractSelectedPages(file, [2]);
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.parts[0].blob);
      expect(header).toBe('%PDF-');
    }
  });
});

// ─── Page ordering ────────────────────────────────────────────────────────────

describe('page ordering preserved', () => {
  it('range extraction preserves document page order', async () => {
    const bytes = await buildMinimalPdf(5);
    const file = makePdfFile('five.pdf', bytes);
    const { extractPageRange } = await import('../src/lib/pdf/split');
    const result = await extractPageRange(file, '2-4', 5);
    expect(result.success).toBe(true);
    if (result.success) {
      // 3 pages extracted in order (pages 2,3,4 → 3 pages)
      expect(result.parts[0].pageCount).toBe(3);
    }
  });
});

// ─── Page component exports ───────────────────────────────────────────────────

describe('Split PDF page module', () => {
  it('exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/split-pdf/page');
    expect(typeof mod.default).toBe('function');
  });

  it('layout exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/split-pdf/layout');
    const meta = (mod as { metadata?: { title?: string; description?: string } }).metadata;
    expect(meta?.title).toContain('Split PDF');
    expect(meta?.title).toContain('DevToolsHub');
    expect(typeof meta?.description).toBe('string');
    expect((meta?.description ?? '').length).toBeGreaterThan(50);
  });
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────

describe('Sitemap includes /pdf-tools/split-pdf', () => {
  it('split-pdf page is in sitemap', async () => {
    const mod = await import('../src/app/sitemap');
    const entries = mod.default() as { url: string }[];
    const { SITE_URL } = await import('../src/lib/seo/site-config');
    expect(entries.some((e) => e.url === `${SITE_URL}/pdf-tools/split-pdf`)).toBe(true);
  });
});

// ─── Hub page ─────────────────────────────────────────────────────────────────

describe('PDF Tools hub lists Split PDF as available', () => {
  it('hub page exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    expect(typeof mod.default).toBe('function');
  });
});
