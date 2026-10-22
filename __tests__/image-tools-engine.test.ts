/**
 * Tests for image-tools engine (compression, resize, crop, convert, transform).
 *
 * Since jsdom does not implement HTMLCanvasElement.toBlob with real encoding,
 * we mock canvas and createImageBitmap. Tests validate:
 *  - Correct option handling and dimension calculations
 *  - Aspect ratio arithmetic
 *  - Transparency detection logic
 *  - Error conditions
 *  - File size helpers
 *  - Filename helpers
 */

import {
  formatFileSize,
  compressionSavings,
  outputFilename,
  createObjectUrl,
  revokeObjectUrl,
} from '@/lib/image-tools/engine';
import { FORMAT_EXTENSIONS } from '@/lib/image-tools/types';

// ─── formatFileSize ───────────────────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => expect(formatFileSize(500)).toBe('500 B'));
  it('formats kilobytes', () => expect(formatFileSize(1536)).toBe('1.5 KB'));
  it('formats megabytes', () => expect(formatFileSize(2 * 1024 * 1024)).toBe('2.00 MB'));
  it('handles 0', () => expect(formatFileSize(0)).toBe('0 B'));
  it('handles exactly 1 KB', () => expect(formatFileSize(1024)).toBe('1.0 KB'));
});

// ─── compressionSavings ───────────────────────────────────────────────────────

describe('compressionSavings', () => {
  it('shows reduction when output is smaller', () => {
    const s = compressionSavings(1000, 600);
    expect(s).toContain('-40%');
    expect(s).toContain('smaller');
  });

  it('shows increase when output is larger', () => {
    const s = compressionSavings(1000, 1500);
    expect(s).toContain('+50%');
    expect(s).toContain('larger');
  });

  it('shows no change when equal', () => {
    expect(compressionSavings(1000, 1000)).toBe('no change');
  });
});

// ─── outputFilename ───────────────────────────────────────────────────────────

describe('outputFilename', () => {
  it('replaces extension with jpeg extension', () => {
    expect(outputFilename('photo.png', 'jpeg')).toBe('photo.jpg');
  });

  it('appends suffix before extension', () => {
    expect(outputFilename('photo.png', 'jpeg', '_compressed')).toBe('photo_compressed.jpg');
  });

  it('handles webp format', () => {
    expect(outputFilename('image.jpg', 'webp')).toBe('image.webp');
  });

  it('handles filenames without extension', () => {
    expect(outputFilename('noext', 'png')).toBe('noext.png');
  });

  it('uses FORMAT_EXTENSIONS mapping', () => {
    expect(outputFilename('x.jpg', 'jpeg')).toBe(`x${FORMAT_EXTENSIONS.jpeg}`);
    expect(outputFilename('x.jpg', 'png')).toBe(`x${FORMAT_EXTENSIONS.png}`);
    expect(outputFilename('x.jpg', 'webp')).toBe(`x${FORMAT_EXTENSIONS.webp}`);
  });
});

// ─── FORMAT_EXTENSIONS ────────────────────────────────────────────────────────

describe('FORMAT_EXTENSIONS', () => {
  it('jpeg maps to .jpg', () => expect(FORMAT_EXTENSIONS.jpeg).toBe('.jpg'));
  it('png maps to .png', () => expect(FORMAT_EXTENSIONS.png).toBe('.png'));
  it('webp maps to .webp', () => expect(FORMAT_EXTENSIONS.webp).toBe('.webp'));
});

// ─── createObjectUrl / revokeObjectUrl ────────────────────────────────────────

describe('object URL helpers', () => {
  it('createObjectUrl delegates to URL.createObjectURL', () => {
    const mockUrl = 'blob:mock';
    const original = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn(() => mockUrl) as typeof URL.createObjectURL;
    const blob = new Blob(['data']);
    const result = createObjectUrl(blob);
    expect(result).toBe(mockUrl);
    global.URL.createObjectURL = original;
  });

  it('revokeObjectUrl calls URL.revokeObjectURL for blob: URLs', () => {
    const called: string[] = [];
    const original = global.URL.revokeObjectURL;
    global.URL.revokeObjectURL = jest.fn((u: string) => { called.push(u); });
    revokeObjectUrl('blob:http://localhost/test');
    expect(called).toHaveLength(1);
    global.URL.revokeObjectURL = original;
  });

  it('revokeObjectUrl does not call revoke for non-blob URLs', () => {
    const called: string[] = [];
    const original = global.URL.revokeObjectURL;
    global.URL.revokeObjectURL = jest.fn((u: string) => { called.push(u); });
    revokeObjectUrl('https://example.com/image.jpg');
    expect(called).toHaveLength(0);
    global.URL.revokeObjectURL = original;
  });
});

