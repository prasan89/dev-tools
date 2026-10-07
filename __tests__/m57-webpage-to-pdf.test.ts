/**
 * M57 — Web Page to PDF tests
 */

import { convertUrlToPdf, convertHtmlSourceToPdf } from '../src/lib/pdf/webPageToPdf';

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockDrawRectangle = jest.fn();
const mockPage = {
  drawText: mockDrawText,
  drawRectangle: mockDrawRectangle,
  getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
};
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  addPage: jest.fn().mockReturnValue(mockPage),
  setTitle: jest.fn(),
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  embedFont: jest.fn().mockResolvedValue({
    widthOfTextAtSize: jest.fn().mockReturnValue(50),
  }),
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    create: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
    load: jest.fn().mockResolvedValue(mockDoc),
  };
  return {
    PDFDocument,
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    degrees: jest.fn((n: number) => n),
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'Helvetica-Bold' },
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
  mockDoc.addPage.mockReturnValue(mockPage);
  mockDoc.embedFont.mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(50) });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetCreate: () => void };
  pdfLib.__resetCreate();
});

// ─── convertUrlToPdf ──────────────────────────────────────────────────────────

describe('convertUrlToPdf', () => {
  it('always returns success: false', async () => {
    const result = await convertUrlToPdf('https://example.com');
    expect(result.success).toBe(false);
  });

  it('returns instructions string', async () => {
    const result = await convertUrlToPdf('https://example.com');
    expect(result.instructions).toBeTruthy();
  });

  it('instructions mention print', async () => {
    const result = await convertUrlToPdf('https://example.com');
    expect(result.instructions.toLowerCase()).toMatch(/print|ctrl\+p/);
  });

  it('instructions mention PDF', async () => {
    const result = await convertUrlToPdf('https://example.com');
    expect(result.instructions.toLowerCase()).toMatch(/pdf/);
  });
});

// ─── convertHtmlSourceToPdf ───────────────────────────────────────────────────

describe('convertHtmlSourceToPdf', () => {
  it('returns success blob', async () => {
    const result = await convertHtmlSourceToPdf('<p>Hello world</p>', 'Test');
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('output filename uses title', async () => {
    const result = await convertHtmlSourceToPdf('<p>text</p>', 'My Document');
    expect(result.outputFile!.filename).toMatch(/My_Document|My Document/);
    expect(result.outputFile!.filename).toMatch(/\.pdf$/);
  });

  it('uses fallback filename when title is empty', async () => {
    const result = await convertHtmlSourceToPdf('<p>text</p>', '');
    expect(result.outputFile!.filename).toMatch(/\.pdf$/);
  });

  it('returns error for empty html', async () => {
    const result = await convertHtmlSourceToPdf('', 'title');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('handles headings in HTML', async () => {
    const result = await convertHtmlSourceToPdf('<h1>Big Title</h1><p>content</p>', 'doc');
    expect(result.success).toBe(true);
  });

  it('handles list items', async () => {
    const result = await convertHtmlSourceToPdf('<ul><li>item 1</li><li>item 2</li></ul>', 'doc');
    expect(result.success).toBe(true);
  });

  it('returns error when pdf-lib throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnCreate: (m: string) => void };
    pdfLib.__throwOnCreate('out of memory');
    const result = await convertHtmlSourceToPdf('<p>text</p>', 'doc');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/out of memory/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('webpage-to-pdf layout metadata', () => {
  it('title contains web page PDF', async () => {
    const mod = await import('../src/app/pdf-tools/webpage-to-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/web.+page.+pdf|url.+pdf/i);
  });

  it('canonical url contains webpage-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/webpage-to-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('webpage-to-pdf');
  });
});
