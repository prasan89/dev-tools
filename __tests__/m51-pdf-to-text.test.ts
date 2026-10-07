/**
 * M51 — PDF to Text tests
 */

import { extractTextFromPdf } from '../src/lib/pdf/pdfToText';
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

const mockGetTextContent = jest.fn();
const mockGetPage = jest.fn();
const mockPdf = {
  numPages: 2,
  getPage: mockGetPage,
};

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: 'mock-worker' },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTextContent.mockResolvedValue({ items: [{ str: 'Hello' }, { str: 'World' }] });
  mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent });
  mockPdf.numPages = 2;
});

describe('extractTextFromPdf', () => {
  it('returns success with pages and fullText', async () => {
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.success).toBe(true);
    expect(res.result).toBeDefined();
    expect(res.result!.pages).toHaveLength(2);
  });

  it('each page has extracted text', async () => {
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.result!.pages[0].text).toBe('Hello World');
  });

  it('fullText contains all pages with separators', async () => {
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.result!.fullText).toContain('Page 1');
    expect(res.result!.fullText).toContain('Page 2');
  });

  it('handles empty page (no text items)', async () => {
    mockGetTextContent.mockResolvedValueOnce({ items: [] });
    mockGetTextContent.mockResolvedValueOnce({ items: [{ str: 'Second page' }] });
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.success).toBe(true);
    expect(res.result!.pages[0].text).toBe('');
    expect(res.result!.pages[1].text).toBe('Second page');
  });

  it('returns error when pdfjs throws', async () => {
    const pdfLib = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfLib.getDocument.mockImplementationOnce(() => { throw new Error('bad pdf'); });
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/bad pdf/i);
  });

  it('pageIndex is 0-based', async () => {
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.result!.pages[0].pageIndex).toBe(0);
    expect(res.result!.pages[1].pageIndex).toBe(1);
  });

  it('works with single page PDF', async () => {
    mockPdf.numPages = 1;
    const res = await extractTextFromPdf(makePdfFile());
    expect(res.result!.pages).toHaveLength(1);
  });
});

describe('pdf-to-text layout metadata', () => {
  it('title contains PDF to text', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-text/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+text/i);
  });

  it('has text-extraction keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-text/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/extract text|pdf to text/);
  });

  it('canonical contains pdf-to-text', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-text/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-text');
  });
});
