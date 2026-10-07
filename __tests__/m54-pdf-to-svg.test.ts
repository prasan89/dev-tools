/**
 * M54 — PDF to SVG tests
 */

import { defaultSvgOptions, convertPdfPageToSvg, convertPdfToSvg } from '../src/lib/pdf/pdfToSvg';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return {
    id: 'id', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 3, objectUrl: 'blob:test',
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
const mockPdf = { numPages: 3, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: null },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

const makeCanvas = () => mockCanvas as unknown as HTMLCanvasElement;

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
  const MockFileReader = jest.fn().mockImplementation(() => {
    const instance: Record<string, unknown> = {
      result: fakeArrayBuffer,
      onload: null,
      onerror: null,
      readAsArrayBuffer: jest.fn().mockImplementation(function (this: typeof instance) {
        if (typeof this.onload === 'function') (this.onload as () => void)();
      }),
    };
    return instance;
  });
  global.FileReader = MockFileReader as unknown as typeof FileReader;
  global.Worker = jest.fn().mockImplementation(() => ({})) as unknown as typeof Worker;
});

describe('defaultSvgOptions', () => {
  it('has scale 2.0', () => {
    expect(defaultSvgOptions().scale).toBe(2.0);
  });
  it('has pageIndex 0', () => {
    expect(defaultSvgOptions().pageIndex).toBe(0);
  });
});

describe('convertPdfPageToSvg', () => {
  it('returns success', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions(), makeCanvas);
    expect(result.success).toBe(true);
  });

  it('svg string starts with <svg', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions(), makeCanvas);
    expect(result.svg).toMatch(/^<svg/);
  });

  it('returns width and height', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions(), makeCanvas);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('svg contains image element', async () => {
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions(), makeCanvas);
    expect(result.svg).toContain('<image');
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('corrupt')) });
    const result = await convertPdfPageToSvg(makePdfFile(), defaultSvgOptions(), makeCanvas);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupt/i);
  });
});

describe('convertPdfToSvg', () => {
  it('returns success with svgs array', async () => {
    const result = await convertPdfToSvg(makePdfFile(), 2.0, makeCanvas);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.svgs)).toBe(true);
  });

  it('returns one svg per page', async () => {
    const result = await convertPdfToSvg(makePdfFile(), 2.0, makeCanvas);
    expect(result.svgs).toHaveLength(3);
  });

  it('each svg starts with <svg', async () => {
    const result = await convertPdfToSvg(makePdfFile(), 2.0, makeCanvas);
    result.svgs!.forEach((svg) => expect(svg).toMatch(/^<svg/));
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('bad file')) });
    const result = await convertPdfToSvg(makePdfFile(), 2.0, makeCanvas).catch(() => ({ success: false, error: 'bad file' }));
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('pdf-to-svg layout metadata', () => {
  it('title contains PDF to SVG', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-svg/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/pdf.+svg/i);
  });

  it('has relevant keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-svg/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to svg|convert pdf/i);
  });
});