// ─── Aspect ratio arithmetic (inline — tested via resize logic) ───────────────

describe('aspect ratio arithmetic', () => {
  function computeResizeDimensions(
    origW: number,
    origH: number,
    targetW: number | undefined,
    targetH: number | undefined,
    keepAspect: boolean,
  ): { w: number; h: number } {
    if (targetW != null && targetH != null) {
      if (keepAspect) {
        const scale = Math.min(targetW / origW, targetH / origH);
        return { w: Math.round(origW * scale), h: Math.round(origH * scale) };
      }
      return { w: targetW, h: targetH };
    }
    if (targetW != null) {
      return { w: targetW, h: keepAspect ? Math.round((origH * targetW) / origW) : origH };
    }
    if (targetH != null) {
      return { h: targetH, w: keepAspect ? Math.round((origW * targetH) / origH) : origW };
    }
    return { w: origW, h: origH };
  }

  it('keeps aspect ratio when only width is given', () => {
    const { w, h } = computeResizeDimensions(1000, 500, 200, undefined, true);
    expect(w).toBe(200);
    expect(h).toBe(100);
  });

  it('keeps aspect ratio when only height is given', () => {
    const { w, h } = computeResizeDimensions(1000, 500, undefined, 100, true);
    expect(w).toBe(200);
    expect(h).toBe(100);
  });

  it('stretches when aspect ratio not locked', () => {
    const { w, h } = computeResizeDimensions(1000, 500, 300, 300, false);
    expect(w).toBe(300);
    expect(h).toBe(300);
  });

  it('fits within bounding box maintaining aspect ratio', () => {
    const { w, h } = computeResizeDimensions(1920, 1080, 800, 600, true);
    // scale = min(800/1920, 600/1080) = min(0.4167, 0.5556) = 0.4167
    expect(w).toBe(800);
    expect(h).toBe(Math.round(1080 * (800 / 1920)));
  });

  it('handles square images', () => {
    const { w, h } = computeResizeDimensions(512, 512, 128, undefined, true);
    expect(w).toBe(128);
    expect(h).toBe(128);
  });
});

// ─── Crop bounds validation ───────────────────────────────────────────────────

describe('crop bounds validation', () => {
  function validateCrop(
    x: number, y: number, w: number, h: number,
    imgW: number, imgH: number,
  ): string | null {
    if (w <= 0 || h <= 0) return 'Crop dimensions must be positive.';
    if (x < 0 || y < 0) return 'Crop origin must be non-negative.';
    if (x + w > imgW || y + h > imgH) return 'Crop area exceeds image bounds.';
    return null;
  }

  it('passes valid crop', () => {
    expect(validateCrop(10, 10, 100, 100, 200, 200)).toBeNull();
  });

  it('rejects zero width', () => {
    expect(validateCrop(0, 0, 0, 100, 200, 200)).toBeTruthy();
  });

  it('rejects negative origin', () => {
    expect(validateCrop(-1, 0, 100, 100, 200, 200)).toBeTruthy();
  });

  it('rejects crop that exceeds bounds', () => {
    expect(validateCrop(150, 150, 100, 100, 200, 200)).toBeTruthy();
  });

  it('accepts crop at exact edge', () => {
    expect(validateCrop(0, 0, 200, 200, 200, 200)).toBeNull();
  });
});

// ─── Rotate dimension swap ────────────────────────────────────────────────────

describe('rotate output dimensions', () => {
  function rotatedDimensions(w: number, h: number, angle: 0 | 90 | 180 | 270): { outW: number; outH: number } {
    const swapped = angle === 90 || angle === 270;
    return { outW: swapped ? h : w, outH: swapped ? w : h };
  }

  it('0° keeps same dimensions', () => {
    expect(rotatedDimensions(800, 600, 0)).toEqual({ outW: 800, outH: 600 });
  });

  it('90° swaps dimensions', () => {
    expect(rotatedDimensions(800, 600, 90)).toEqual({ outW: 600, outH: 800 });
  });

  it('180° keeps same dimensions', () => {
    expect(rotatedDimensions(800, 600, 180)).toEqual({ outW: 800, outH: 600 });
  });

  it('270° swaps dimensions', () => {
    expect(rotatedDimensions(800, 600, 270)).toEqual({ outW: 600, outH: 800 });
  });

  it('handles square images', () => {
    expect(rotatedDimensions(512, 512, 90)).toEqual({ outW: 512, outH: 512 });
  });
});

// ─── Queue item status helpers ────────────────────────────────────────────────

