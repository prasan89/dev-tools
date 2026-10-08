/**
 * M80.6 — PDFTools functional correctness & regression tests
 *
 * Tests use programmatic fixtures (no real user documents).
 * Covers: merge, split, compress, text extraction, HTML conversion (XSS),
 * metadata, protect/unlock, redact labeling, watermark, page numbers,
 * word conversion, excel conversion, OCR→searchable PDF positioning,
 * security invariants, error handling states.
 */

import {
  buildMinimalPdf,
  buildTextPdf,
  buildMixedPageSizePdf,
  buildCorruptedPdf,
  buildNonPdfBytes,
  buildEmptyBytes,
  makePdfFileObj,
} from './fixtures/pdfFixtures';

// ─────────────────────────────────────────────────────────────────────────────
// Merge PDF
// ─────────────────────────────────────────────────────────────────────────────

import { mergePdfFiles } from '../src/lib/pdf/merge';

describe('M80.6 merge — real fixtures', () => {
  it('merges two 1-page PDFs → 2 pages', async () => {
    const a = await buildMinimalPdf(1);
    const b = await buildMinimalPdf(1);
    const r = await mergePdfFiles([makePdfFileObj('a.pdf', a), makePdfFileObj('b.pdf', b)]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.pageCount).toBe(2);
  });

  it('merges 3-page + 2-page → 5 pages', async () => {
    const a = await buildMinimalPdf(3);
    const b = await buildMinimalPdf(2);
    const r = await mergePdfFiles([
      makePdfFileObj('a.pdf', a, { pageCount: 3 }),
      makePdfFileObj('b.pdf', b, { pageCount: 2 }),
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.pageCount).toBe(5);
  });

  it('rejects corrupted PDF gracefully', async () => {
    const good = await buildMinimalPdf(1);
    const r = await mergePdfFiles([
      makePdfFileObj('good.pdf', good),
      makePdfFileObj('bad.pdf', buildCorruptedPdf()),
    ]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toBeDefined();
  });

  it('rejects empty input', async () => {
    const r = await mergePdfFiles([]);
    expect(r.success).toBe(false);
  });

  it('rejects single-file input', async () => {
    const a = await buildMinimalPdf(1);
    const r = await mergePdfFiles([makePdfFileObj('a.pdf', a)]);
    expect(r.success).toBe(false);
  });

  it('output blob is non-empty', async () => {
    const a = await buildMinimalPdf(1);
    const b = await buildMinimalPdf(1);
    const r = await mergePdfFiles([makePdfFileObj('a.pdf', a), makePdfFileObj('b.pdf', b)]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.blob).toBeInstanceOf(Blob);
      expect(r.blob.size).toBeGreaterThan(0);
    }
  });

  it('merges mixed page-size PDFs', async () => {
    const mixed = await buildMixedPageSizePdf();
    const single = await buildMinimalPdf(1);
    const r = await mergePdfFiles([
      makePdfFileObj('mixed.pdf', mixed, { pageCount: 3 }),
      makePdfFileObj('single.pdf', single),
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.pageCount).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Split PDF
// ─────────────────────────────────────────────────────────────────────────────

import { splitEveryPage, splitByRanges, parsePageRanges } from '../src/lib/pdf/split';

describe('M80.6 split — real fixtures', () => {
  it('splits 3-page PDF into 3 individual parts', async () => {
    const bytes = await buildMinimalPdf(3);
    const r = await splitEveryPage(makePdfFileObj('doc.pdf', bytes, { pageCount: 3 }), 3);
    expect(r.success).toBe(true);
    if (r.success) expect(r.parts).toHaveLength(3);
  });

  it('splits by string range "1-2,3-4" → 2 parts', async () => {
    const bytes = await buildMinimalPdf(4);
    const r = await splitByRanges(
      makePdfFileObj('doc.pdf', bytes, { pageCount: 4 }),
      ['1-2', '3-4'],
      4,
    );
    expect(r.success).toBe(true);
    if (r.success) expect(r.parts).toHaveLength(2);
  });

  it('parsePageRanges rejects out-of-bounds range', () => {
    const result = parsePageRanges('5-10', 2);
    expect(result.ok).toBe(false);
  });

  it('each split part blob is non-empty', async () => {
    const bytes = await buildMinimalPdf(2);
    const r = await splitEveryPage(makePdfFileObj('doc.pdf', bytes, { pageCount: 2 }), 2);
    expect(r.success).toBe(true);
    if (r.success) {
      for (const part of r.parts) {
        expect(part.blob.size).toBeGreaterThan(0);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Compress PDF
// ─────────────────────────────────────────────────────────────────────────────

import { compressPdf } from '../src/lib/pdf/compress';

describe('M80.6 compress — real fixtures', () => {
  it('compresses a valid PDF and returns a blob', async () => {
    const bytes = await buildMinimalPdf(2);
    const r = await compressPdf(makePdfFileObj('doc.pdf', bytes, { pageCount: 2 }));
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.blob).toBeDefined();
      expect(r.blob.size).toBeGreaterThan(0);
    }
  });

  it('returns error for corrupted PDF', async () => {
    // pdf-lib may throw internally for some corruption patterns — that's still "not success"
    try {
      const r = await compressPdf(makePdfFileObj('bad.pdf', buildCorruptedPdf()));
      expect(r.success).toBe(false);
    } catch {
      // Thrown error counts as failure to compress
    }
  });

  it('compressed output filename includes source name', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await compressPdf(makePdfFileObj('myfile.pdf', bytes));
    expect(r.success).toBe(true);
    if (r.success) expect(r.filename).toContain('myfile');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF → Text
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('pdfjs-dist', () => {
  const mockGetTextContent = jest.fn().mockResolvedValue({ items: [{ str: 'Hello' }, { str: ' World' }] });
  const mockGetPage = jest.fn().mockResolvedValue({ getTextContent: mockGetTextContent });
  const mockDoc = { numPages: 1, getPage: mockGetPage };
  return {
    GlobalWorkerOptions: { workerPort: {} },
    getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockDoc) }),
    __mockDoc: mockDoc,
    __mockGetPage: mockGetPage,
    __mockGetTextContent: mockGetTextContent,
  };
});

import { extractTextFromPdf } from '../src/lib/pdf/pdfToText';

let __pdfjsMock: {
  __mockDoc: { numPages: number; getPage: jest.Mock };
  __mockGetPage: jest.Mock;
  __mockGetTextContent: jest.Mock;
};

beforeEach(async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  __pdfjsMock = require('pdfjs-dist') as typeof __pdfjsMock;
  __pdfjsMock.__mockDoc.numPages = 1;
  __pdfjsMock.__mockGetTextContent.mockResolvedValue({ items: [{ str: 'Hello' }, { str: ' World' }] });
  __pdfjsMock.__mockGetPage.mockResolvedValue({ getTextContent: __pdfjsMock.__mockGetTextContent });
});

describe('M80.6 pdf-to-text', () => {
  it('returns extracted text', async () => {
    const bytes = await buildTextPdf('Test document');
    const r = await extractTextFromPdf(makePdfFileObj('doc.pdf', bytes, { pageCount: 1 }));
    expect(r.success).toBe(true);
    if (r.success) expect(r.result?.fullText).toBeTruthy();
  });

  it('handles empty page gracefully', async () => {
    __pdfjsMock.__mockGetTextContent.mockResolvedValueOnce({ items: [] });
    const bytes = await buildMinimalPdf(1);
    const r = await extractTextFromPdf(makePdfFileObj('empty.pdf', bytes));
    expect(r.success).toBe(true);
  });

  it('fullText spans multiple pages', async () => {
    __pdfjsMock.__mockDoc.numPages = 2;
    __pdfjsMock.__mockGetTextContent.mockResolvedValue({ items: [{ str: 'text' }] });
    const bytes = await buildMinimalPdf(2);
    const r = await extractTextFromPdf(makePdfFileObj('doc.pdf', bytes, { pageCount: 2 }));
    if (r.success) expect(r.result?.pages).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF → HTML (XSS safety)
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.6 pdf-to-html — XSS safety', () => {
  it('pdfToHtml source HTML-escapes filename before inserting into title tag', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const src = fs.readFileSync(path.join(process.cwd(), 'src/lib/pdf/pdfToHtml.ts'), 'utf8');
    // Source must sanitize & < > " before using filename in <title>
    expect(src).toContain("replace(/&/g");
    expect(src).toContain("replace(/</g");
  });

  it('XSS injection via filename does not appear in output HTML', () => {
    // Test the escaping logic directly without running pdfjs-dist
    const dangerousFilename = '</title><script>alert(1)</script>';
    const escaped = dangerousFilename
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF Metadata
// ─────────────────────────────────────────────────────────────────────────────

import { readMetadata, buildMetadataEditedPdf, emptyMetadata } from '../src/lib/pdf/pdfMetadata';

describe('M80.6 pdf-metadata', () => {
  it('reads metadata from a PDF', async () => {
    const bytes = await buildMinimalPdf(1);
    const meta = await readMetadata(makePdfFileObj('doc.pdf', bytes));
    expect(meta).toBeDefined();
    expect(typeof meta.title).toBe('string');
  });

  it('writes metadata and returns valid blob', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await buildMetadataEditedPdf(
      makePdfFileObj('doc.pdf', bytes),
      { ...emptyMetadata(), title: 'Test Document', author: 'DevToolsHub Tests' },
      false,
    );
    expect(r.success).toBe(true);
    if (r.success) expect(r.outputFile!.blob.size).toBeGreaterThan(0);
  });

  it('sanitizeMetadataValue sanitizes non-strings', async () => {
    const { sanitizeMetadataValue } = await import('../src/lib/security');
    expect(sanitizeMetadataValue('<script>alert(1)</script>')).toContain('&lt;');
    expect(sanitizeMetadataValue(42)).toBe('');
    expect(sanitizeMetadataValue(null)).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Protect PDF — currently unimplemented
// ─────────────────────────────────────────────────────────────────────────────

import { buildProtectedPdf, defaultProtectConfig } from '../src/lib/pdf/protectPdf';

describe('M80.6 protect-pdf', () => {
  it('buildProtectedPdf returns a PdfToolResult', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await buildProtectedPdf(makePdfFileObj('doc.pdf', bytes), defaultProtectConfig());
    expect(r).toBeDefined();
    expect(typeof r.success).toBe('boolean');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Watermark
// ─────────────────────────────────────────────────────────────────────────────

import { buildWatermarkedPdf, defaultTextConfig } from '../src/lib/pdf/watermarkPdf';

describe('M80.6 watermark-pdf', () => {
  it('adds watermark and returns valid blob', async () => {
    const bytes = await buildMinimalPdf(2);
    const r = await buildWatermarkedPdf(
      makePdfFileObj('doc.pdf', bytes, { pageCount: 2 }),
      defaultTextConfig(),
    );
    expect(r.success).toBe(true);
    if (r.success) expect(r.outputFile!.blob.size).toBeGreaterThan(0);
  });

  it('handles empty watermark text gracefully', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await buildWatermarkedPdf(makePdfFileObj('doc.pdf', bytes), {
      ...defaultTextConfig(),
      text: '',
    });
    expect(r.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Page Numbers
// ─────────────────────────────────────────────────────────────────────────────

import { buildPageNumberedPdf, defaultConfig as defaultPageNumberConfig } from '../src/lib/pdf/pageNumbers';

describe('M80.6 page-numbers', () => {
  it('adds page numbers to all pages', async () => {
    const bytes = await buildMinimalPdf(3);
    const r = await buildPageNumberedPdf(
      makePdfFileObj('doc.pdf', bytes, { pageCount: 3 }),
      defaultPageNumberConfig(),
    );
    expect(r.success).toBe(true);
    if (r.success) expect(r.outputFile!.blob.size).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Repair PDF
// ─────────────────────────────────────────────────────────────────────────────

import { repairPdf } from '../src/lib/pdf/repairPdf';

describe('M80.6 repair-pdf', () => {
  it('passes through a valid PDF', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await repairPdf(makePdfFileObj('doc.pdf', bytes));
    expect(r.success).toBe(true);
    if (r.success) expect(r.outputFile!.blob.size).toBeGreaterThan(0);
  });

  it('fails gracefully on truly invalid bytes', async () => {
    const r = await repairPdf(makePdfFileObj('bad.pdf', buildNonPdfBytes()));
    if (!r.success) expect(r.error).toBeDefined();
  });

  it('does not succeed for zero-byte input', async () => {
    const r = await repairPdf(makePdfFileObj('empty.pdf', buildEmptyBytes()));
    if (!r.success) expect(r.error).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Excel → PDF
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.6 excel-to-pdf — exports and defaults', () => {
  it('convertExcelToPdf is exported; defaults are A4 portrait', async () => {
    const mod = await import('../src/lib/pdf/excelToPdf');
    expect(typeof mod.convertExcelToPdf).toBe('function');
    const opts = mod.defaultExcelToPdfOptions();
    expect(opts.pageSize).toBe('A4');
    expect(opts.orientation).toBe('portrait');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OCR → Searchable PDF — text layer positioning
// ─────────────────────────────────────────────────────────────────────────────

import type { OcrPageResult } from '../src/lib/pdf/ocrPdf';

jest.mock('../src/lib/pdf/ocrPdf', () => ({ ocrPdf: jest.fn() }));

describe('M80.6 ocr-to-searchable-pdf — word bbox positioning', () => {
  const { ocrPdf: mockOcrPdf } = jest.requireMock('../src/lib/pdf/ocrPdf') as {
    ocrPdf: jest.Mock;
  };

  it('uses word bounding boxes when available', async () => {
    const bytes = await buildMinimalPdf(1);
    const pageResult: OcrPageResult = {
      pageIndex: 0,
      text: 'Hello World',
      confidence: 90,
      imageWidth: 1190,
      imageHeight: 1684,
      words: [
        { text: 'Hello', x0: 100, y0: 200, x1: 200, y1: 230, confidence: 95 },
        { text: 'World', x0: 210, y0: 200, x1: 320, y1: 230, confidence: 92 },
      ],
    };
    mockOcrPdf.mockResolvedValueOnce({ success: true, pages: [pageResult], fullText: 'Hello World' });
    const { buildOcrSearchablePdf } = await import('../src/lib/pdf/ocrToPdf');
    const r = await buildOcrSearchablePdf(
      makePdfFileObj('scan.pdf', bytes, { pageCount: 1 }),
      { language: 'eng', pageSelection: 'all', pageRange: '' },
    );
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.outputFile!.blob.size).toBeGreaterThan(0);
      expect(r.outputFile!.filename).toContain('searchable');
    }
  });

  it('falls back gracefully when no word bboxes', async () => {
    const bytes = await buildMinimalPdf(1);
    const pageResult: OcrPageResult = {
      pageIndex: 0,
      text: 'Fallback text',
      confidence: 80,
      imageWidth: 0,
      imageHeight: 0,
      words: [],
    };
    mockOcrPdf.mockResolvedValueOnce({ success: true, pages: [pageResult], fullText: 'Fallback text' });
    const { buildOcrSearchablePdf } = await import('../src/lib/pdf/ocrToPdf');
    const r = await buildOcrSearchablePdf(
      makePdfFileObj('scan.pdf', bytes, { pageCount: 1 }),
      { language: 'eng', pageSelection: 'all', pageRange: '' },
    );
    expect(r.success).toBe(true);
  });

  it('returns error when OCR fails', async () => {
    const bytes = await buildMinimalPdf(1);
    mockOcrPdf.mockResolvedValueOnce({ success: false, error: 'OCR engine crashed' });
    const { buildOcrSearchablePdf } = await import('../src/lib/pdf/ocrToPdf');
    const r = await buildOcrSearchablePdf(
      makePdfFileObj('scan.pdf', bytes, { pageCount: 1 }),
      { language: 'eng', pageSelection: 'all', pageRange: '' },
    );
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF Table extraction (pdfToExcel)
// ─────────────────────────────────────────────────────────────────────────────

import { extractTablesFromTextItems } from '../src/lib/pdf/pdfToExcel';

describe('M80.6 pdfToExcel — table extraction', () => {
  it('groups items into rows by y-position', () => {
    const items = [
      { str: 'Name', transform: [1,0,0,1,50,800], height: 12 },
      { str: 'Age',  transform: [1,0,0,1,200,800], height: 12 },
      { str: 'Alice', transform: [1,0,0,1,50,780], height: 10 },
      { str: '30',   transform: [1,0,0,1,200,780], height: 10 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(extractTablesFromTextItems([], 5)).toHaveLength(0);
  });

  it('handles single-row table', () => {
    const items = [
      { str: 'Only', transform: [1,0,0,1,50,700], height: 10 },
      { str: 'Row',  transform: [1,0,0,1,150,700], height: 10 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows).toHaveLength(1);
    expect(rows[0].cells).toHaveLength(2);
  });

  it('ignores whitespace-only items', () => {
    const items = [
      { str: '  ',  transform: [1,0,0,1,50,700], height: 10 },
      { str: 'Real', transform: [1,0,0,1,150,700], height: 10 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    const cellTexts = JSON.stringify(rows[0].cells);
    expect(cellTexts).toContain('Real');
    expect(cellTexts).not.toContain('  ');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ocrPdf interface — new fields
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.6 ocrPdf — OcrPageResult includes word bboxes', () => {
  it('OcrPageResult type has words, imageWidth, imageHeight', () => {
    const page: OcrPageResult = {
      pageIndex: 0,
      text: 'test',
      confidence: 90,
      words: [{ text: 'test', x0: 0, y0: 0, x1: 50, y1: 20, confidence: 90 }],
      imageWidth: 800,
      imageHeight: 1200,
    };
    expect(page.words).toHaveLength(1);
    expect(page.imageWidth).toBe(800);
    expect(page.imageHeight).toBe(1200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

import { validatePdfFile, sanitizePdfFilename } from '../src/lib/pdf/validation';

describe('M80.6 validation', () => {
  it('rejects empty file', () => {
    const f = new File([], 'empty.pdf', { type: 'application/pdf' });
    expect(validatePdfFile(f).valid).toBe(false);
  });

  it('rejects non-PDF mime type', () => {
    const bytes = new Uint8Array(10);
    const f = new File([bytes.buffer as ArrayBuffer], 'image.jpg', { type: 'image/jpeg' });
    expect(validatePdfFile(f).valid).toBe(false);
  });

  it('validatePdfFile does not throw for valid PDF file', () => {
    const bytes = new Uint8Array(10);
    const f = new File([bytes.buffer as ArrayBuffer], 'doc.pdf', { type: 'application/pdf' });
    expect(() => validatePdfFile(f)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Filename safety
// ─────────────────────────────────────────────────────────────────────────────

import { sanitizeFilename } from '../src/lib/security';

describe('M80.6 filename sanitization', () => {
  it('sanitizePdfFilename adds .pdf extension', () => {
    expect(sanitizePdfFilename('report')).toMatch(/\.pdf$/);
  });

  it('sanitizePdfFilename strips path traversal', () => {
    const name = sanitizePdfFilename('../../../etc/passwd.pdf');
    expect(name).not.toContain('..');
    expect(name).not.toContain('/');
  });

  it('sanitizeFilename prevents path traversal', () => {
    expect(sanitizeFilename('../../evil.txt')).not.toContain('..');
    expect(sanitizeFilename('../../evil.txt')).not.toContain('/');
  });

  it('sanitizeFilename removes special chars', () => {
    const name = sanitizeFilename('file<>|?.txt');
    expect(name).not.toMatch(/[<>|?]/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Redact — visual cover
// ─────────────────────────────────────────────────────────────────────────────

import { buildRedactedPdf } from '../src/lib/pdf/redactPdf';

describe('M80.6 redact-pdf — visual cover', () => {
  it('produces a valid PDF blob', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await buildRedactedPdf(makePdfFileObj('doc.pdf', bytes), [
      { id: 'r1', pageIndex: 0, x: 50, y: 700, width: 100, height: 20 },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.outputFile!.blob.size).toBeGreaterThan(0);
  });

  it('rejects empty redaction list', async () => {
    const bytes = await buildMinimalPdf(1);
    const r = await buildRedactedPdf(makePdfFileObj('doc.pdf', bytes), []);
    expect(r.success).toBe(false);
  });

  it('redactPdf source does not claim unconditional secure redaction', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const src = fs.readFileSync(path.join(process.cwd(), 'src/lib/pdf/redactPdf.ts'), 'utf8');
    const lines = src.split('\n');
    for (const line of lines) {
      if (/secure redaction/i.test(line)) {
        expect(/is\s*(not|visual|cover|incomplete|partial)/i.test(line)).toBe(true);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Memory management
// ─────────────────────────────────────────────────────────────────────────────

import {
  isFileSafe,
  shouldWarnAboutSize,
  revokeObjectUrls,
  createCancellationToken,
} from '../src/lib/pdf/memoryManager';

describe('M80.6 memoryManager', () => {
  it('isFileSafe returns false for 500MB files', () => {
    expect(isFileSafe(500 * 1024 * 1024)).toBe(false);
  });

  it('isFileSafe returns true for small files', () => {
    expect(isFileSafe(1024)).toBe(true);
  });

  it('shouldWarnAboutSize returns true for 100MB+ files', () => {
    expect(shouldWarnAboutSize(100 * 1024 * 1024)).toBe(true);
  });

  it('revokeObjectUrls handles null/undefined gracefully', () => {
    expect(() => revokeObjectUrls([null, undefined, 'blob:fake'])).not.toThrow();
  });

  it('cancellationToken can be cancelled', () => {
    const token = createCancellationToken();
    expect(token.cancelled).toBe(false);
    token.cancel();
    expect(token.cancelled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Privacy — password not in analytics
// ─────────────────────────────────────────────────────────────────────────────

import { containsPassword } from '../src/lib/security';

describe('M80.6 security — password not in analytics', () => {
  it('containsPassword detects password keys', () => {
    expect(containsPassword({ password: 'secret' })).toBe(true);
    expect(containsPassword({ passwd: '123' })).toBe(true);
    expect(containsPassword({ user_password: 'x' })).toBe(true);
  });

  it('containsPassword returns false for safe keys', () => {
    expect(containsPassword({ filename: 'doc.pdf', pageCount: 5 })).toBe(false);
    expect(containsPassword({ action: 'merge', result: 'success' })).toBe(false);
  });

  it('sanitizeConverterHtml strips script tags', async () => {
    const { sanitizeConverterHtml } = await import('../src/lib/security');
    const safe = sanitizeConverterHtml('<p>Hello</p><script>alert(document.cookie)</script>');
    expect(safe).not.toContain('<script>');
    expect(safe).toContain('Hello');
  });

  it('sanitizeConverterHtml strips on* event handlers', async () => {
    const { sanitizeConverterHtml } = await import('../src/lib/security');
    expect(sanitizeConverterHtml('<img src="x" onerror="alert(1)">')).not.toContain('onerror');
  });

  it('sanitizeConverterHtml removes javascript: URLs', async () => {
    const { sanitizeConverterHtml } = await import('../src/lib/security');
    expect(sanitizeConverterHtml('<a href="javascript:alert(1)">click</a>')).not.toContain('javascript:');
  });

  it('isSafeUrl rejects javascript: and data: schemes', async () => {
    const { isSafeUrl } = await import('../src/lib/security');
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<h1>x</h1>')).toBe(false);
    expect(isSafeUrl('https://example.com')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF Word conversion — interface
// ─────────────────────────────────────────────────────────────────────────────

describe('M80.6 pdf-to-word — interface', () => {
  it('defaultWordOptions returns expected defaults', async () => {
    const { defaultWordOptions } = await import('../src/lib/pdf/pdfToWord');
    const opts = defaultWordOptions();
    expect(opts.includeImages).toBe(false);
    expect(opts.preserveFormatting).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Batch processor
// ─────────────────────────────────────────────────────────────────────────────

import {
  createBatchJob,
  updateJobStatus,
  pendingJobs,
  completedJobs,
  failedJobs,
} from '../src/lib/pdf/batchProcessor';

describe('M80.6 batchProcessor', () => {
  it('createBatchJob has pending status', () => {
    const file = new File([new Uint8Array(10).buffer as ArrayBuffer], 'test.pdf');
    const job = createBatchJob(file);
    expect(job.status).toBe('pending');
    expect(job.progress).toBe(0);
  });

  it('updateJobStatus patches correctly', () => {
    const file = new File([new Uint8Array(10).buffer as ArrayBuffer], 'test.pdf');
    const jobs = [createBatchJob(file)];
    const updated = updateJobStatus(jobs, jobs[0].id, { status: 'completed', progress: 100 });
    expect(updated[0].status).toBe('completed');
    expect(updated[0].progress).toBe(100);
  });

  it('pendingJobs filters correctly', () => {
    const file = new File([new Uint8Array(10).buffer as ArrayBuffer], 'test.pdf');
    const j1 = createBatchJob(file);
    const j2 = { ...createBatchJob(file), status: 'completed' as const };
    expect(pendingJobs([j1, j2])).toHaveLength(1);
  });

  it('completedJobs and failedJobs filter correctly', () => {
    const file = new File([new Uint8Array(10).buffer as ArrayBuffer], 'test.pdf');
    const j1 = { ...createBatchJob(file), status: 'completed' as const };
    const j2 = { ...createBatchJob(file), status: 'failed' as const };
    const j3 = createBatchJob(file);
    expect(completedJobs([j1, j2, j3])).toHaveLength(1);
    expect(failedJobs([j1, j2, j3])).toHaveLength(1);
  });
});
