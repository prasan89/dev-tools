/**
 * M49 — Create PDF tests
 */

import {
  defaultCreatePdfConfig,
  getPageDimensions,
  buildNewPdf,
} from '../src/lib/pdf/createPdf';
import type { CreatePdfConfig } from '../src/lib/pdf/createPdf';

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawRectangle = jest.fn();
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockAddPage = jest.fn().mockReturnValue({
  drawRectangle: mockDrawRectangle,
  getSize: mockGetSize,
});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  addPage: mockAddPage,
  setTitle: jest.fn(),
  setAuthor: jest.fn(),
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockResolvedValue(mockDoc),
    create: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
  };
  return {
    PDFDocument,
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    degrees: jest.fn((n: number) => n),
    __throwOnCreate: (msg: string) => {
      _throw = msg;
      PDFDocument.create = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetCreate: () => {
      _throw = null;
      PDFDocument.create = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockAddPage.mockReturnValue({ drawRectangle: mockDrawRectangle, getSize: mockGetSize });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetCreate: () => void };
  pdfLib.__resetCreate();
});

// ─── getPageDimensions ────────────────────────────────────────────────────────

describe('getPageDimensions', () => {
  it('A4 portrait: 595x842', () => {
    expect(getPageDimensions('A4', 'portrait')).toEqual({ width: 595, height: 842 });
  });

  it('A4 landscape: 842x595', () => {
    expect(getPageDimensions('A4', 'landscape')).toEqual({ width: 842, height: 595 });
  });

  it('Letter portrait: 612x792', () => {
    expect(getPageDimensions('Letter', 'portrait')).toEqual({ width: 612, height: 792 });
  });

  it('Legal portrait: 612x1008', () => {
    expect(getPageDimensions('Legal', 'portrait')).toEqual({ width: 612, height: 1008 });
  });

  it('A3 portrait: 842x1190', () => {
    expect(getPageDimensions('A3', 'portrait')).toEqual({ width: 842, height: 1190 });
  });

  it('A5 portrait: 420x595', () => {
    expect(getPageDimensions('A5', 'portrait')).toEqual({ width: 420, height: 595 });
  });

  it('landscape swaps width and height', () => {
    const portrait = getPageDimensions('Letter', 'portrait');
    const landscape = getPageDimensions('Letter', 'landscape');
    expect(landscape.width).toBe(portrait.height);
    expect(landscape.height).toBe(portrait.width);
  });
});

// ─── defaultCreatePdfConfig ───────────────────────────────────────────────────

describe('defaultCreatePdfConfig', () => {
  it('has A4 as default page size', () => {
    expect(defaultCreatePdfConfig().pageSize).toBe('A4');
  });

  it('has portrait as default orientation', () => {
    expect(defaultCreatePdfConfig().orientation).toBe('portrait');
  });

  it('has 1 as default page count', () => {
    expect(defaultCreatePdfConfig().pageCount).toBe(1);
  });

  it('has white as default background color', () => {
    expect(defaultCreatePdfConfig().backgroundColor.toLowerCase()).toMatch(/#fff(fff)?/);
  });

  it('has empty title and author by default', () => {
    const cfg = defaultCreatePdfConfig();
    expect(cfg.title).toBe('');
    expect(cfg.author).toBe('');
  });
});

// ─── buildNewPdf ──────────────────────────────────────────────────────────────

describe('buildNewPdf', () => {
  it('returns success blob', async () => {
    const result = await buildNewPdf(defaultCreatePdfConfig());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('output filename uses title when provided', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), title: 'My Report' };
    const result = await buildNewPdf(config);
    expect(result.outputFile!.filename).toMatch(/My Report|My_Report/);
    expect(result.outputFile!.filename).toMatch(/_new\.pdf$/);
  });

  it('output filename falls back to document when title is empty', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), title: '' };
    const result = await buildNewPdf(config);
    expect(result.outputFile!.filename).toBe('document_new.pdf');
  });

  it('adds the correct number of pages', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), pageCount: 3 };
    await buildNewPdf(config);
    expect(mockAddPage).toHaveBeenCalledTimes(3);
  });

  it('sets title metadata when provided', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), title: 'Test Doc' };
    await buildNewPdf(config);
    expect(mockDoc.setTitle).toHaveBeenCalledWith('Test Doc');
  });

  it('sets author metadata when provided', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), author: 'Jane Doe' };
    await buildNewPdf(config);
    expect(mockDoc.setAuthor).toHaveBeenCalledWith('Jane Doe');
  });

  it('draws background rectangle for non-white color', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), backgroundColor: '#ff0000' };
    await buildNewPdf(config);
    expect(mockDrawRectangle).toHaveBeenCalled();
  });

  it('does NOT draw background for white (#ffffff)', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), backgroundColor: '#ffffff' };
    await buildNewPdf(config);
    expect(mockDrawRectangle).not.toHaveBeenCalled();
  });

  it('clamps pageCount to max 100', async () => {
    const config: CreatePdfConfig = { ...defaultCreatePdfConfig(), pageCount: 500 };
    await buildNewPdf(config);
    expect(mockAddPage).toHaveBeenCalledTimes(100);
  });

  it('returns error when pdf-lib create throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnCreate: (m: string) => void };
    pdfLib.__throwOnCreate('out of memory');
    const result = await buildNewPdf(defaultCreatePdfConfig());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/out of memory/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('create-pdf layout metadata', () => {
  it('title contains create PDF', async () => {
    const mod = await import('../src/app/pdf-tools/create-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/create.+pdf/i);
  });

  it('has create-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/create-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/create pdf|blank pdf/);
  });

  it('canonical url contains create-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/create-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('create-pdf');
  });
});
