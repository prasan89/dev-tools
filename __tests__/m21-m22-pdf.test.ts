/**
 * M21 + M22 — PDFTools Foundation: utility and integration tests
 *
 * Covers:
 *  - PDF type constants
 *  - File validation (type, extension, size, empty)
 *  - Magic byte detection
 *  - Filename sanitization
 *  - File size formatting
 *  - Hub page + viewer page exports
 *  - Sitemap includes pdf-tools pages
 */

import { validatePdfFile, validatePdfFiles, checkPdfMagicBytes, formatFileSize, sanitizePdfFilename } from '../src/lib/pdf/validation';
import { PDF_MAX_FILE_SIZE, PDF_LARGE_FILE_WARNING, PDF_MAX_FILES, PDF_ACCEPTED_MIME } from '../src/types/pdf';

// ─────────────────────────────────────────────
// 1. Constants
// ─────────────────────────────────────────────

describe('PDF constants', () => {
  it('PDF_MAX_FILE_SIZE is 100MB', () => {
    expect(PDF_MAX_FILE_SIZE).toBe(100 * 1024 * 1024);
  });

  it('PDF_LARGE_FILE_WARNING is 25MB', () => {
    expect(PDF_LARGE_FILE_WARNING).toBe(25 * 1024 * 1024);
  });

  it('PDF_MAX_FILES is 10', () => {
    expect(PDF_MAX_FILES).toBe(10);
  });

  it('PDF_ACCEPTED_MIME is application/pdf', () => {
    expect(PDF_ACCEPTED_MIME).toBe('application/pdf');
  });
});

// ─────────────────────────────────────────────
// 2. validatePdfFile
// ─────────────────────────────────────────────

function makeFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size).fill(0x25); // %
  return new File([content], name, { type });
}

describe('validatePdfFile', () => {
  it('accepts a valid PDF file', () => {
    const file = makeFile('document.pdf', 1024, 'application/pdf');
    expect(validatePdfFile(file)).toEqual({ valid: true });
  });

  it('accepts a PDF file with empty MIME type but .pdf extension', () => {
    const file = makeFile('document.pdf', 1024, '');
    expect(validatePdfFile(file)).toEqual({ valid: true });
  });

  it('rejects an empty file', () => {
    const file = makeFile('document.pdf', 0, 'application/pdf');
    expect(validatePdfFile(file)).toEqual({ valid: false, error: 'empty-file' });
  });

  it('rejects a file over 100MB', () => {
    const file = makeFile('huge.pdf', PDF_MAX_FILE_SIZE + 1, 'application/pdf');
    expect(validatePdfFile(file)).toEqual({ valid: false, error: 'file-too-large' });
  });

  it('accepts a file exactly at 100MB', () => {
    const file = makeFile('exact.pdf', PDF_MAX_FILE_SIZE, 'application/pdf');
    expect(validatePdfFile(file)).toEqual({ valid: true });
  });

  it('rejects a file with wrong MIME type and wrong extension', () => {
    const file = makeFile('image.jpg', 1024, 'image/jpeg');
    const result = validatePdfFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('invalid-type');
  });

  it('rejects a file with correct MIME but wrong extension', () => {
    const file = makeFile('document.txt', 1024, 'application/pdf');
    const result = validatePdfFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('invalid-extension');
  });

  it('accepts application/octet-stream with .pdf extension', () => {
    const file = makeFile('document.pdf', 512, 'application/octet-stream');
    const result = validatePdfFile(file);
    expect(result.valid).toBe(true);
  });

  it('is case-insensitive for .pdf extension', () => {
    const file = makeFile('document.PDF', 512, 'application/pdf');
    expect(validatePdfFile(file)).toEqual({ valid: true });
  });
});

// ─────────────────────────────────────────────
// 3. validatePdfFiles
// ─────────────────────────────────────────────

