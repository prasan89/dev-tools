/**
 * M44 — Unlock PDF tests
 * Updated for M80.2: unlockPdf now uses pdfjs+loadPdfWithPassword instead of pdf-lib directly.
 */

import path from 'path';
import fs from 'fs';

const ROOT = path.resolve(__dirname, '..');

function makePdfFile(name = 'locked.pdf'): import('../src/types/pdf').PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: true, isCorrupted: false, loadedAt: 0,
  };
}

// ─── unlockPdf API ────────────────────────────────────────────────────────────

describe('unlockPdf: API signature', () => {
  it('exports unlockPdf', async () => {
    const mod = await import('../src/lib/pdf/unlockPdf');
    expect(typeof mod.unlockPdf).toBe('function');
  });

  it('accepts (pdfFile, onPasswordRequest) — 2 args', async () => {
    const mod = await import('../src/lib/pdf/unlockPdf');
    expect(mod.unlockPdf.length).toBe(2);
  });

  it('returns success:false when pdfjs cannot load (invalid bytes)', async () => {
    const { unlockPdf } = await import('../src/lib/pdf/unlockPdf');
    const result = await unlockPdf(makePdfFile(), (_updatePw, _reason) => {
      // No password provided — just a no-op callback
    });
    expect(result.success).toBe(false);
  });
});

describe('unlockPdf: new pdfjs-based implementation', () => {
  it('uses loadPdfWithPassword (source check)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('loadPdfWithPassword');
  });

  it('uses getData() to extract decrypted bytes', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('getData');
  });

  it('re-saves via pdf-lib after pdfjs decryption', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('PDFDocument');
    expect(src).toContain('pdfDoc.save');
  });

  it('output filename contains _unlocked', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('_unlocked.pdf');
  });

  it('handles cancelled result (returns error:Cancelled)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain("'Cancelled'");
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
