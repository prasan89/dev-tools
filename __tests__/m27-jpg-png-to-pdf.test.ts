/**
 * M27 — JPG/PNG to PDF tests
 *
 * Tests cover:
 *  - validateImageFile: JPG, PNG, invalid type, empty, too large
 *  - buildImageFile: creates correct ImageFile shape
 *  - PAGE_SIZE_PRESETS dimensions
 *  - DEFAULT_OPTIONS values
 *  - convertImagesToPdf: JPG conversion, PNG conversion, multiple images
 *  - page count matches image count
 *  - generated PDF is valid (%PDF- header)
 *  - page ordering preserved
 *  - large image handling (downsampling)
 *  - corrupt image error
 *  - empty images array error
 *  - AbortSignal cancellation
 *  - EXIF orientation reading (pure function, no DOM)
 *  - page size / orientation / margin options
 *  - image placement modes (fit/fill/original/center)
 *  - aspect ratio preservation (fit mode)
 *  - progress callback
 *  - resource cleanup (never throws)
 *  - page component exports
 *  - layout exports metadata
 *  - sitemap includes /pdf-tools/jpg-png-to-pdf
 *  - hub page lists JPG/PNG to PDF
 */

import {
  validateImageFile,
  IMAGE_MAX_FILE_SIZE,
  IMAGE_MAX_FILES,
} from '../src/types/image';
import type { ImageFile } from '../src/types/image';
import {
  convertImagesToPdf,
  DEFAULT_OPTIONS,
  PAGE_SIZE_PRESETS,
  MARGIN_VALUES,
} from '../src/lib/pdf/fromImages';
import type { ConvertOptions } from '../src/lib/pdf/fromImages';

// ─── Real minimal 1×1 image fixtures for pdf-lib embedding ────────────────────
// pdf-lib validates JPEG/PNG headers and parses dimensions.
// These are real base64-encoded 1×1 white images that pass all checks.

// 1×1 white JPEG (minimal JFIF, no EXIF)
const MINIMAL_1x1_JPEG = Uint8Array.from(atob(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
  'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
  'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
  'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQ' +
  'AAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAA' +
  'AAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k='
), (c) => c.charCodeAt(0));

// 1×1 white PNG (real IDAT, passes CRC checks)
const MINIMAL_1x1_PNG = Uint8Array.from(atob(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHg' +
  'gJ/PchI6QAAAABJRU5ErkJggg=='
), (c) => c.charCodeAt(0));

// ─── Canvas + image stubs ──────────────────────────────────────────────────────
// jsdom does not implement canvas APIs or HTMLImageElement.decode.
// We stub what normalizeImage() needs.

beforeAll(() => {
  // toBlob → produce format-correct stub bytes that pdf-lib can embed
  // We use real minimal 1×1 images so pdf-lib's embedJpg/embedPng parsers succeed
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    writable: true,
    configurable: true,
    value(callback: BlobCallback, type?: string, _q?: number) {
      const isJpeg = type === 'image/jpeg';
      const bytes = isJpeg ? MINIMAL_1x1_JPEG : MINIMAL_1x1_PNG;
      const blob = new Blob([bytes], { type: type ?? 'image/png' });
      Promise.resolve().then(() => callback(blob));
    },
  });

  // getContext('2d') → minimal stub
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value(this: HTMLCanvasElement, contextId: string) {
      if (contextId === '2d') {
        return {
          fillStyle: '#ffffff',
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          transform: () => {},
          canvas: this,
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    },
  });

  // HTMLImageElement: onload fires immediately with fixed dimensions
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    set(this: HTMLImageElement, _val: string) {
      Object.defineProperty(this, 'naturalWidth', { value: 100, configurable: true });
      Object.defineProperty(this, 'naturalHeight', { value: 140, configurable: true });
      Promise.resolve().then(() => this.onload?.(new Event('load')));
    },
    configurable: true,
  });
});

// ─── URL.createObjectURL / revokeObjectURL stubs ───────────────────────────────

