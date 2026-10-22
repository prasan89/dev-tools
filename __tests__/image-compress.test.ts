import { compressImage } from '@/lib/image-tools/engine';

jest.mock('@/lib/image-tools/validation', () => ({
  detectFormatFromBytes: jest.fn().mockImplementation(async (file: File) =>
    file.name.toLowerCase().endsWith('.png') ? 'png' : 'jpeg',
  ),
  formatFromMime: jest.fn().mockReturnValue(null),
}));

describe('compressImage', () => {
  const close = jest.fn();
  const drawImage = jest.fn();
  const fillRect = jest.fn();
  const save = jest.fn();
  const restore = jest.fn();
  let bitmap: { width: number; height: number; close: jest.Mock };
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  beforeEach(() => {
    jest.clearAllMocks();
    bitmap = { width: 4000, height: 2000, close };
    context = {
      drawImage,
      fillRect,
      save,
      restore,
      fillStyle: '#ffffff',
    } as unknown as CanvasRenderingContext2D;

    canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn().mockReturnValue(context),
      toBlob: jest.fn((callback: BlobCallback, type?: string, quality?: number) => {
        const size = Math.max(100, Math.round(100 + (quality ?? 0.8) * 10000));
        callback(new Blob([new Uint8Array(size)], { type: type ?? 'image/jpeg' }));
      }),
    } as unknown as HTMLCanvasElement;

    jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') return canvas;
      return document.createElementNS('http://www.w3.org/1999/xhtml', tagName) as unknown as HTMLElement;
    }) as typeof document.createElement);

    Object.defineProperty(globalThis, 'createImageBitmap', {
      configurable: true,
      value: jest.fn().mockResolvedValue(bitmap),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('respects max width and height together while preserving aspect ratio', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, {
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 300,
    });

    expect(result.outputWidth).toBe(600);
    expect(result.outputHeight).toBe(300);
    expect(result.format).toBe('jpeg');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid maximum dimensions before decoding', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' });

    await expect(compressImage(file, { quality: 0.8, maxWidth: 0 })).rejects.toThrow(/maximum width/i);
    expect(globalThis.createImageBitmap).not.toHaveBeenCalled();
  });

  it('searches quality for a lossy target size and returns the closest under-target result when possible', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, { quality: 0.8, targetSizeKb: 5 });

    expect(result.outputSize).toBeLessThanOrEqual(5 * 1024);
    expect(canvas.toBlob).toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('does not run a misleading quality search for lossless PNG output', async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'photo.png', { type: 'image/png' });
    const result = await compressImage(file, { quality: 0.2, targetSizeKb: 5 });

    expect(result.format).toBe('png');
    expect(result.blob.type).toBe('image/png');
    expect(canvas.toBlob).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes the decoded bitmap if cancellation happens immediately after decoding', async () => {
    const controller = new AbortController();
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(globalThis, 'createImageBitmap', {
      configurable: true,
      value: jest.fn(async () => {
        controller.abort();
        return bitmap;
      }),
    });

    await expect(compressImage(file, { quality: 0.8 }, controller.signal)).rejects.toThrow();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
