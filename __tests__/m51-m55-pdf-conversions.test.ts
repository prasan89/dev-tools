/**
 * M51–M55 — PDF conversion tests (text, markdown, html, svg, webp)
 */

// ─── pdfjs-dist mock ──────────────────────────────────────────────────────────

const mockGetTextContent = jest.fn().mockResolvedValue({
  items: [
    { str: 'Hello', transform: [1, 0, 0, 12, 100, 700] },
    { str: ' World', transform: [1, 0, 0, 12, 150, 700] },
  ],
});

const mockGetViewport = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() });
const mockGetPage = jest.fn().mockResolvedValue({
  getTextContent: mockGetTextContent,
  getViewport: mockGetViewport,
  render: mockRender,
});

const mockPdfDoc = { numPages: 2, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: 'mock-worker' },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdfDoc) }),
}));

// Canvas mock (needed for HTML/SVG/WebP tests)
const mockCanvasCtx = { clearRect: jest.fn(), fillRect: jest.fn() };
const mockCanvasEl = {
  width: 0, height: 0,
  getContext: jest.fn().mockReturnValue(mockCanvasCtx),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc'),
};
const origCreateElement = document.createElement.bind(document);
beforeAll(() => {
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return mockCanvasEl as unknown as HTMLCanvasElement;
    return origCreateElement(tag);
  });
});
afterAll(() => {
  (document.createElement as jest.Mock).mockRestore();
});

import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return {
    id: 'test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

function resetMocks() {
  jest.clearAllMocks();
  mockGetTextContent.mockResolvedValue({
    items: [
      { str: 'Hello', transform: [1, 0, 0, 12, 100, 700] },
      { str: ' World', transform: [1, 0, 0, 12, 150, 700] },
    ],
  });
  mockGetViewport.mockReturnValue({ width: 595, height: 842 });
  mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent, getViewport: mockGetViewport, render: mockRender });
  mockCanvasEl.toDataURL.mockReturnValue('data:image/png;base64,abc');
  const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
  pdfjs.getDocument.mockReturnValue({ promise: Promise.resolve(mockPdfDoc) });
}

beforeEach(resetMocks);

// ─── M51: extractTextFromPdf ──────────────────────────────────────────────────

import { extractTextFromPdf } from '../src/lib/pdf/pdfToText';

describe('extractTextFromPdf', () => {
  it('returns success and fullText', async () => {
    const result = await extractTextFromPdf(makePdfFile());
    expect(result.success).toBe(true);
    expect(result.result?.fullText).toBeDefined();
  });

  it('fullText contains page markers', async () => {
    const result = await extractTextFromPdf(makePdfFile());
    expect(result.result?.fullText).toContain('Page 1');
    expect(result.result?.fullText).toContain('Page 2');
  });

  it('returns pages array with one entry per page', async () => {
    const result = await extractTextFromPdf(makePdfFile());
    expect(result.result?.pages).toHaveLength(2);
  });

  it('text contains extracted words', async () => {
    const result = await extractTextFromPdf(makePdfFile());
    expect(result.result?.fullText).toContain('Hello');
  });

  it('returns error on pdfjs failure', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockImplementationOnce(() => { throw new Error('bad pdf'); });
    const result = await extractTextFromPdf(makePdfFile());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });
});

// ─── M52: convertPdfToMarkdown ────────────────────────────────────────────────

import { convertPdfToMarkdown } from '../src/lib/pdf/pdfToMarkdown';

describe('convertPdfToMarkdown', () => {
  it('returns success and markdown string', async () => {
    const result = await convertPdfToMarkdown(makePdfFile());
    expect(result.success).toBe(true);
    expect(result.markdown).toBeDefined();
  });

  it('markdown contains page headings', async () => {
    const result = await convertPdfToMarkdown(makePdfFile());
    expect(result.markdown).toContain('## Page 1');
  });

  it('returns error on failure', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockImplementationOnce(() => { throw new Error('corrupt'); });
    const result = await convertPdfToMarkdown(makePdfFile());
    expect(result.success).toBe(false);
  });
});

