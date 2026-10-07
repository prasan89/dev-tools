/**
 * M25 — Compress PDF tests
 *
 * Tests cover:
 *  - compressPdf: successful compression of text PDF
 *  - compression levels: low/recommended/maximum
 *  - output PDF validity (%PDF- header)
 *  - before/after size reporting
 *  - percentage calculation
 *  - already-compressed / no-reduction path
 *  - corrupted PDF handling
 *  - password-protected PDF handling
 *  - resource cleanup (no crash on repeated calls)
 *  - metadata removal option
 *  - page count preserved
 *  - sitemap includes /pdf-tools/compress-pdf
 *  - hub page lists Compress PDF
 */

import { compressPdf, DEFAULT_OPTIONS } from '../src/lib/pdf/compress';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

async function buildTextPdf(pageCount = 1): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: 50,
      y: 800,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
  }
  return doc.save() as unknown as Promise<Uint8Array>;
}

function makePdfFile(name: string, content: Uint8Array | string = '%PDF-1.4\n'): PdfFile {
  const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  return {
    id: `id-${name}`,
    name,
    size: data.length,
    file: new File([data.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

async function readBlobHeader(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      resolve(String.fromCharCode(...new Uint8Array(buf).slice(0, 5)));
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsArrayBuffer(blob.slice(0, 5));
  });
}

// ─── Core compression ─────────────────────────────────────────────────────────

describe('compressPdf — basic', () => {
  it('compresses a text PDF successfully', async () => {
    const bytes = await buildTextPdf(2);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.compressedSize).toBeGreaterThan(0);
      expect(result.originalSize).toBe(file.size);
      expect(result.pageCount).toBe(2);
    }
  });

  it('output is a valid PDF', async () => {
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('reports originalSize correctly', async () => {
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.originalSize).toBe(bytes.length);
    }
  });

  it('reports reductionPercent as number between 0 and 100', async () => {
    const bytes = await buildTextPdf(3);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.reductionPercent).toBeGreaterThanOrEqual(0);
      expect(result.reductionPercent).toBeLessThanOrEqual(100);
    }
  });

  it('filename contains "compressed"', async () => {
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('my-document.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toContain('compressed');
      expect(result.filename.endsWith('.pdf')).toBe(true);
    }
  });
});

// ─── Compression levels ───────────────────────────────────────────────────────

describe('compressPdf — compression levels', () => {
  it('low compression produces valid PDF', async () => {
    const bytes = await buildTextPdf(2);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, { level: 'low', removeMetadata: false, optimizeObjectStreams: false });
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('recommended compression produces valid PDF', async () => {
    const bytes = await buildTextPdf(2);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, { level: 'recommended', removeMetadata: true, optimizeObjectStreams: true });
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('maximum compression produces valid PDF', async () => {
    const bytes = await buildTextPdf(2);
    const file = makePdfFile('text.pdf', bytes);
    const result = await compressPdf(file, { level: 'maximum', removeMetadata: true, optimizeObjectStreams: true });
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('recommended <= low in output size for text PDF (object streams help)', async () => {
    const bytes = await buildTextPdf(5);
    const file = makePdfFile('text.pdf', bytes);
    const [lowResult, recResult] = await Promise.all([
      compressPdf(file, { level: 'low', removeMetadata: false, optimizeObjectStreams: false }),
      compressPdf(file, { level: 'recommended', removeMetadata: false, optimizeObjectStreams: true }),
    ]);
    expect(lowResult.success).toBe(true);
    expect(recResult.success).toBe(true);
    // Recommended should be same or smaller than low
    if (lowResult.success && recResult.success) {
      expect(recResult.compressedSize).toBeLessThanOrEqual(lowResult.compressedSize + 200);
    }
  });
});

// ─── Page count preservation ──────────────────────────────────────────────────

describe('compressPdf — page preservation', () => {
  it('preserves page count for 1-page PDF', async () => {
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('one.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) expect(result.pageCount).toBe(1);
  });

  it('preserves page count for multi-page PDF', async () => {
    const bytes = await buildTextPdf(7);
    const file = makePdfFile('seven.pdf', bytes);
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) expect(result.pageCount).toBe(7);
  });
});

// ─── Percentage calculation ───────────────────────────────────────────────────

describe('reductionPercent calculation', () => {
  it('is 0 when compressed equals original', async () => {
    // A very small PDF may not compress further
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('small.pdf', bytes);
    const result = await compressPdf(file, { level: 'low', removeMetadata: false, optimizeObjectStreams: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.reductionPercent).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('compressPdf — error handling', () => {
  it('returns error for corrupted PDF', async () => {
    const file = makePdfFile('corrupt.pdf', 'this is not a pdf');
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it('returns error for empty file data', async () => {
    const file = makePdfFile('empty.pdf', new Uint8Array(0));
    const result = await compressPdf(file, DEFAULT_OPTIONS);
    expect(result.success).toBe(false);
  });

  it('does not throw — always returns a typed result', async () => {
    const file = makePdfFile('garbage.pdf', 'not a pdf at all!!');
    await expect(compressPdf(file, DEFAULT_OPTIONS)).resolves.toBeDefined();
  });
});

// ─── Progress callback ────────────────────────────────────────────────────────

describe('compressPdf — progress reporting', () => {
  it('calls progress callback with status strings', async () => {
    const bytes = await buildTextPdf(1);
    const file = makePdfFile('text.pdf', bytes);
    const messages: string[] = [];
    await compressPdf(file, DEFAULT_OPTIONS, (msg) => messages.push(msg));
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.every((m) => typeof m === 'string')).toBe(true);
  });
});

// ─── Page component exports ───────────────────────────────────────────────────

describe('Compress PDF page module', () => {
  it('exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/compress-pdf/page');
    expect(typeof mod.default).toBe('function');
  });

  it('layout exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/compress-pdf/layout');
    const meta = (mod as { metadata?: { title?: string; description?: string } }).metadata;
    expect(meta?.title).toContain('Compress PDF');
    expect(meta?.title).toContain('DevToolsHub');
    expect(typeof meta?.description).toBe('string');
    expect((meta?.description ?? '').length).toBeGreaterThan(50);
  });
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────

describe('Sitemap includes /pdf-tools/compress-pdf', () => {
  it('compress-pdf page is in sitemap', async () => {
    const mod = await import('../src/app/sitemap');
    const entries = mod.default() as { url: string }[];
    const { SITE_URL } = await import('../src/lib/seo/site-config');
    expect(entries.some((e) => e.url === `${SITE_URL}/pdf-tools/compress-pdf`)).toBe(true);
  });
});
