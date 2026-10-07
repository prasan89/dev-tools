/**
 * M60 — OCR to Extracted Text tests
 */

import { defaultOcrTextOptions, extractTextViaOcr } from '../src/lib/pdf/ocrToText';
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

// ─── ocrPdf mock ──────────────────────────────────────────────────────────────

jest.mock('../src/lib/pdf/ocrPdf', () => ({
  ocrPdf: jest.fn().mockResolvedValue({
    success: true,
    pages: [
      { pageIndex: 0, text: 'Hello World', confidence: 90 },
      { pageIndex: 1, text: 'Second page text', confidence: 80 },
    ],
    fullText: '--- Page 1 ---\nHello World\n\n--- Page 2 ---\nSecond page text',
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  const { ocrPdf } = jest.requireMock('../src/lib/pdf/ocrPdf') as { ocrPdf: jest.Mock };
  ocrPdf.mockResolvedValue({
    success: true,
    pages: [
      { pageIndex: 0, text: 'Hello World', confidence: 90 },
      { pageIndex: 1, text: 'Second page text', confidence: 80 },
    ],
    fullText: '--- Page 1 ---\nHello World\n\n--- Page 2 ---\nSecond page text',
  });
});

// ─── defaultOcrTextOptions ────────────────────────────────────────────────────

describe('defaultOcrTextOptions', () => {
  it('returns language eng', () => {
    expect(defaultOcrTextOptions().language).toBe('eng');
  });

  it('returns pageSelection all', () => {
    expect(defaultOcrTextOptions().pageSelection).toBe('all');
  });

  it('returns empty pageRange', () => {
    expect(defaultOcrTextOptions().pageRange).toBe('');
  });
});

// ─── extractTextViaOcr ────────────────────────────────────────────────────────

describe('extractTextViaOcr', () => {
  it('returns success with pages array', async () => {
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.success).toBe(true);
    expect(res.result!.pages).toHaveLength(2);
  });

  it('pages have correct structure', async () => {
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    const p0 = res.result!.pages[0];
    expect(p0).toHaveProperty('pageIndex', 0);
    expect(p0).toHaveProperty('text', 'Hello World');
    expect(p0).toHaveProperty('confidence', 90);
  });

  it('fullText contains page separator', async () => {
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.result!.fullText).toContain('--- Page');
  });

  it('fullText contains text from both pages', async () => {
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.result!.fullText).toContain('Hello World');
    expect(res.result!.fullText).toContain('Second page text');
  });

  it('averageConfidence is calculated correctly', async () => {
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.result!.averageConfidence).toBe(85); // (90+80)/2
  });

  it('returns error when OCR fails', async () => {
    const { ocrPdf } = jest.requireMock('../src/lib/pdf/ocrPdf') as { ocrPdf: jest.Mock };
    ocrPdf.mockResolvedValueOnce({ success: false, error: 'Tesseract not available' });
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/tesseract not available/i);
  });

  it('averageConfidence is 0 for empty pages', async () => {
    const { ocrPdf } = jest.requireMock('../src/lib/pdf/ocrPdf') as { ocrPdf: jest.Mock };
    ocrPdf.mockResolvedValueOnce({ success: true, pages: [], fullText: '' });
    const res = await extractTextViaOcr(makePdfFile(), defaultOcrTextOptions());
    expect(res.result!.averageConfidence).toBe(0);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('ocr-text layout metadata', () => {
  it('title contains OCR or text', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-text/layout');
    expect(String(mod.metadata.title)).toMatch(/ocr|text/i);
  });

  it('canonical url contains ocr-text', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-text/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('ocr-text');
  });

  it('has OCR-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-text/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/ocr|text/);
  });
});