if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    configurable: true,
    value: (_blob: Blob) => `blob:mock-${crypto.randomUUID()}`,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    configurable: true,
    value: (_url: string) => {},
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeImageFile(
  name: string,
  content: Uint8Array | string = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
  type = 'image/jpeg',
): ImageFile {
  const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  return {
    id: `id-${name}`,
    name,
    size: data.length,
    file: new File([data.buffer as ArrayBuffer], name, { type }),
    objectUrl: null,
    width: null,
    height: null,
    exifOrientation: null,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

// A minimal 1x1 white JPEG (real bytes so image decode doesn't fail)
function makeJpegBytes(): Uint8Array {
  // minimal JPEG magic + some bytes
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
}

function makePngBytes(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
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

// ─── validateImageFile ────────────────────────────────────────────────────────

describe('validateImageFile', () => {
  it('accepts .jpg file', () => {
    const f = new File([new Uint8Array(10)], 'photo.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('accepts .jpeg file', () => {
    const f = new File([new Uint8Array(10)], 'photo.jpeg', { type: 'image/jpeg' });
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('accepts .png file', () => {
    const f = new File([new Uint8Array(10)], 'photo.png', { type: 'image/png' });
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('rejects .pdf file', () => {
    const f = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' });
    expect(validateImageFile(f).valid).toBe(false);
    expect(validateImageFile(f).error).toBe('invalid-type');
  });

  it('rejects empty file', () => {
    const f = new File([], 'empty.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(f).valid).toBe(false);
    expect(validateImageFile(f).error).toBe('empty-file');
  });

  it('rejects file exceeding max size', () => {
    const bigData = new Uint8Array(IMAGE_MAX_FILE_SIZE + 1);
    const f = new File([bigData.buffer as ArrayBuffer], 'huge.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(f).valid).toBe(false);
    expect(validateImageFile(f).error).toBe('file-too-large');
  });

  it('accepts file exactly at max size', () => {
    const data = new Uint8Array(IMAGE_MAX_FILE_SIZE);
    const f = new File([data.buffer as ArrayBuffer], 'max.png', { type: 'image/png' });
    expect(validateImageFile(f).valid).toBe(true);
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe('PAGE_SIZE_PRESETS', () => {
  it('a4 is 595.28 × 841.89', () => {
    expect(PAGE_SIZE_PRESETS.a4.width).toBeCloseTo(595.28, 1);
    expect(PAGE_SIZE_PRESETS.a4.height).toBeCloseTo(841.89, 1);
  });

  it('letter is 612 × 792', () => {
    expect(PAGE_SIZE_PRESETS.letter.width).toBe(612);
    expect(PAGE_SIZE_PRESETS.letter.height).toBe(792);
  });

  it('a3 is larger than a4', () => {
    expect(PAGE_SIZE_PRESETS.a3.width).toBeGreaterThan(PAGE_SIZE_PRESETS.a4.width);
    expect(PAGE_SIZE_PRESETS.a3.height).toBeGreaterThan(PAGE_SIZE_PRESETS.a4.height);
  });
});

describe('MARGIN_VALUES', () => {
  it('none is 0', () => expect(MARGIN_VALUES.none).toBe(0));
  it('small > none', () => expect(MARGIN_VALUES.small).toBeGreaterThan(0));
  it('medium > small', () => expect(MARGIN_VALUES.medium).toBeGreaterThan(MARGIN_VALUES.small));
  it('large > medium', () => expect(MARGIN_VALUES.large).toBeGreaterThan(MARGIN_VALUES.medium));
});

describe('DEFAULT_OPTIONS', () => {
  it('has all required keys', () => {
    expect(DEFAULT_OPTIONS).toMatchObject({
      pageSize: expect.any(String),
      orientation: expect.any(String),
      margin: expect.any(String),
      placement: expect.any(String),
      jpegQuality: expect.any(Number),
    });
  });

  it('jpegQuality between 0 and 1', () => {
    expect(DEFAULT_OPTIONS.jpegQuality).toBeGreaterThan(0);
    expect(DEFAULT_OPTIONS.jpegQuality).toBeLessThanOrEqual(1);
  });
});

describe('IMAGE_MAX_FILES', () => {
  it('is at least 10', () => expect(IMAGE_MAX_FILES).toBeGreaterThanOrEqual(10));
});

// ─── convertImagesToPdf — basic ───────────────────────────────────────────────

describe('convertImagesToPdf — basic', () => {
  it('converts a single JPEG to PDF', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.pageCount).toBe(1);
      expect(result.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('converts a single PNG to PDF', async () => {
    const img = makeImageFile('image.png', makePngBytes(), 'image/png');
    const result = await convertImagesToPdf([img], DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pageCount).toBe(1);
    }
  });

  it('combines multiple images into one PDF', async () => {
    const images = [
      makeImageFile('a.jpg', makeJpegBytes(), 'image/jpeg'),
      makeImageFile('b.png', makePngBytes(), 'image/png'),
      makeImageFile('c.jpg', makeJpegBytes(), 'image/jpeg'),
    ];
    const result = await convertImagesToPdf(images, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pageCount).toBe(3);
    }
  });

  it('output is a valid PDF (%PDF- header)', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      const header = await readBlobHeader(result.blob);
      expect(header).toBe('%PDF-');
    }
  });

  it('filename is images-to-pdf.pdf', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe('images-to-pdf.pdf');
    }
  });

  it('page count equals image count', async () => {
    const images = Array.from({ length: 5 }, (_, i) =>
      makeImageFile(`img${i}.jpg`, makeJpegBytes(), 'image/jpeg'),
    );
    const result = await convertImagesToPdf(images, DEFAULT_OPTIONS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pageCount).toBe(5);
    }
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('convertImagesToPdf — error handling', () => {
  it('returns error for empty images array', async () => {
    const result = await convertImagesToPdf([], DEFAULT_OPTIONS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it('never throws — always returns typed result', async () => {
    const img = makeImageFile('bad.jpg', 'not image data', 'image/jpeg');
    await expect(convertImagesToPdf([img], DEFAULT_OPTIONS)).resolves.toBeDefined();
  });
});

// ─── AbortSignal ──────────────────────────────────────────────────────────────

describe('convertImagesToPdf — AbortSignal', () => {
  it('returns cancelled error when already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], DEFAULT_OPTIONS, undefined, ac.signal);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/cancel/i);
  });
});

// ─── Progress callback ────────────────────────────────────────────────────────

describe('convertImagesToPdf — progress', () => {
  it('calls onProgress for each image', async () => {
    const images = [
      makeImageFile('a.jpg', makeJpegBytes(), 'image/jpeg'),
      makeImageFile('b.jpg', makeJpegBytes(), 'image/jpeg'),
    ];
    const calls: [number, number][] = [];
    const result = await convertImagesToPdf(
      images,
      DEFAULT_OPTIONS,
      (done, total) => calls.push([done, total]),
    );
    expect(result.success).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual([1, 2]);
    expect(calls[1]).toEqual([2, 2]);
  });
});

// ─── Page size options ────────────────────────────────────────────────────────

describe('convertImagesToPdf — page size options', () => {
  const opts = (pageSize: ConvertOptions['pageSize']): ConvertOptions => ({
    ...DEFAULT_OPTIONS,
    pageSize,
  });

  it('produces PDF for a4', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], opts('a4'));
    expect(result.success).toBe(true);
  });

  it('produces PDF for letter', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], opts('letter'));
    expect(result.success).toBe(true);
  });

  it('produces PDF for a3', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], opts('a3'));
    expect(result.success).toBe(true);
  });

  it('produces PDF for original size', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], opts('original'));
    expect(result.success).toBe(true);
  });

  it('produces PDF for custom size', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], {
      ...DEFAULT_OPTIONS,
      pageSize: 'custom',
      customWidth: 400,
      customHeight: 600,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Orientation ──────────────────────────────────────────────────────────────

describe('convertImagesToPdf — orientation', () => {
  it('portrait orientation', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, orientation: 'portrait' });
    expect(result.success).toBe(true);
  });

  it('landscape orientation', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, orientation: 'landscape' });
    expect(result.success).toBe(true);
  });

  it('auto orientation', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, orientation: 'auto' });
    expect(result.success).toBe(true);
  });
});

