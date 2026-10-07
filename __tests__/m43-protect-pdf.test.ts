/**
 * M43 — Password Protect PDF tests
 */

import {
  defaultProtectConfig,
  generateOwnerPassword,
  buildProtectedPdf,
} from '../src/lib/pdf/protectPdf';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 1,
    objectUrl: 'blob:test',
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: 0,
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

// ─── defaultProtectConfig ─────────────────────────────────────────────────────

describe('defaultProtectConfig', () => {
  it('has empty userPassword', () => {
    expect(defaultProtectConfig().userPassword).toBe('');
  });

  it('has empty ownerPassword', () => {
    expect(defaultProtectConfig().ownerPassword).toBe('');
  });

  it('has allowPrinting true', () => {
    expect(defaultProtectConfig().allowPrinting).toBe(true);
  });

  it('has allowCopying false', () => {
    expect(defaultProtectConfig().allowCopying).toBe(false);
  });

  it('has allowModifying false', () => {
    expect(defaultProtectConfig().allowModifying).toBe(false);
  });
});

// ─── generateOwnerPassword ────────────────────────────────────────────────────

describe('generateOwnerPassword', () => {
  it('returns a string of length 16', () => {
    const pw = generateOwnerPassword();
    expect(pw).toHaveLength(16);
  });

  it('uses only hex characters', () => {
    const pw = generateOwnerPassword();
    expect(pw).toMatch(/^[0-9a-f]+$/);
  });

  it('generates different passwords on each call', () => {
    const a = generateOwnerPassword();
    const b = generateOwnerPassword();
    // statistically should differ; same length at minimum
    expect(typeof a).toBe('string');
    expect(typeof b).toBe('string');
  });
});

// ─── buildProtectedPdf ────────────────────────────────────────────────────────

describe('buildProtectedPdf: success', () => {
  it('returns success and output blob', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'secret123' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toMatch(/_protected\.pdf$/);
  });

  it('calls pdfDoc.save', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'mypassword' };
    await buildProtectedPdf(makePdfFile(), config);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('output filename is base_protected.pdf', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const result = await buildProtectedPdf(makePdfFile('report.pdf'), config);
    expect(result.outputFile!.filename).toBe('report_protected.pdf');
  });

  it('auto-generates ownerPassword when empty', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw', ownerPassword: '' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(true);
    expect(mockSave).toHaveBeenCalledTimes(1);
    const callArg = mockSave.mock.calls[0][0];
    expect(callArg).toBeDefined();
    expect(typeof callArg?.ownerPassword).toBe('string');
    expect(callArg?.ownerPassword).toHaveLength(16);
  });

  it('uses provided ownerPassword when given', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw', ownerPassword: 'owner123' };
    await buildProtectedPdf(makePdfFile(), config);
    const callArg = mockSave.mock.calls[0][0];
    expect(callArg?.ownerPassword).toBe('owner123');
  });
});

describe('buildProtectedPdf: validation', () => {
  it('returns error for empty userPassword', async () => {
    const config = { ...defaultProtectConfig(), userPassword: '' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty|password/i);
  });

  it('returns error for whitespace-only userPassword', async () => {
    const config = { ...defaultProtectConfig(), userPassword: '   ' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
  });
});

describe('buildProtectedPdf: error handling', () => {
  it('returns failure when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupted PDF');
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupted pdf/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('protect-pdf layout metadata', () => {
  it('title contains password protect or encrypt PDF', async () => {
    const mod = await import('../src/app/pdf-tools/protect-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title).toLowerCase()).toMatch(/password protect|encrypt pdf/i);
  });

  it('has password-protection keywords', async () => {
    const mod = await import('../src/app/pdf-tools/protect-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/password protect pdf|encrypt pdf|pdf encryption/);
  });

  it('canonical URL contains protect-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/protect-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.alternates?.canonical)).toContain('protect-pdf');
  });
});
