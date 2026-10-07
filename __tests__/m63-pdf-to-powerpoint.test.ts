/**
 * M63 — PDF to PowerPoint tests
 */

import {
  defaultPowerpointOptions,
  convertPdfToPowerpoint,
} from '../src/lib/pdf/pdfToPowerpoint';
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

// ─── pptxgenjs mock ───────────────────────────────────────────────────────────

const mockAddImage = jest.fn();
const mockSlide = { addImage: mockAddImage };
const mockDefineLayout = jest.fn();
const mockAddSlide = jest.fn().mockReturnValue(mockSlide);
const mockWrite = jest.fn().mockResolvedValue(new ArrayBuffer(8));
const mockPrs = {
  defineLayout: mockDefineLayout,
  addSlide: mockAddSlide,
  write: mockWrite,
};

jest.mock('pptxgenjs', () => {
  return jest.fn().mockImplementation(() => mockPrs);
}, { virtual: true });

// ─── pdfjs mock ───────────────────────────────────────────────────────────────

const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() });
const mockGetViewport = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockGetPage = jest.fn().mockResolvedValue({ getViewport: mockGetViewport, render: mockRender });
const mockPdf = { numPages: 2, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: null },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

// ─── canvas mock ──────────────────────────────────────────────────────────────

const mockCanvas = {
  getContext: jest.fn().mockReturnValue({}),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc123'),
  width: 0, height: 0,
};
const makeCanvas = () => mockCanvas as unknown as HTMLCanvasElement;

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
  mockWrite.mockResolvedValue(new ArrayBuffer(8));
  mockAddSlide.mockReturnValue(mockSlide);
  const MockFileReader = jest.fn().mockImplementation(() => {
    const inst: Record<string, unknown> = {
      result: fakeArrayBuffer, onload: null, onerror: null,
      readAsArrayBuffer: jest.fn().mockImplementation(function (this: typeof inst) {
        if (typeof this.onload === 'function') (this.onload as () => void)();
      }),
    };
    return inst;
  });
  global.FileReader = MockFileReader as unknown as typeof FileReader;
  global.Worker = jest.fn().mockImplementation(() => ({})) as unknown as typeof Worker;
  const pdfjsMod = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
  pdfjsMod.getDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });
  mockGetPage.mockResolvedValue({ getViewport: mockGetViewport, render: mockRender });
  mockRender.mockReturnValue({ promise: Promise.resolve() });
});

// ─── defaultPowerpointOptions ─────────────────────────────────────────────────

describe('defaultPowerpointOptions', () => {
  it('has scale 1.5', () => {
    expect(defaultPowerpointOptions().scale).toBe(1.5);
  });
  it('has pageSelection all', () => {
    expect(defaultPowerpointOptions().pageSelection).toBe('all');
  });
});

// ─── convertPdfToPowerpoint ───────────────────────────────────────────────────

describe('convertPdfToPowerpoint', () => {
  it('returns success with pptx blob', async () => {
    const result = await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename ends with .pptx', async () => {
    const result = await convertPdfToPowerpoint(makePdfFile('slides.pdf'), defaultPowerpointOptions(), makeCanvas);
    expect(result.outputFile!.filename).toBe('slides.pptx');
  });

  it('output blob has pptx MIME type', async () => {
    const result = await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(result.outputFile!.blob.type).toContain('presentationml');
  });

  it('calls addSlide for each page', async () => {
    const result = await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(result.success).toBe(true);
    expect(mockAddSlide).toHaveBeenCalledTimes(2); // 2 pages
  });

  it('calls addImage on each slide', async () => {
    await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(mockAddImage).toHaveBeenCalledTimes(2);
  });

  it('page range limits slides generated', async () => {
    const opts = { ...defaultPowerpointOptions(), pageSelection: 'range' as const, pageRange: '1' };
    await convertPdfToPowerpoint(makePdfFile(), opts, makeCanvas);
    expect(mockAddSlide).toHaveBeenCalledTimes(1);
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjsMod = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjsMod.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('corrupt pdf')) });
    const result = await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupt pdf/i);
  });

  it('returns error when pptxgenjs write throws', async () => {
    mockWrite.mockRejectedValueOnce(new Error('pptx write fail'));
    const result = await convertPdfToPowerpoint(makePdfFile(), defaultPowerpointOptions(), makeCanvas);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/pptx write fail/i);
  });
});

// ─── layout SEO ───────────────────────────────────────────────────────────────

describe('pdf-to-powerpoint layout metadata', () => {
  it('title contains PDF to PowerPoint', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-powerpoint/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+powerpoint/i);
  });
  it('has relevant keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-powerpoint/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to powerpoint|pdf to pptx/i);
  });
  it('canonical contains pdf-to-powerpoint', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-powerpoint/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-powerpoint');
  });
});
