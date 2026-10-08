/**
 * M43 — Password Protect PDF tests
 * Updated for M80.2: buildProtectedPdf now returns an honest limitation error
 * because pdf-lib v1.17.1 does not support PDF encryption.
 */

import {
  defaultProtectConfig,
  generateOwnerPassword,
  buildProtectedPdf,
} from '../src/lib/pdf/protectPdf';
import type { PdfFile } from '../src/types/pdf';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

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
    expect(typeof a).toBe('string');
    expect(typeof b).toBe('string');
  });
});

// ─── buildProtectedPdf: limitation notice (M80.2) ─────────────────────────────

describe('buildProtectedPdf: encryption limitation (M80.2)', () => {
  it('always returns success: false (encryption not supported)', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'secret123' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
  });

  it('error message mentions encryption is not supported', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.error?.toLowerCase()).toContain('encryption');
  });

  it('does not attempt file read (resolves immediately)', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const fakePdfFile = {} as PdfFile; // no .file property — would crash if accessed
    await expect(buildProtectedPdf(fakePdfFile, config)).resolves.toMatchObject({ success: false });
  });

  it('error mentions pdf-lib or library limitation', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    // error should mention pdf-lib or library or browser-based
    expect(result.error).toMatch(/pdf-lib|library|browser/i);
  });

  it('returns no outputFile (there is no output)', async () => {
    const config = { ...defaultProtectConfig(), userPassword: 'pw' };
    const result = await buildProtectedPdf(makePdfFile(), config);
    expect(result.outputFile).toBeUndefined();
  });
});

// ─── protect-pdf page source audit ───────────────────────────────────────────

describe('protect-pdf page: honest limitation UI', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(path.join(ROOT, 'src/app/pdf-tools/protect-pdf/page.tsx'), 'utf8');
  });

  it('shows encryption unavailable notice', () => {
    // The notice content is inlined directly in JSX
    expect(src.toLowerCase()).toContain('not yet available');
  });

  it('notice mentions encryption', () => {
    expect(src.toLowerCase()).toContain('encryption');
  });

  it('page has no interactive form (no protect button)', () => {
    // The full form was removed; no onClick handler or form submit should exist
    expect(src).not.toContain('handleProtect');
    expect(src).not.toContain('onClick={handleProtect');
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
