/**
 * M53 — PDF to HTML tests
 */

import { defaultHtmlOptions, convertPdfToHtml } from '../src/lib/pdf/pdfToHtml';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return {
    id: 'id', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

const mockCanvas = {
  getContext: jest.fn().mockReturnValue({}),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc123'),
  width: 0,
  height: 0,
};

const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() });
const mockGetViewport = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockGetPage = jest.fn().mockResolvedValue({ getViewport: mockGetViewport, render: mockRender });
const mockPdf = { numPages: 2, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: null },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

const makeCanvas = () => mockCanvas as unknown as HTMLCanvasElement;

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
  // Mock FileReader to call onload synchronously
  const MockFileReader = jest.fn().mockImplementation(() => {
    const instance: Record<string, unknown> = {
      result: fakeArrayBuffer,
      onload: null,
      onerror: null,
      readAsArrayBuffer: jest.fn().mockImplementation(function (this: typeof instance) {
        if (typeof this.onload === 'function') (this.onload as (ev: unknown) => void)({ target: this });
      }),
    };
    return instance;
  });
  global.FileReader = MockFileReader as unknown as typeof FileReader;
  global.Worker = jest.fn().mockImplementation(() => ({})) as unknown as typeof Worker;
});

describe('defaultHtmlOptions', () => {
  it('has scale 1.5', () => {
    expect(defaultHtmlOptions().scale).toBe(1.5);
  });
  it('has includePageNumbers true', () => {
    expect(defaultHtmlOptions().includePageNumbers).toBe(true);
  });
});

describe('convertPdfToHtml', () => {
  it('returns success', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(result.success).toBe(true);
  });

  it('returns html string', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(typeof result.html).toBe('string');
  });

  it('html contains DOCTYPE', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(result.html).toContain('<!DOCTYPE html>');
  });

  it('html contains img tags', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(result.html).toContain('<img');
  });

  it('renders one img per page', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    const matches = result.html!.match(/<img/g) ?? [];
    expect(matches).toHaveLength(2);
  });

  it('returns pageCount', async () => {
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(result.pageCount).toBe(2);
  });

  it('works without explicit options (uses defaults)', async () => {
    const result = await convertPdfToHtml(makePdfFile(), undefined, makeCanvas);
    expect(result.success).toBe(true);
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('bad pdf')) });
    const result = await convertPdfToHtml(makePdfFile(), defaultHtmlOptions(), makeCanvas);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });
});

describe('pdf-to-html layout metadata', () => {
  it('title contains PDF to HTML', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-html/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/pdf.+html/i);
  });

  it('has relevant keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-html/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to html|convert pdf/i);
  });
});
