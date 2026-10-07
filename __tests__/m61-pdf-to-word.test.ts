/**
 * M61 — PDF to Word tests
 */

import { defaultWordOptions, convertPdfToWord } from '../src/lib/pdf/pdfToWord';
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

// ─── docx mock ────────────────────────────────────────────────────────────────

jest.mock('docx', () => ({
  Document: jest.fn().mockImplementation(() => ({})),
  Paragraph: jest.fn().mockImplementation((opts: unknown) => opts),
  TextRun: jest.fn().mockImplementation((opts: unknown) => opts),
  HeadingLevel: { HEADING_1: 'Heading1', HEADING_2: 'Heading2' },
  Packer: {
    toBlob: jest.fn().mockResolvedValue(
      new Blob(['fake docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ),
  },
}), { virtual: true });

// ─── pdfjs mock ───────────────────────────────────────────────────────────────

const mockGetTextContent = jest.fn().mockResolvedValue({
  items: [
    { str: 'Hello World', transform: [1, 0, 0, 1, 50, 700], height: 12 },
    { str: 'SECTION HEADING', transform: [1, 0, 0, 1, 50, 650], height: 18 },
    { str: 'Body text paragraph.', transform: [1, 0, 0, 1, 50, 600], height: 10 },
  ],
});
const mockGetPage = jest.fn().mockResolvedValue({ getTextContent: mockGetTextContent });
const mockPdf = { numPages: 2, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: null },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent });
  mockPdf.numPages = 2;
  const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
  pdfjs.getDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

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

// ─── defaultWordOptions ───────────────────────────────────────────────────────

describe('defaultWordOptions', () => {
  it('has includeImages false', () => {
    expect(defaultWordOptions().includeImages).toBe(false);
  });
  it('has preserveFormatting true', () => {
    expect(defaultWordOptions().preserveFormatting).toBe(true);
  });
});

// ─── convertPdfToWord ─────────────────────────────────────────────────────────

describe('convertPdfToWord', () => {
  it('returns success', async () => {
    const result = await convertPdfToWord(makePdfFile(), defaultWordOptions());
    expect(result.success).toBe(true);
  });

  it('returns outputFile with docx blob', async () => {
    const result = await convertPdfToWord(makePdfFile(), defaultWordOptions());
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.blob.type).toContain('wordprocessingml');
  });

  it('output filename ends in .docx', async () => {
    const result = await convertPdfToWord(makePdfFile('report.pdf'), defaultWordOptions());
    expect(result.outputFile!.filename).toBe('report.docx');
  });

  it('output filename preserves base name', async () => {
    const result = await convertPdfToWord(makePdfFile('my document.pdf'), defaultWordOptions());
    expect(result.outputFile!.filename).toBe('my document.docx');
  });

  it('calls getPage for each page', async () => {
    await convertPdfToWord(makePdfFile(), defaultWordOptions());
    expect(mockGetPage).toHaveBeenCalledTimes(2);
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjs = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjs.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('bad pdf')) });
    const result = await convertPdfToWord(makePdfFile(), defaultWordOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });

  it('returns error when docx Packer throws', async () => {
    const docxMock = jest.requireMock('docx') as { Packer: { toBlob: jest.Mock } };
    docxMock.Packer.toBlob.mockRejectedValueOnce(new Error('docx pack failed'));
    const result = await convertPdfToWord(makePdfFile(), defaultWordOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/docx pack failed/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('pdf-to-word layout metadata', () => {
  it('title contains PDF to Word', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-word/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+word/i);
  });

  it('has word/docx keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-word/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to word|pdf to docx/);
  });

  it('canonical contains pdf-to-word', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-word/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-word');
  });
});