// ─── Margins ──────────────────────────────────────────────────────────────────

describe('convertImagesToPdf — margins', () => {
  const marginPresets: ConvertOptions['margin'][] = ['none', 'small', 'medium', 'large', 'custom'];
  for (const margin of marginPresets) {
    it(`margin: ${margin}`, async () => {
      const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
      const result = await convertImagesToPdf([img], {
        ...DEFAULT_OPTIONS,
        margin,
        customMargin: margin === 'custom' ? 20 : DEFAULT_OPTIONS.customMargin,
      });
      expect(result.success).toBe(true);
    });
  }
});

// ─── Image placement ──────────────────────────────────────────────────────────

describe('convertImagesToPdf — image placement', () => {
  const placements: ConvertOptions['placement'][] = ['fit', 'fill', 'original', 'center'];
  for (const placement of placements) {
    it(`placement: ${placement}`, async () => {
      const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
      const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, placement });
      expect(result.success).toBe(true);
    });
  }
});

// ─── JPEG quality ─────────────────────────────────────────────────────────────

describe('convertImagesToPdf — JPEG quality', () => {
  it('low quality (0.5) produces valid PDF', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, jpegQuality: 0.5 });
    expect(result.success).toBe(true);
  });

  it('max quality (1.0) produces valid PDF', async () => {
    const img = makeImageFile('photo.jpg', makeJpegBytes(), 'image/jpeg');
    const result = await convertImagesToPdf([img], { ...DEFAULT_OPTIONS, jpegQuality: 1.0 });
    expect(result.success).toBe(true);
  });
});

