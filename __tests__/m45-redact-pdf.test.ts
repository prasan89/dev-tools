/**
 * M45 — Secure PDF Redaction tests
 */

import {
  addRedactionRect,
  removeRedactionRect,
  buildRedactedPdf,
} from '../src/lib/pdf/redactPdf';
import type { RedactionRect } from '../src/lib/pdf/redactPdf';
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

function makeRect(id: string, pageIndex = 0): RedactionRect {
  return { id, pageIndex, x: 50, y: 100, width: 200, height: 30 };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawRectangle = jest.fn();
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockPage = { drawRectangle: mockDrawRectangle, getSize: mockGetSize };
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(2),
  getPage: jest.fn().mockReturnValue(mockPage),
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
  };
  return {
    PDFDocument,
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    __throwOnLoad: (msg: string) => {
      _throw = msg;
      PDFDocument.load = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetLoad: () => {
      _throw = null;
      PDFDocument.load = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockDoc.getPageCount.mockReturnValue(2);
  mockDoc.getPage.mockReturnValue(mockPage);
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── addRedactionRect ─────────────────────────────────────────────────────────

describe('addRedactionRect', () => {
  it('adds rect to empty array', () => {
    const result = addRedactionRect([], makeRect('r1'));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('appends to existing rects', () => {
    const existing = [makeRect('r1')];
    const result = addRedactionRect(existing, makeRect('r2'));
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('r2');
  });

  it('does not mutate original array', () => {
    const original = [makeRect('r1')];
    addRedactionRect(original, makeRect('r2'));
    expect(original).toHaveLength(1);
  });
});

// ─── removeRedactionRect ──────────────────────────────────────────────────────

describe('removeRedactionRect', () => {
  it('removes rect by id', () => {
    const rects = [makeRect('r1'), makeRect('r2')];
    const result = removeRedactionRect(rects, 'r1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });

  it('returns same array if id not found', () => {
    const rects = [makeRect('r1')];
    const result = removeRedactionRect(rects, 'unknown');
    expect(result).toHaveLength(1);
  });

  it('returns empty array when last rect removed', () => {
    const rects = [makeRect('r1')];
    const result = removeRedactionRect(rects, 'r1');
    expect(result).toHaveLength(0);
  });
});

// ─── buildRedactedPdf ─────────────────────────────────────────────────────────

describe('buildRedactedPdf', () => {
  it('returns error when rects is empty', async () => {
    const result = await buildRedactedPdf(makePdfFile(), []);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no redactions/i);
  });

  it('returns success with output blob for single rect', async () => {
    const result = await buildRedactedPdf(makePdfFile(), [makeRect('r1')]);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toBe('doc_redacted.pdf');
  });

  it('calls drawRectangle for each rect', async () => {
    const rects = [makeRect('r1', 0), makeRect('r2', 1)];
    await buildRedactedPdf(makePdfFile(), rects);
    expect(mockDrawRectangle).toHaveBeenCalledTimes(2);
  });

  it('calls drawRectangle with black color and opacity 1', async () => {
    await buildRedactedPdf(makePdfFile(), [makeRect('r1')]);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.opacity).toBe(1);
    expect(call.borderWidth).toBe(0);
  });

  it('calls getPage with correct pageIndex', async () => {
    await buildRedactedPdf(makePdfFile(), [makeRect('r1', 0), makeRect('r2', 1)]);
    expect(mockDoc.getPage).toHaveBeenCalledWith(0);
    expect(mockDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('skips rects with out-of-range pageIndex', async () => {
    const rects = [makeRect('r1', 0), makeRect('r_oor', 99)];
    const result = await buildRedactedPdf(makePdfFile(), rects);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).toHaveBeenCalledTimes(1);
  });

  it('output filename contains _redacted', async () => {
    const result = await buildRedactedPdf(makePdfFile('report.pdf'), [makeRect('r1')]);
    expect(result.outputFile!.filename).toBe('report_redacted.pdf');
  });

  it('output blob type is application/pdf', async () => {
    const result = await buildRedactedPdf(makePdfFile(), [makeRect('r1')]);
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('returns failure when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupt pdf');
    const result = await buildRedactedPdf(makePdfFile(), [makeRect('r1')]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupt pdf/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('redact-pdf layout metadata', () => {
  it('title contains redact PDF', async () => {
    const mod = await import('../src/app/pdf-tools/redact-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/redact.+pdf/i);
  });

  it('has redaction-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/redact-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/redact pdf|pdf redaction|black out/);
  });

  it('canonical url contains redact-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/redact-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('redact-pdf');
  });
});
