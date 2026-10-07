/**
 * M64 — Word to PDF tests
 */

import { convertWordToPdf } from '../src/lib/pdf/wordToPdf';

function makeDocxFile(name = 'report.docx'): File {
  const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  return new File([bytes.buffer as ArrayBuffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// ─── FileReader mock ──────────────────────────────────────────────────────────
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
});

// ─── mammoth mock ─────────────────────────────────────────────────────────────
jest.mock('mammoth', () => ({
  convertToHtml: jest.fn().mockResolvedValue({
    value: '<h1>Title</h1><p>Hello World</p>',
    messages: [],
  }),
}), { virtual: true });

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────
const mockPage = { drawText: jest.fn() };
const mockDoc = {
  addPage: jest.fn().mockReturnValue(mockPage),
  setTitle: jest.fn(),
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  embedFont: jest.fn().mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(50) }),
  save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
};

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue(mockDoc),
    load: jest.fn().mockResolvedValue(mockDoc),
  },
  StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'HelveticaBold', Courier: 'Courier', CourierBold: 'CourierBold' },
  rgb: jest.fn().mockReturnValue({}),
  degrees: jest.fn((n: number) => n),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('convertWordToPdf', () => {
  it('returns success with output blob', async () => {
    const result = await convertWordToPdf(makeDocxFile());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename ends with .pdf', async () => {
    const result = await convertWordToPdf(makeDocxFile('my_doc.docx'));
    expect(result.outputFile!.filename).toBe('my_doc.pdf');
  });

  it('output blob is application/pdf', async () => {
    const result = await convertWordToPdf(makeDocxFile());
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('returns error when mammoth throws', async () => {
    const mammoth = jest.requireMock('mammoth') as { convertToHtml: jest.Mock };
    mammoth.convertToHtml.mockRejectedValueOnce(new Error('invalid docx'));
    const result = await convertWordToPdf(makeDocxFile());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid docx/i);
  });

  it('returns error for empty mammoth output', async () => {
    const mammoth = jest.requireMock('mammoth') as { convertToHtml: jest.Mock };
    mammoth.convertToHtml.mockResolvedValueOnce({ value: '   ', messages: [] });
    const result = await convertWordToPdf(makeDocxFile());
    expect(result.success).toBe(false);
  });
});

describe('word-to-pdf layout metadata', () => {
  it('title contains Word to PDF or DOCX to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/word-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/word.+pdf|docx.+pdf/i);
  });

  it('has word-to-pdf related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/word-to-pdf/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/word to pdf|docx to pdf/);
  });

  it('canonical contains word-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/word-to-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('word-to-pdf');
  });
});
