/**
 * M62 — PDF to Excel tests
 */

import {
  defaultExcelOptions,
  extractTablesFromTextItems,
  convertPdfToExcel,
} from '../src/lib/pdf/pdfToExcel';
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

// ─── xlsx mock ────────────────────────────────────────────────────────────────

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn().mockReturnValue({}),
    aoa_to_sheet: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}), { virtual: true });

// ─── pdfjs mock ───────────────────────────────────────────────────────────────

const mockTextContent = {
  items: [
    { str: 'Name', transform: [1, 0, 0, 1, 10, 700], height: 12 },
    { str: 'Age',  transform: [1, 0, 0, 1, 200, 700], height: 12 },
    { str: 'Alice', transform: [1, 0, 0, 1, 10, 680], height: 12 },
    { str: '30',   transform: [1, 0, 0, 1, 200, 680], height: 12 },
  ],
};

const mockGetPage = jest.fn().mockResolvedValue({
  getTextContent: jest.fn().mockResolvedValue(mockTextContent),
});

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: null },
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({ numPages: 1, getPage: mockGetPage }),
  }),
}));

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
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
  const xlsxMod = jest.requireMock('xlsx') as { write: jest.Mock };
  xlsxMod.write.mockReturnValue(new Uint8Array([1, 2, 3]));
  const pdfjsMod = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
  pdfjsMod.getDocument.mockReturnValue({
    promise: Promise.resolve({ numPages: 1, getPage: mockGetPage }),
  });
  mockGetPage.mockResolvedValue({
    getTextContent: jest.fn().mockResolvedValue(mockTextContent),
  });
});

// ─── defaultExcelOptions ──────────────────────────────────────────────────────

describe('defaultExcelOptions', () => {
  it('returns pageSelection all', () => {
    expect(defaultExcelOptions().pageSelection).toBe('all');
  });
  it('returns tolerance 5', () => {
    expect(defaultExcelOptions().tolerance).toBe(5);
  });
});

// ─── extractTablesFromTextItems ───────────────────────────────────────────────

describe('extractTablesFromTextItems', () => {
  it('groups items on same y-level into one row', () => {
    const items = [
      { str: 'A', transform: [1, 0, 0, 1, 10, 700], height: 12 },
      { str: 'B', transform: [1, 0, 0, 1, 200, 700], height: 12 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows).toHaveLength(1);
    expect(rows[0].cells).toEqual(['A', 'B']);
  });

  it('creates separate rows for different y-levels', () => {
    const items = [
      { str: 'Header', transform: [1, 0, 0, 1, 10, 700], height: 12 },
      { str: 'Value',  transform: [1, 0, 0, 1, 10, 680], height: 12 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows).toHaveLength(2);
  });

  it('sorts cells by x-position within a row', () => {
    const items = [
      { str: 'Z', transform: [1, 0, 0, 1, 300, 700], height: 12 },
      { str: 'A', transform: [1, 0, 0, 1, 10,  700], height: 12 },
      { str: 'M', transform: [1, 0, 0, 1, 150, 700], height: 12 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows[0].cells).toEqual(['A', 'M', 'Z']);
  });

  it('ignores empty/whitespace strings', () => {
    const items = [
      { str: '   ', transform: [1, 0, 0, 1, 10, 700], height: 12 },
      { str: 'OK',  transform: [1, 0, 0, 1, 50, 700], height: 12 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows[0].cells).toEqual(['OK']);
  });

  it('returns empty array for empty input', () => {
    expect(extractTablesFromTextItems([], 5)).toEqual([]);
  });

  it('groups items within tolerance into same row', () => {
    // y=700 and y=702 both round to 700 with tolerance=5 (Math.round(702/5)*5=700)
    const items = [
      { str: 'A', transform: [1, 0, 0, 1, 10, 700], height: 12 },
      { str: 'B', transform: [1, 0, 0, 1, 200, 702], height: 12 },
    ];
    const rows = extractTablesFromTextItems(items, 5);
    expect(rows).toHaveLength(1);
  });
});

// ─── convertPdfToExcel ────────────────────────────────────────────────────────

describe('convertPdfToExcel', () => {
  it('returns success with xlsx blob', async () => {
    const result = await convertPdfToExcel(makePdfFile(), defaultExcelOptions());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename ends with .xlsx', async () => {
    const result = await convertPdfToExcel(makePdfFile('report.pdf'), defaultExcelOptions());
    expect(result.outputFile!.filename).toBe('report.xlsx');
  });

  it('output blob has xlsx MIME type', async () => {
    const result = await convertPdfToExcel(makePdfFile(), defaultExcelOptions());
    expect(result.outputFile!.blob.type).toContain('spreadsheetml');
  });

  it('returns error when pdfjs throws', async () => {
    const pdfjsMod = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfjsMod.getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('bad pdf')) });
    const result = await convertPdfToExcel(makePdfFile(), defaultExcelOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });
});

// ─── layout SEO ───────────────────────────────────────────────────────────────

describe('pdf-to-excel layout metadata', () => {
  it('title contains PDF to Excel', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-excel/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+excel/i);
  });
  it('has relevant keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-excel/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to excel|pdf to xlsx|extract table/i);
  });
  it('canonical contains pdf-to-excel', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-excel/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-excel');
  });
});