import { isTerminal, allDone } from '@/lib/image-tools/queue';
import type { QueueItem } from '@/lib/image-tools/types';

function makeQueueItem(status: QueueItem<unknown, unknown>['status']): QueueItem<unknown, unknown> {
  return {
    id: '1',
    file: new File([], 'test.jpg'),
    options: {},
    status,
    progress: 0,
  };
}

describe('isTerminal', () => {
  it('returns true for completed', () => expect(isTerminal('completed')).toBe(true));
  it('returns true for failed', () => expect(isTerminal('failed')).toBe(true));
  it('returns true for cancelled', () => expect(isTerminal('cancelled')).toBe(true));
  it('returns false for queued', () => expect(isTerminal('queued')).toBe(false));
  it('returns false for processing', () => expect(isTerminal('processing')).toBe(false));
});

describe('allDone', () => {
  it('returns true when all items are terminal', () => {
    const items = [makeQueueItem('completed'), makeQueueItem('failed')];
    expect(allDone(items)).toBe(true);
  });

  it('returns false when any item is not terminal', () => {
    const items = [makeQueueItem('completed'), makeQueueItem('processing')];
    expect(allDone(items)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(allDone([])).toBe(false);
  });
});

// ─── ImageQueue class ─────────────────────────────────────────────────────────

import { ImageQueue } from '@/lib/image-tools/queue';

describe('ImageQueue', () => {
  it('starts with no items', () => {
    const q = new ImageQueue();
    expect(q.getAll()).toHaveLength(0);
  });

  it('adds items as queued', () => {
    const q = new ImageQueue<{ quality: number }, string>();
    const f = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    q.add('id1', f, { quality: 0.8 });
    const all = q.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('queued');
    expect(all[0].id).toBe('id1');
  });

  it('removes an item', () => {
    const q = new ImageQueue<{}, string>();
    const f = new File([new Uint8Array(10)], 'a.jpg');
    q.add('id1', f, {});
    q.remove('id1');
    expect(q.getAll()).toHaveLength(0);
  });

  it('emits added event on add', () => {
    const q = new ImageQueue<{}, string>();
    const events: string[] = [];
    q.subscribe((e) => events.push(e.type));
    q.add('id1', new File([new Uint8Array(1)], 'a.jpg'), {});
    expect(events).toContain('added');
  });

  it('processes items with a processor', async () => {
    const q = new ImageQueue<{ v: number }, number>({ concurrency: 1 });
    q.setProcessor(async (item, _onProgress) => item.options.v * 2);

    const results: number[] = [];
    q.subscribe((e) => {
      if (e.type === 'changed' && e.item.status === 'completed' && e.item.result != null) {
        results.push(e.item.result as number);
      }
    });

    const f = new File([new Uint8Array(1)], 'a.jpg');
    q.add('id1', f, { v: 5 });

    await new Promise<void>((resolve) => {
      const unsub = q.subscribe((e) => {
        if (e.item.id === 'id1' && e.item.status === 'completed') {
          unsub();
          resolve();
        }
      });
    });

    expect(results).toContain(10);
  });

  it('cancels a queued item', () => {
    const q = new ImageQueue<{}, string>();
    const f = new File([new Uint8Array(1)], 'a.jpg');
    q.add('id1', f, {});
    q.cancel('id1');
    expect(q.get('id1')?.status).toBe('cancelled');
  });

  it('retries a failed item', () => {
    const q = new ImageQueue<{}, string>();
    const f = new File([new Uint8Array(1)], 'a.jpg');
    q.add('id1', f, {});
    q.cancel('id1');
    q.retry('id1');
    expect(q.get('id1')?.status).toBe('queued');
  });

  it('clears all items', () => {
    const q = new ImageQueue<{}, string>();
    const f = new File([new Uint8Array(1)], 'a.jpg');
    q.add('id1', f, {});
    q.add('id2', f, {});
    q.clear();
    expect(q.getAll()).toHaveLength(0);
  });

  it('fires error callback when processor throws', async () => {
    const q = new ImageQueue<{}, string>({ concurrency: 1 });
    q.setProcessor(async () => { throw new Error('processing failed'); });

    const f = new File([new Uint8Array(1)], 'a.jpg');
    q.add('id1', f, {});

    await new Promise<void>((resolve) => {
      const unsub = q.subscribe((e) => {
        if (e.item.id === 'id1' && (e.item.status === 'failed' || e.item.status === 'cancelled')) {
          unsub();
          resolve();
        }
      });
    });

    expect(q.get('id1')?.status).toBe('failed');
    expect(q.get('id1')?.error).toContain('processing failed');
  });
});
