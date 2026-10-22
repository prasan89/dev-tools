/**
 * Tests for image-tools improvements:
 * - inspectImage uses a single createImageBitmap call (not double)
 * - engine helpers added in this milestone
 * - batch crop logic (relative crop region applied to different image sizes)
 */

import { formatFileSize, compressionSavings, outputFilename } from '@/lib/image-tools/engine';

// ─── Single-decode inspectImage invariant ────────────────────────────────────
//
// We verify the single-decode guarantee by counting createImageBitmap calls.
// jsdom does not implement createImageBitmap, so we provide a spy stub.

describe('inspectImage uses a single createImageBitmap call', () => {
  let callCount: number;
  const origCreateImageBitmap = globalThis.createImageBitmap;

  beforeEach(() => {
    callCount = 0;
    // Minimal stub: returns a fake ImageBitmap-like object
    globalThis.createImageBitmap = (async (_source: unknown) => {
      callCount += 1;
      return {
        width: 800,
        height: 600,
        close: () => {},
      } as unknown as ImageBitmap;
    }) as typeof createImageBitmap;
  });

  afterEach(() => {
    if (origCreateImageBitmap) {
      globalThis.createImageBitmap = origCreateImageBitmap;
    }
  });

  it('calls createImageBitmap exactly once for a JPEG (no transparency check needed)', async () => {
    // Polyfill Blob.arrayBuffer for jsdom if needed
    if (!Blob.prototype.arrayBuffer) {
      Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(this);
        });
      };
    }

    // Need to mock document.createElement for canvas
    const origCreate = document.createElement.bind(document);
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray([255, 255, 255, 255]) }),
      }),
    };
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLElement;
      return origCreate(tag);
    });

    // JPEG magic bytes
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    const file = new File([jpegBytes], 'photo.jpg', { type: 'image/jpeg' });

    const { inspectImage } = await import('@/lib/image-tools/engine');
    await inspectImage(file);

    expect(callCount).toBe(1);
    jest.restoreAllMocks();
  });

  it('calls createImageBitmap exactly once for a PNG (transparency check uses same bitmap)', async () => {
    if (!Blob.prototype.arrayBuffer) {
      Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(this);
        });
      };
    }

    const origCreate = document.createElement.bind(document);
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(256 * 256 * 4).fill(255) }),
      }),
    };
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLElement;
      return origCreate(tag);
    });

    // PNG magic bytes
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngBytes], 'image.png', { type: 'image/png' });

    const { inspectImage } = await import('@/lib/image-tools/engine');
    await inspectImage(file);

    expect(callCount).toBe(1);
    jest.restoreAllMocks();
  });
});

// ─── Batch crop: relative region applied to different image sizes ─────────────
//
// The batch crop logic scales a relative selection (0–1) to each image's
// actual pixel dimensions. These are pure arithmetic tests that mirror the
// logic in the crop client.

describe('batch crop relative-to-pixel coordinate mapping', () => {
  function applyRelativeSelection(
    selection: { x: number; y: number; w: number; h: number },
    naturalW: number,
    naturalH: number,
  ) {
    return {
      x: Math.round(selection.x * naturalW),
      y: Math.round(selection.y * naturalH),
      width: Math.max(1, Math.round(selection.w * naturalW)),
      height: Math.max(1, Math.round(selection.h * naturalH)),
    };
  }

  function withinBounds(
    crop: { x: number; y: number; width: number; height: number },
    naturalW: number,
    naturalH: number,
  ) {
    return crop.x + crop.width <= naturalW && crop.y + crop.height <= naturalH;
  }

  it('maps a center-50% selection correctly on a 1000×800 image', () => {
    const sel = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };
    const { x, y, width, height } = applyRelativeSelection(sel, 1000, 800);
    expect(x).toBe(250);
    expect(y).toBe(200);
    expect(width).toBe(500);
    expect(height).toBe(400);
    expect(withinBounds({ x, y, width, height }, 1000, 800)).toBe(true);
  });

  it('maps the same selection on a 400×300 image proportionally', () => {
    const sel = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };
    const { x, y, width, height } = applyRelativeSelection(sel, 400, 300);
    expect(x).toBe(100);
    expect(y).toBe(75);
    expect(width).toBe(200);
    expect(height).toBe(150);
    expect(withinBounds({ x, y, width, height }, 400, 300)).toBe(true);
  });

  it('a full-image selection stays within bounds on any size', () => {
    const sel = { x: 0, y: 0, w: 1, h: 1 };
    for (const [nw, nh] of [[100, 100], [1920, 1080], [7, 7]]) {
      const crop = applyRelativeSelection(sel, nw, nh);
      expect(withinBounds(crop, nw, nh)).toBe(true);
    }
  });

  it('detects when a relative crop would exceed small image bounds', () => {
    // Selection is 80% wide starting at 30% — total 110%, which overflows
    const sel = { x: 0.3, y: 0, w: 0.8, h: 1 };
    const crop = applyRelativeSelection(sel, 100, 100);
    expect(withinBounds(crop, 100, 100)).toBe(false);
  });

  it('minimum width is at least 1 px', () => {
    const sel = { x: 0, y: 0, w: 0.001, h: 0.001 };
    const crop = applyRelativeSelection(sel, 10, 10);
    expect(crop.width).toBeGreaterThanOrEqual(1);
    expect(crop.height).toBeGreaterThanOrEqual(1);
  });
});

// ─── compressionSavings (edge cases added by this milestone) ─────────────────

describe('compressionSavings edge cases', () => {
  it('rounds correctly for 1-byte savings', () => {
    const s = compressionSavings(100, 99);
    expect(s).toBe('-1% smaller');
  });

  it('handles very small original sizes without divide-by-zero', () => {
    expect(() => compressionSavings(1, 1)).not.toThrow();
    expect(compressionSavings(1, 1)).toBe('no change');
  });
});

// ─── outputFilename (suffix handling) ────────────────────────────────────────

describe('outputFilename with underscore suffix', () => {
  it('places suffix before extension', () => {
    expect(outputFilename('vacation.png', 'webp', '_cropped')).toBe('vacation_cropped.webp');
  });

  it('handles filenames with multiple dots', () => {
    const result = outputFilename('my.photo.2024.jpeg', 'png', '_compressed');
    expect(result).toBe('my.photo.2024_compressed.png');
  });
});

// ─── formatFileSize (additional cases) ───────────────────────────────────────

describe('formatFileSize additional cases', () => {
  it('shows bytes for single-digit values', () => {
    expect(formatFileSize(1)).toBe('1 B');
  });

  it('shows exactly 1.0 KB for 1024 bytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('shows exactly 1.00 MB for 1048576 bytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
  });
});
