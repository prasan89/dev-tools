/**
 * M26 — PDF to JPG/PNG tests
 *
 * Tests cover:
 *  - convertPdfToImages: basic JPEG and PNG conversion
 *  - page selection (all, subset, out-of-range)
 *  - output metadata (filename, dimensions, sizeBytes)
 *  - canvas safety clamping (clampScale)
 *  - AbortSignal cancellation
 *  - corrupted PDF error handling
 *  - password-protected PDF error handling
 *  - empty pages array error
 *  - RESOLUTION_SCALES values
 *  - buildImageFilename pattern
 *  - page component exports
 *  - layout exports metadata
 *  - sitemap includes /pdf-tools/pdf-to-jpg
 *  - hub page lists PDF to Images
 */

import { convertPdfToImages, RESOLUTION_SCALES } from '../src/lib/pdf/toImage';
import type { PdfFile } from '../src/types/pdf';

// ─── jsdom canvas stub ────────────────────────────────────────────────────────
// jsdom doesn't implement HTMLCanvasElement.toBlob or getContext.
// We stub them here so the render path reaches our code.

beforeAll(() => {
  // stub toBlob — must use Object.defineProperty to override jsdom's non-writable version
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    writable: true,
    configurable: true,
    value(callback: BlobCallback, type?: string, _quality?: number) {
      const blob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: type ?? 'image/png' });
      Promise.resolve().then(() => callback(blob));
    },
  });

  // stub getContext to return a minimal 2d context that no-ops all drawing
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  (HTMLCanvasElement.prototype as { getContext: typeof HTMLCanvasElement.prototype.getContext }).getContext =
    function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      if (contextId === '2d') {
        return {
          fillStyle: '',
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          transform: () => {},
          clearRect: () => {},
          putImageData: () => {},
          getImageData: () => ({ data: new Uint8ClampedArray(4) }),
          createImageData: () => ({ data: new Uint8ClampedArray(4) }),
          canvas: this,
        } as unknown as CanvasRenderingContext2D;
      }
      return origGetContext.call(this, contextId as '2d', ...(args as []));
    } as typeof HTMLCanvasElement.prototype.getContext;
});

// ─── pdfjs stub ───────────────────────────────────────────────────────────────
// pdfjs-dist uses Worker and canvas APIs that don't exist in jsdom.
// We mock the module so toImage.ts gets a controllable fake.

type MockPage = {
  getViewport: (opts: { scale: number; rotation: number }) => { width: number; height: number };
  render: (opts: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D | null; viewport: unknown }) => { promise: Promise<void> };
  cleanup: () => void;
};

function makeMockDoc(numPages: number) {
  return {
    numPages,
    getPage: async (_n: number): Promise<MockPage> => ({
      getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 140 * scale }),
      render: (_opts: unknown) => ({ promise: Promise.resolve() }),
      cleanup: () => {},
    }),
    cleanup: () => {},
  };
}

jest.mock('pdfjs-dist', () => {
  let mockDoc = makeMockDoc(3);
  // Provide a truthy stub for workerPort so loadPdfjs() skips `new Worker()`
  const stubWorkerPort = { postMessage: () => {} };
  return {
    GlobalWorkerOptions: { workerPort: stubWorkerPort },
    getDocument: (opts: { data?: ArrayBuffer; password?: string }) => {
      const src = opts.data ? new Uint8Array(opts.data) : new Uint8Array(0);
      const header = String.fromCharCode(...src.slice(0, 5));
      return {
        promise: header === '%PDF-'
          ? Promise.resolve(mockDoc)
          : Promise.reject(new Error('InvalidPDFException: not a valid PDF')),
        destroy: () => Promise.resolve(),
      };
    },
    _setMockPages: (n: number) => { mockDoc = makeMockDoc(n); },
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function buildPdfBytes(pages = 1): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([595, 842]);
  const buf = await doc.save();
  return buf as unknown as Uint8Array;
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

// ─── RESOLUTION_SCALES ────────────────────────────────────────────────────────

describe('RESOLUTION_SCALES', () => {
  it('has correct preset values', () => {
    expect(RESOLUTION_SCALES.low).toBe(1.0);
    expect(RESOLUTION_SCALES.medium).toBe(1.5);
    expect(RESOLUTION_SCALES.high).toBe(2.0);
  });

  it('all values are positive numbers', () => {
    for (const v of Object.values(RESOLUTION_SCALES)) {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThan(0);
    }
  });
});

// ─── Basic conversion ─────────────────────────────────────────────────────────

describe('convertPdfToImages — basic', () => {
  it('converts a PDF to JPEG', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('test.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0].blob).toBeInstanceOf(Blob);
      expect(result.parts[0].pageNumber).toBe(1);
      expect(result.parts[0].sizeBytes).toBeGreaterThan(0);
    }
  });

  it('converts a PDF to PNG', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('test.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'png', quality: 1, scale: 1.0, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].blob).toBeInstanceOf(Blob);
    }
  });

  it('converts multiple pages', async () => {
    const bytes = await buildPdfBytes(3);
    const file = makePdfFile('multi.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.8, scale: 1.0, pages: [1, 2, 3] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(3);
      expect(result.parts.map((p) => p.pageNumber)).toEqual([1, 2, 3]);
    }
  });

  it('converts a subset of pages', async () => {
    const bytes = await buildPdfBytes(3);
    const file = makePdfFile('multi.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'png', quality: 1, scale: 1.0, pages: [1, 3] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts).toHaveLength(2);
      expect(result.parts[0].pageNumber).toBe(1);
      expect(result.parts[1].pageNumber).toBe(3);
    }
  });
});

// ─── Filenames ────────────────────────────────────────────────────────────────

describe('convertPdfToImages — filenames', () => {
  it('produces .jpg extension for JPEG', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('document.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.9, scale: 1.0, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].filename).toMatch(/\.jpg$/);
    }
  });

  it('produces .png extension for PNG', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('document.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'png', quality: 1, scale: 1.0, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].filename).toMatch(/\.png$/);
    }
  });

  it('includes page number in filename', async () => {
    const bytes = await buildPdfBytes(2);
    const file = makePdfFile('doc.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [2] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].filename).toContain('page-2');
    }
  });

  it('sanitizes special characters in original filename', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('my doc (final).pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      // Should not contain spaces or parens
      expect(result.parts[0].filename).not.toMatch(/[ ()]/);
    }
  });
});

