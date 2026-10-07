/**
 * M48 — PDF/A Converter tests
 */

import { convertToPdfA } from '../src/lib/pdf/pdfAConverter';
import type { PdfALevel } from '../src/lib/pdf/pdfAConverter';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  setSubject: jest.fn(),
  setModificationDate: jest.fn(),
  save: mockSave,
};

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

describe('convertToPdfA', () => {
  const levels: PdfALevel[] = ['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'];

  it('returns success with _pdfa.pdf filename', async () => {
    const result = await convertToPdfA(makePdfFile('report.pdf'), 'PDF/A-1b');
    expect(result.success).toBe(true);
    expect(result.outputFile!.filename).toBe('report_pdfa.pdf');
  });

  it('output blob is application/pdf', async () => {
    const result = await convertToPdfA(makePdfFile(), 'PDF/A-1b');
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  levels.forEach((level) => {
    it(`converts with level ${level}`, async () => {
      const result = await convertToPdfA(makePdfFile(), level);
      expect(result.success).toBe(true);
      expect(mockDoc.setSubject).toHaveBeenCalledWith(expect.stringContaining(level));
    });
  });

  it('sets producer and creator metadata', async () => {
    await convertToPdfA(makePdfFile(), 'PDF/A-1b');
    expect(mockDoc.setProducer).toHaveBeenCalled();
    expect(mockDoc.setCreator).toHaveBeenCalled();
  });

  it('returns error when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('bad pdf data');
    const result = await convertToPdfA(makePdfFile(), 'PDF/A-1b');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf data/i);
  });
});

describe('pdf-a layout metadata', () => {
  it('title contains PDF/A', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-a/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/PDF\/A/i);
  });

  it('has archiving-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-a/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf\/a|archiv/);
  });

  it('canonical url contains pdf-a', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-a/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-a');
  });
});
