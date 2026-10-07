/**
 * M65 — Excel to PDF tests
 */

import { convertExcelToPdf, defaultExcelToPdfOptions } from '../src/lib/pdf/excelToPdf';

function makeXlsxFile(name = 'data.xlsx'): File {
  const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  return new File([bytes.buffer as ArrayBuffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

// ─── xlsx mock ────────────────────────────────────────────────────────────────
jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1', 'Sheet2'],
    Sheets: { Sheet1: {}, Sheet2: {} },
  }),
  utils: {
    sheet_to_json: jest.fn().mockReturnValue([
      ['Name', 'Age', 'City'],
      ['Alice', '30', 'London'],
      ['Bob', '25', 'Paris'],
    ]),
  },
}), { virtual: true });

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────
const mockPage = { drawText: jest.fn() };
const mockDoc = {
  addPage: jest.fn().mockReturnValue(mockPage),
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  embedFont: jest.fn().mockResolvedValue({}),
  save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
};

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue(mockDoc),
  },
  StandardFonts: { Courier: 'Courier', CourierBold: 'CourierBold' },
  rgb: jest.fn().mockReturnValue({}),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('defaultExcelToPdfOptions', () => {
  it('has empty sheetNames (means all)', () => {
    expect(defaultExcelToPdfOptions().sheetNames).toEqual([]);
  });

  it('defaults to A4 portrait', () => {
    const opts = defaultExcelToPdfOptions();
    expect(opts.pageSize).toBe('A4');
    expect(opts.orientation).toBe('portrait');
  });

  it('default fontSize is 10', () => {
    expect(defaultExcelToPdfOptions().fontSize).toBe(10);
  });
});

describe('convertExcelToPdf', () => {
  it('returns success with output blob', async () => {
    const result = await convertExcelToPdf(makeXlsxFile(), defaultExcelToPdfOptions());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename ends with .pdf', async () => {
    const result = await convertExcelToPdf(makeXlsxFile('report.xlsx'), defaultExcelToPdfOptions());
    expect(result.outputFile!.filename).toBe('report.pdf');
  });

  it('output blob is application/pdf', async () => {
    const result = await convertExcelToPdf(makeXlsxFile(), defaultExcelToPdfOptions());
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('processes only selected sheets when sheetNames provided', async () => {
    const opts = { ...defaultExcelToPdfOptions(), sheetNames: ['Sheet1'] };
    const result = await convertExcelToPdf(makeXlsxFile(), opts);
    expect(result.success).toBe(true);
  });

  it('returns error when no valid sheets match sheetNames', async () => {
    const opts = { ...defaultExcelToPdfOptions(), sheetNames: ['NonExistent'] };
    const result = await convertExcelToPdf(makeXlsxFile(), opts);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no valid sheets/i);
  });

  it('returns error when xlsx throws', async () => {
    const xlsx = jest.requireMock('xlsx') as { read: jest.Mock };
    xlsx.read.mockImplementationOnce(() => { throw new Error('corrupt xlsx'); });
    const result = await convertExcelToPdf(makeXlsxFile(), defaultExcelToPdfOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupt xlsx/i);
  });

  it('works with landscape orientation', async () => {
    const opts = { ...defaultExcelToPdfOptions(), orientation: 'landscape' as const };
    const result = await convertExcelToPdf(makeXlsxFile(), opts);
    expect(result.success).toBe(true);
  });

  it('works with Letter page size', async () => {
    const opts = { ...defaultExcelToPdfOptions(), pageSize: 'Letter' as const };
    const result = await convertExcelToPdf(makeXlsxFile(), opts);
    expect(result.success).toBe(true);
  });
});

describe('excel-to-pdf layout metadata', () => {
  it('title contains Excel to PDF or XLSX to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/excel-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/excel.+pdf|xlsx.+pdf/i);
  });

  it('has excel-to-pdf related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/excel-to-pdf/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/excel to pdf|xlsx to pdf/);
  });

  it('canonical contains excel-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/excel-to-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('excel-to-pdf');
  });
});
