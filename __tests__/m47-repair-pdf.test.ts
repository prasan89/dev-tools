/**
 * M47 — Repair PDF tests
 */

import { repairPdf } from '../src/lib/pdf/repairPdf';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'broken.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 1, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: true, loadedAt: 0,
  };
}

const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = { save: mockSave };

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
  };
  return {
    PDFDocument,
    __throwOnLoad: (msg: string) => {
      _throw = msg;
      PDFDocument.load = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetLoad: () => {
      _throw = null;
      PDFDocument.load = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

describe('repairPdf', () => {
  it('returns success with repaired PDF blob', async () => {
    const result = await repairPdf(makePdfFile());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename contains _repaired', async () => {
    const result = await repairPdf(makePdfFile('document.pdf'));
    expect(result.outputFile!.filename).toBe('document_repaired.pdf');
  });

  it('output blob type is application/pdf', async () => {
    const result = await repairPdf(makePdfFile());
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('calls PDFDocument.load', async () => {
    await repairPdf(makePdfFile());
    const pdfLib = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
    expect(pdfLib.PDFDocument.load).toHaveBeenCalled();
  });

  it('returns error when pdf-lib throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('invalid xref');
    const result = await repairPdf(makePdfFile());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unable to repair/i);
  });

  it('error message includes original error', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('missing end of file marker');
    const result = await repairPdf(makePdfFile());
    expect(result.error).toMatch(/missing end of file marker/i);
  });

  it('error message mentions severely corrupted', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('bad data');
    const result = await repairPdf(makePdfFile());
    expect(result.error).toMatch(/severely corrupted/i);
  });
});

describe('repair-pdf layout metadata', () => {
  it('title contains repair PDF', async () => {
    const mod = await import('../src/app/pdf-tools/repair-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/repair.+pdf/i);
  });

  it('has repair-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/repair-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/repair pdf|fix corrupt|pdf repair/);
  });

  it('canonical url contains repair-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/repair-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('repair-pdf');
  });
});