// ─── M53: convertPdfToHtml ────────────────────────────────────────────────────

import { convertPdfToHtml } from '../src/lib/pdf/pdfToHtml';

describe('convertPdfToHtml', () => {
  it('returns success and html string', async () => {
    const result = await convertPdfToHtml(makePdfFile());
    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
  });

  it('html contains DOCTYPE', async () => {
    const result = await convertPdfToHtml(makePdfFile());
    expect(result.html).toContain('<!DOCTYPE html>');
  });

  it('html contains img tags', async () => {
    const result = await convertPdfToHtml(makePdfFile());
    expect(result.html).toContain('<img');
  });

  it('pageCount matches numPages', async () => {
    const result = await convertPdfToHtml(makePdfFile());
    expect(result.pageCount).toBe(2);
  });

  it('returns error on failure', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockImplementationOnce(() => { throw new Error('fail'); });
    const result = await convertPdfToHtml(makePdfFile());
    expect(result.success).toBe(false);
  });
});

// ─── M54: convertPdfPageToSvg ─────────────────────────────────────────────────

import { convertPdfPageToSvg, defaultSvgOptions } from '../src/lib/pdf/pdfToSvg';

describe('convertPdfPageToSvg', () => {
  it('returns success and svg string', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions());
    expect(result.success).toBe(true);
    expect(result.svg).toBeDefined();
  });

  it('svg starts with <svg', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions());
    expect(result.svg!.trim()).toMatch(/^<svg/);
  });

  it('svg contains embedded image', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions());
    expect(result.svg).toContain('<image');
  });

  it('returns width and height', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions());
    expect(typeof result.width).toBe('number');
    expect(typeof result.height).toBe('number');
  });

  it('returns error on failure', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockImplementationOnce(() => { throw new Error('fail'); });
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions());
    expect(result.success).toBe(false);
  });
});

// ─── M55: convertPdfToWebp ────────────────────────────────────────────────────

import { convertPdfToWebp, defaultWebpOptions } from '../src/lib/pdf/pdfToWebp';

describe('convertPdfToWebp', () => {
  it('returns success and pages array', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.success).toBe(true);
    expect(result.pages).toBeDefined();
    expect(result.pages!.length).toBe(2);
  });

  it('pages contain dataUrl strings', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    for (const p of result.pages!) {
      expect(typeof p.dataUrl).toBe('string');
    }
  });

  it('range selection converts only specified pages', async () => {
    const result = await convertPdfToWebp(makePdfFile(), { ...defaultWebpOptions(), pageSelection: 'range', pageRange: '1' });
    expect(result.pages!.length).toBe(1);
  });

  it('returns error on failure', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockImplementationOnce(() => { throw new Error('bad pdf'); });
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.success).toBe(false);
  });
});

// ─── Layout SEO tests ─────────────────────────────────────────────────────────

describe('M51 pdf-to-text layout', () => {
  it('title contains PDF to Text', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-text/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+text|text.+pdf/i);
  });
});

describe('M52 pdf-to-markdown layout', () => {
  it('title contains Markdown', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-markdown/layout');
    expect(String(mod.metadata.title)).toMatch(/markdown/i);
  });
});

describe('M53 pdf-to-html layout', () => {
  it('title contains HTML', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-html/layout');
    expect(String(mod.metadata.title)).toMatch(/html/i);
  });
});

describe('M54 pdf-to-svg layout', () => {
  it('title contains SVG', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-svg/layout');
    expect(String(mod.metadata.title)).toMatch(/svg/i);
  });
});

describe('M55 pdf-to-webp layout', () => {
  it('title contains WebP', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-webp/layout');
    expect(String(mod.metadata.title)).toMatch(/webp/i);
  });
});
