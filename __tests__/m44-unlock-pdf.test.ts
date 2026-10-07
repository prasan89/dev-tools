/**
 * M44 — Unlock PDF tests
 */

import { unlockPdf } from '../src/lib/pdf/unlockPdf';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'locked.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: true, isCorrupted: false, loadedAt: 0,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

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

// ─── unlockPdf ────────────────────────────────────────────────────────────────

describe('unlockPdf: success', () => {
  it('returns success with output blob', async () => {
    const result = await unlockPdf(makePdfFile(), 'correct');
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename contains _unlocked', async () => {
    const result = await unlockPdf(makePdfFile('report.pdf'), 'pw');
    expect(result.outputFile!.filename).toBe('report_unlocked.pdf');
  });

  it('output blob is pdf type', async () => {
    const result = await unlockPdf(makePdfFile(), 'pw');
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('calls PDFDocument.load', async () => {
    await unlockPdf(makePdfFile(), 'mypassword');
    const pdfLib = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
    expect(pdfLib.PDFDocument.load).toHaveBeenCalled();
  });
});

describe('unlockPdf: wrong password error', () => {
  it('returns "Incorrect password" for password error', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('password required');
    const result = await unlockPdf(makePdfFile(), 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/incorrect password/i);
  });

  it('returns "Incorrect password" for encrypted error', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('failed to decrypt');
    const result = await unlockPdf(makePdfFile(), 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/incorrect password/i);
  });

  it('propagates non-password errors', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupted pdf data');
    const result = await unlockPdf(makePdfFile(), 'pw');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('unlock-pdf layout metadata', () => {
  it('title contains unlock PDF or remove password', async () => {
    const mod = await import('../src/app/pdf-tools/unlock-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/unlock|remove password/i);
  });

  it('canonical url contains unlock-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/unlock-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('unlock-pdf');
  });
});