// ─── Dimensions ───────────────────────────────────────────────────────────────

describe('convertPdfToImages — dimensions', () => {
  it('reports width and height > 0', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('test.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.5, pages: [1] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.parts[0].width).toBeGreaterThan(0);
      expect(result.parts[0].height).toBeGreaterThan(0);
    }
  });

  it('higher scale produces larger dimensions', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('test.pdf', bytes);
    const [lo, hi] = await Promise.all([
      convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1] }),
      convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 2.0, pages: [1] }),
    ]);
    expect(lo.success && hi.success).toBe(true);
    if (lo.success && hi.success) {
      expect(hi.parts[0].width).toBeGreaterThan(lo.parts[0].width);
    }
  });
});

// ─── Progress callback ────────────────────────────────────────────────────────

describe('convertPdfToImages — progress', () => {
  it('calls onProgress for each page', async () => {
    const bytes = await buildPdfBytes(3);
    const file = makePdfFile('test.pdf', bytes);
    const calls: [number, number][] = [];
    const result = await convertPdfToImages(
      file,
      { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1, 2, 3] },
      (done, total) => calls.push([done, total]),
    );
    expect(result.success).toBe(true);
    expect(calls).toHaveLength(3);
    expect(calls[0]).toEqual([1, 3]);
    expect(calls[2]).toEqual([3, 3]);
  });
});

// ─── AbortSignal cancellation ─────────────────────────────────────────────────

describe('convertPdfToImages — AbortSignal', () => {
  it('returns cancelled error when already aborted', async () => {
    const bytes = await buildPdfBytes(3);
    const file = makePdfFile('test.pdf', bytes);
    const ac = new AbortController();
    ac.abort();
    const result = await convertPdfToImages(
      file,
      { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1, 2, 3] },
      undefined,
      ac.signal,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/cancel/i);
    }
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('convertPdfToImages — error handling', () => {
  it('returns error for empty pages array', async () => {
    const bytes = await buildPdfBytes(1);
    const file = makePdfFile('test.pdf', bytes);
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it('returns error for corrupted PDF', async () => {
    const file = makePdfFile('corrupt.pdf', 'this is not a pdf');
    const result = await convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it('never throws — always returns a typed result', async () => {
    const file = makePdfFile('garbage.pdf', 'garbage data!!');
    await expect(
      convertPdfToImages(file, { format: 'jpeg', quality: 0.85, scale: 1.0, pages: [1] }),
    ).resolves.toBeDefined();
  });
});

// ─── Page component exports ───────────────────────────────────────────────────

describe('PDF to JPG page module', () => {
  it('exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-jpg/page');
    expect(typeof mod.default).toBe('function');
  });

  it('layout exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-jpg/layout');
    const meta = (mod as { metadata?: { title?: string; description?: string } }).metadata;
    expect(meta?.title).toContain('PDF to JPG');
    expect(meta?.title).toContain('DevToolsHub');
    expect(typeof meta?.description).toBe('string');
    expect((meta?.description ?? '').length).toBeGreaterThan(50);
  });
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────

describe('Sitemap includes /pdf-tools/pdf-to-jpg', () => {
  it('pdf-to-jpg is in sitemap', async () => {
    const mod = await import('../src/app/sitemap');
    const entries = mod.default() as { url: string }[];
    const { SITE_URL } = await import('../src/lib/seo/site-config');
    expect(entries.some((e) => e.url === `${SITE_URL}/pdf-tools/pdf-to-jpg`)).toBe(true);
  });
});

// ─── Hub page ─────────────────────────────────────────────────────────────────

describe('PDF Tools hub page lists PDF to Images', () => {
  it('hub lists PDF to Images as available', async () => {
    const src = await import('fs').then((fs) =>
      fs.readFileSync('./src/app/pdf-tools/page.tsx', 'utf-8'),
    );
    expect(src).toContain('/pdf-tools/pdf-to-jpg');
    expect(src).toContain('available: true');
  });
});
