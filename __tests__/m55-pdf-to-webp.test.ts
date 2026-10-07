/**
 * M55 — PDF to WebP tests
 */

import { defaultWebpOptions, convertPdfToWebp } from '../src/lib/pdf/pdfToWebp';
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

// ─── pdfjs mock ───────────────────────────────────────────────────────────────

const mockCanvas = {
  width: 0, height: 0,
  getContext: jest.fn().mockReturnValue({}),
  toDataURL: jest.fn().mockReturnValue('data:image/webp;base64,abc123'),
};

const mockViewport = { width: 400, height: 600 };
const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() });
const mockPage = {
  getViewport: jest.fn().mockReturnValue(mockViewport),
  render: mockRender,
};
const mockPdf = {
  numPages: 2,
  getPage: jest.fn().mockResolvedValue(mockPage),
};

jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
  GlobalWorkerOptions: { workerPort: null },
}));

// Mock document.createElement for canvas
const origCreate = global.document?.createElement?.bind(document);
beforeAll(() => {
  if (global.document) {
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return origCreate ? origCreate(tag) : {} as HTMLElement;
    });
  }
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,abc123');
  mockRender.mockReturnValue({ promise: Promise.resolve() });
  mockPage.getViewport.mockReturnValue(mockViewport);
  mockPdf.getPage.mockResolvedValue(mockPage);
  mockPdf.numPages = 2;
  const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
  pdfjs.getDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });
});

// ─── defaultWebpOptions ───────────────────────────────────────────────────────

describe('defaultWebpOptions', () => {
  it('has scale 2.0', () => {
    expect(defaultWebpOptions().scale).toBe(2.0);
  });

  it('has quality 0.85', () => {
    expect(defaultWebpOptions().quality).toBe(0.85);
  });

  it('defaults to all pages', () => {
    expect(defaultWebpOptions().pageSelection).toBe('all');
  });

  it('has empty pageRange', () => {
    expect(defaultWebpOptions().pageRange).toBe('');
  });
});

// ─── convertPdfToWebp ─────────────────────────────────────────────────────────

describe('convertPdfToWebp: success', () => {
  it('returns success=true', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.success).toBe(true);
  });

  it('returns pages array', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.pages).toBeDefined();
    expect(Array.isArray(result.pages)).toBe(true);
  });

  it('returns one page per PDF page when all selected', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.pages!.length).toBe(2);
  });

  it('each page has pageIndex, dataUrl, width, height', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    const p = result.pages![0];
    expect(typeof p.pageIndex).toBe('number');
    expect(p.dataUrl).toMatch(/^data:image\/webp/);
    expect(typeof p.width).toBe('number');
    expect(typeof p.height).toBe('number');
  });

  it('pageIndex corresponds to PDF page index (0-based)', async () => {
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.pages![0].pageIndex).toBe(0);
    expect(result.pages![1].pageIndex).toBe(1);
  });
});

describe('convertPdfToWebp: error handling', () => {
  it('returns success=false when pdfjs getDocument throws', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValue({
      get promise() {
        return Promise.reject(new Error('bad pdf'));
      },
    });
    const result = await convertPdfToWebp(makePdfFile(), defaultWebpOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('pdf-to-webp layout metadata', () => {
  it('title contains PDF to WebP', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-webp/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+webp/i);
  });

  it('has webp-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-webp/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/webp/);
  });

  it('canonical url contains pdf-to-webp', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-webp/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-webp');
  });
});
