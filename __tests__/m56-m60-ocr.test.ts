/**
 * M56–M60 — HTML to PDF, Webpage to PDF, OCR tests
 */

// ─── Layout SEO tests ─────────────────────────────────────────────────────────

describe('M56 html-to-pdf layout', () => {
  it('title contains HTML to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/html-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/html.+pdf|pdf.+html/i);
  });

  it('canonical contains html-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/html-to-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('html-to-pdf');
  });
});

describe('M57 webpage-to-pdf layout', () => {
  it('title contains web page to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/webpage-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/web.+pdf|url.+pdf/i);
  });
});

describe('M58 OCR layout', () => {
  it('title contains OCR', async () => {
    const mod = await import('../src/app/pdf-tools/ocr/layout');
    expect(String(mod.metadata.title)).toMatch(/ocr/i);
  });

  it('keywords contain OCR terms', async () => {
    const mod = await import('../src/app/pdf-tools/ocr/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/ocr|tesseract/i);
  });
});

describe('M59 ocr-searchable-pdf layout', () => {
  it('title contains searchable PDF or OCR', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-searchable-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/searchable|ocr/i);
  });
});

describe('M60 ocr-text layout', () => {
  it('title contains OCR to Text or text extraction', async () => {
    const mod = await import('../src/app/pdf-tools/ocr-text/layout');
    expect(String(mod.metadata.title)).toMatch(/ocr.+text|text.+ocr/i);
  });
});

// ─── M58–M60: ocrPdf (mocked Tesseract + pdfjs) ───────────────────────────────

const mockTesseractRecognize = jest.fn().mockResolvedValue({ data: { text: 'Hello OCR', confidence: 92 } });
const mockTesseractWorker = {
  recognize: mockTesseractRecognize,
  terminate: jest.fn().mockResolvedValue(undefined),
};

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn().mockResolvedValue(mockTesseractWorker),
}));

const mockGetTextContent = jest.fn().mockResolvedValue({ items: [] });
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

import { ocrPdf } from '../src/lib/pdf/ocrPdf';

function makeFile(name = 'scan.pdf'): File {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' });
}

describe('ocrPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTesseractRecognize.mockResolvedValue({ data: { text: 'Hello OCR', confidence: 92 } });
    mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent, getViewport: mockGetViewport, render: mockRender });
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValue({ promise: Promise.resolve(mockPdfDoc) });
  });

  it('returns success with pages and fullText', async () => {
    const result = await ocrPdf(makeFile(), 2);
    expect(result.success).toBe(true);
    expect(result.pages).toHaveLength(2);
    expect(result.fullText).toContain('Hello OCR');
  });

  it('calls recognize once per page', async () => {
    await ocrPdf(makeFile(), 2);
    expect(mockTesseractRecognize).toHaveBeenCalledTimes(2);
  });

  it('calls progress callback', async () => {
    const onProgress = jest.fn();
    await ocrPdf(makeFile(), 2, onProgress);
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ pageIndex: 0, total: 2 }));
  });

  it('terminates the worker', async () => {
    await ocrPdf(makeFile(), 1);
    expect(mockTesseractWorker.terminate).toHaveBeenCalled();
  });

  it('pages contain text and confidence', async () => {
    const result = await ocrPdf(makeFile(), 1);
    expect(result.pages![0].text).toBe('Hello OCR');
    expect(result.pages![0].confidence).toBe(92);
  });

  it('returns error on tesseract failure', async () => {
    const tesseract = jest.requireMock('tesseract.js') as { createWorker: jest.Mock };
    tesseract.createWorker.mockImplementationOnce(() => { throw new Error('tesseract init failed'); });
    const result = await ocrPdf(makeFile(), 1);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tesseract/i);
  });
});
