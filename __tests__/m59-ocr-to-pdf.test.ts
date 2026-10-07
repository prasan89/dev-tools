/**
 * M59 — OCR to Searchable PDF tests
 */

import { defaultOcrPdfOptions, buildOcrSearchablePdf } from '../src/lib/pdf/ocrToPdf';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'scan.pdf', pageCount = 2): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockPage = { drawText: mockDrawText, getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }) };
const mockEmbedFont = jest.fn().mockResolvedValue({});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(2),
  getPage: jest.fn().mockReturnValue(mockPage),
  embedFont: mockEmbedFont,
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
    rgb: jest.fn().mockReturnValue({}),
    degrees: jest.fn((n: number) => n),
    StandardFonts: { Helvetica: 'Helvetica' },
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

// ─── ocrPdf mock ──────────────────────────────────────────────────────────────

jest.mock('../src/lib/pdf/ocrPdf', () => ({
  ocrPdf: jest.fn().mockResolvedValue({
    success: true,
    pages: [
      { pageIndex: 0, text: 'Hello World', confidence: 90 },
      { pageIndex: 1, text: 'Second page', confidence: 85 },
    ],
    fullText: '--- Page 1 ---\nHello World\n\n--- Page 2 ---\nSecond page',
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockDoc.getPageCount.mockReturnValue(2);
  mockEmbedFont.mockResolvedValue({});
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── defaultOcrPdfOptions ─────────────────────────────────────────────────────

describe('defaultOcrPdfOptions', () => {
  it('returns language eng', () => {
    expect(defaultOcrPdfOptions().language).toBe('eng');
  });

  it('returns pageSelection all', () => {
    expect(defaultOcrPdfOptions().pageSelection).toBe('all');
  });

  it('returns empty pageRange', () => {
    expect(defaultOcrPdfOptions().pageRange).toBe('');
  });
});

// ─── buildOcrSearchablePdf ────────────────────────────────────────────────────

describe('buildOcrSearchablePdf', () => {
  it('returns success with output blob', async () => {
    const result = await buildOcrSearchablePdf(makePdfFile(), defaultOcrPdfOptions());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename contains _searchable.pdf', async () => {
    const result = await buildOcrSearchablePdf(makePdfFile('doc.pdf'), defaultOcrPdfOptions());
    expect(result.outputFile!.filename).toBe('doc_searchable.pdf');
  });

  it('output blob type is application/pdf', async () => {
    const result = await buildOcrSearchablePdf(makePdfFile(), defaultOcrPdfOptions());
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('calls drawText with invisible text', async () => {
    await buildOcrSearchablePdf(makePdfFile(), defaultOcrPdfOptions());
    expect(mockDrawText).toHaveBeenCalled();
    const opts = mockDrawText.mock.calls[0][1];
    expect(opts.opacity).toBe(0);
  });

  it('returns error when OCR fails', async () => {
    const { ocrPdf } = jest.requireMock('../src/lib/pdf/ocrPdf') as { ocrPdf: jest.Mock };
    ocrPdf.mockResolvedValueOnce({ success: false, error: 'Tesseract not available' });
    const result = await buildOcrSearchablePdf(makePdfFile(), defaultOcrPdfOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tesseract not available/i);
  });

  it('returns error when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupted');
    const result = await buildOcrSearchablePdf(makePdfFile(), defaultOcrPdfOptions());
    expect(result.success).toBe(false);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('ocr-searchable-pdf layout metadata', () => {
  it('title contains searchable or OCR', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-searchable-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/searchable|ocr/i);
  });

  it('canonical url contains ocr-searchable-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-searchable-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('ocr-searchable-pdf');
  });

  it('has OCR-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-searchable-pdf/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/ocr|searchable/);
  });
});