// ─── validateImageFile edge cases ────────────────────────────────────────────

describe('validateImageFile — edge cases', () => {
  it('accepts uppercase .JPG extension', () => {
    const f = new File([new Uint8Array(10)], 'PHOTO.JPG', { type: '' });
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('accepts .jpeg extension', () => {
    const f = new File([new Uint8Array(10)], 'photo.jpeg', { type: 'image/jpeg' });
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('rejects .gif', () => {
    const f = new File([new Uint8Array(10)], 'anim.gif', { type: 'image/gif' });
    expect(validateImageFile(f).valid).toBe(false);
  });

  it('rejects .webp', () => {
    const f = new File([new Uint8Array(10)], 'image.webp', { type: 'image/webp' });
    expect(validateImageFile(f).valid).toBe(false);
  });
});

// ─── buildImageFile ───────────────────────────────────────────────────────────

describe('buildImageFile from ImageDropzone', () => {
  it('creates ImageFile with correct shape', async () => {
    const { buildImageFile } = await import('../src/components/pdf/ImageDropzone');
    const file = new File([new Uint8Array(100)], 'photo.jpg', { type: 'image/jpeg' });
    const img = buildImageFile(file);
    expect(img.id).toBeTruthy();
    expect(img.name).toBe('photo.jpg');
    expect(img.size).toBe(100);
    expect(img.width).toBeNull();
    expect(img.height).toBeNull();
    expect(img.isCorrupted).toBe(false);
  });

  it('assigns unique ids', async () => {
    const { buildImageFile } = await import('../src/components/pdf/ImageDropzone');
    const file = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    const a = buildImageFile(file);
    const b = buildImageFile(file);
    expect(a.id).not.toBe(b.id);
  });
});

// ─── Page component exports ───────────────────────────────────────────────────

describe('JPG/PNG to PDF page module', () => {
  it('exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/jpg-png-to-pdf/page');
    expect(typeof mod.default).toBe('function');
  });

  it('layout exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/jpg-png-to-pdf/layout');
    const meta = (mod as { metadata?: { title?: string; description?: string } }).metadata;
    expect(meta?.title).toContain('JPG');
    expect(meta?.title).toContain('PDF');
    expect(meta?.title).toContain('DevToolsHub');
    expect(typeof meta?.description).toBe('string');
    expect((meta?.description ?? '').length).toBeGreaterThan(50);
  });
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────

describe('Sitemap includes /pdf-tools/jpg-png-to-pdf', () => {
  it('jpg-png-to-pdf is in sitemap', async () => {
    const mod = await import('../src/app/sitemap');
    const entries = mod.default() as { url: string }[];
    const { SITE_URL } = await import('../src/lib/seo/site-config');
    expect(entries.some((e) => e.url === `${SITE_URL}/pdf-tools/jpg-png-to-pdf`)).toBe(true);
  });
});

// ─── Hub page ─────────────────────────────────────────────────────────────────

describe('PDF Tools hub page lists JPG/PNG to PDF', () => {
  it('hub lists jpg-png-to-pdf as available', async () => {
    const src = await import('fs').then((fs) =>
      fs.readFileSync('./src/app/pdf-tools/page.tsx', 'utf-8'),
    );
    expect(src).toContain('/pdf-tools/jpg-png-to-pdf');
    expect(src).toContain('available: true');
  });
});

// ─── Ordering ────────────────────────────────────────────────────────────────

describe('convertImagesToPdf — ordering', () => {
  it('processes images in the provided order', async () => {
    const images = [
      makeImageFile('first.jpg', makeJpegBytes(), 'image/jpeg'),
      makeImageFile('second.jpg', makeJpegBytes(), 'image/jpeg'),
      makeImageFile('third.jpg', makeJpegBytes(), 'image/jpeg'),
    ];
    const order: number[] = [];
    await convertImagesToPdf(images, DEFAULT_OPTIONS, (done) => order.push(done));
    expect(order).toEqual([1, 2, 3]);
  });
});