describe('validatePdfFiles', () => {
  it('validates multiple files independently', () => {
    const files = [
      makeFile('good.pdf', 1024, 'application/pdf'),
      makeFile('bad.txt', 1024, 'text/plain'),
      makeFile('empty.pdf', 0, 'application/pdf'),
    ];
    const results = validatePdfFiles(files);
    expect(results).toHaveLength(3);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(false);
    expect(results[2].error).toBe('empty-file');
  });

  it('returns empty array for empty input', () => {
    expect(validatePdfFiles([])).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 4. checkPdfMagicBytes
// ─────────────────────────────────────────────

describe('checkPdfMagicBytes', () => {
  it('returns valid for a file starting with %PDF-', async () => {
    const bytes = new TextEncoder().encode('%PDF-1.4 test content');
    const file = new File([bytes], 'test.pdf', { type: 'application/pdf' });
    const result = await checkPdfMagicBytes(file);
    expect(result.valid).toBe(true);
  });

  it('returns corrupted for a file NOT starting with %PDF-', async () => {
    const bytes = new TextEncoder().encode('JFIF fake content');
    const file = new File([bytes], 'fake.pdf', { type: 'application/pdf' });
    const result = await checkPdfMagicBytes(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('corrupted');
  });

  it('returns corrupted for an empty file', async () => {
    const file = new File([], 'empty.pdf', { type: 'application/pdf' });
    const result = await checkPdfMagicBytes(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('corrupted');
  });

  it('handles partial %PDF- match correctly (only 4 chars)', async () => {
    const bytes = new TextEncoder().encode('%PDF');
    const file = new File([bytes], 'short.pdf', { type: 'application/pdf' });
    const result = await checkPdfMagicBytes(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('corrupted');
  });
});

// ─────────────────────────────────────────────
// 5. formatFileSize
// ─────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 1023)).toBe('1023.0 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(1024 * 1024 * 25)).toBe('25.0 MB');
    expect(formatFileSize(1024 * 1024 * 100)).toBe('100.0 MB');
  });

  it('handles large MB values', () => {
    const size = 1024 * 1024 * 99.5;
    expect(formatFileSize(size)).toContain('MB');
  });
});

// ─────────────────────────────────────────────
// 6. sanitizePdfFilename
// ─────────────────────────────────────────────

describe('sanitizePdfFilename', () => {
  it('keeps safe characters', () => {
    expect(sanitizePdfFilename('my-document.pdf')).toBe('my-document.pdf');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizePdfFilename('my document.pdf')).toBe('my_document.pdf');
  });

  it('removes special characters', () => {
    expect(sanitizePdfFilename('file!@#$.pdf')).toBe('file____.pdf');
  });

  it('ensures .pdf extension', () => {
    expect(sanitizePdfFilename('document')).toBe('document.pdf');
  });

  it('handles uppercase .PDF extension', () => {
    expect(sanitizePdfFilename('REPORT.PDF')).toBe('REPORT.pdf');
  });

  it('handles path traversal attempts', () => {
    const sanitized = sanitizePdfFilename('../../../etc/passwd.pdf');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('\\');
    expect(sanitized.endsWith('.pdf')).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. PDF types exports
// ─────────────────────────────────────────────

describe('PDF type exports', () => {
  it('exports all required constants', async () => {
    const types = await import('../src/types/pdf');
    expect(typeof types.PDF_MAX_FILE_SIZE).toBe('number');
    expect(typeof types.PDF_LARGE_FILE_WARNING).toBe('number');
    expect(typeof types.PDF_ACCEPTED_MIME).toBe('string');
    expect(typeof types.PDF_ACCEPTED_EXTENSION).toBe('string');
    expect(typeof types.PDF_MAX_FILES).toBe('number');
  });

  it('PDF_ACCEPTED_EXTENSION is .pdf', async () => {
    const { PDF_ACCEPTED_EXTENSION } = await import('../src/types/pdf');
    expect(PDF_ACCEPTED_EXTENSION).toBe('.pdf');
  });
});

// ─────────────────────────────────────────────
// 8. Hub page and viewer page structure
// ─────────────────────────────────────────────

describe('PDF Tools hub page structure', () => {
  it('hub page module exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    expect(typeof mod.default).toBe('function');
  });

  it('hub page exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    const meta = mod.metadata as { title: string; description: string };
    expect(meta.title).toContain('PDF Tools');
    expect(typeof meta.description).toBe('string');
    expect(meta.description.length).toBeGreaterThan(50);
  });

  it('viewer page exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/viewer/page');
    expect(typeof mod.default).toBe('function');
  });
});

// ─────────────────────────────────────────────
// 9. Sitemap includes pdf-tools pages
// ─────────────────────────────────────────────

describe('Sitemap includes pdf-tools pages', () => {
  let sitemapEntries: { url: string }[];

  beforeAll(async () => {
    const mod = await import('../src/app/sitemap');
    sitemapEntries = mod.default() as { url: string }[];
  });

  it('/pdf-tools is in sitemap', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SITE_URL } = require('../src/lib/seo/site-config');
    expect(sitemapEntries.some((e) => e.url === `${SITE_URL}/pdf-tools`)).toBe(true);
  });

  it('/pdf-tools/viewer is NOT in sitemap (removed, internal page)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SITE_URL } = require('../src/lib/seo/site-config');
    expect(sitemapEntries.some((e) => e.url === `${SITE_URL}/pdf-tools/viewer`)).toBe(false);
  });
});
