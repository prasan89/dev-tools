/**
 * Image processing engine — main thread implementation.
 * All operations use HTMLCanvasElement + 2D context as a reliable baseline.
 * Workers can use OffscreenCanvas when available.
 */

import type {
  CompressOptions,
  CompressResult,
  ConvertOptions,
  ConvertResult,
  CropOptions,
  CropResult,
  ImageFormat,
  InspectResult,
  ResizeOptions,
  ResizeResult,
  TransformOptions,
  TransformResult,
} from './types';
import { FORMAT_EXTENSIONS, FORMAT_TO_MIME, MIME_TO_FORMAT } from './types';
import { detectFormatFromBytes, formatFromMime } from './validation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getCtx(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get 2D rendering context.');
  return ctx;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas encoding failed.'));
      },
      mime,
      quality,
    );
  });
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'undefined') {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      createImageBitmap(img).then(resolve).catch(reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image.'));
    };
    img.src = url;
  });
}

function resolveFormat(file: File, mime?: string): ImageFormat {
  if (mime) {
    const f = formatFromMime(mime);
    if (f) return f;
  }
  const m = file.type as keyof typeof MIME_TO_FORMAT;
  return MIME_TO_FORMAT[m] ?? 'jpeg';
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Inspect image metadata without full decode. Returns dimensions and format.
 */
export async function inspectImage(file: File): Promise<InspectResult> {
  const bitmap = await loadImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;
  bitmap.close();

  const detectedFormat = (await detectFormatFromBytes(file)) ?? resolveFormat(file);

  // Check for transparency: draw onto a canvas and inspect alpha channel
  let hasTransparency = false;
  if (detectedFormat === 'png' || detectedFormat === 'webp') {
    const canvas = createCanvas(Math.min(w, 256), Math.min(h, 256));
    const ctx = getCtx(canvas);
    const bm2 = await loadImageBitmap(file);
    ctx.drawImage(bm2, 0, 0, canvas.width, canvas.height);
    bm2.close();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        hasTransparency = true;
        break;
      }
    }
  }

  return { width: w, height: h, format: detectedFormat, hasTransparency };
}

/**
 * Compress an image with optional quality and dimension constraints.
 */
export async function compressImage(
  file: File,
  options: CompressOptions,
  signal?: AbortSignal,
): Promise<CompressResult> {
  signal?.throwIfAborted();

  const bitmap = await loadImageBitmap(file);
  signal?.throwIfAborted();

  let { width, height } = bitmap;

  if (options.maxWidth && width > options.maxWidth) {
    height = Math.round((height * options.maxWidth) / width);
    width = options.maxWidth;
  }
  if (options.maxHeight && height > options.maxHeight) {
    width = Math.round((width * options.maxHeight) / height);
    height = options.maxHeight;
  }

  const fmt = resolveFormat(file);
  const mime = FORMAT_TO_MIME[fmt];
  const canvas = createCanvas(width, height);
  const ctx = getCtx(canvas);

  if (fmt === 'jpeg') fillBackground(ctx, width, height, '#ffffff');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  signal?.throwIfAborted();

  // If target size requested, binary-search the quality
  let quality = options.quality;
  if (options.targetSizeKb) {
    const targetBytes = options.targetSizeKb * 1024;
    let lo = 0.05;
    let hi = 0.95;
    let blob = await canvasToBlob(canvas, mime, quality);
    for (let i = 0; i < 10 && Math.abs(blob.size - targetBytes) > 1024; i++) {
      signal?.throwIfAborted();
      quality = (lo + hi) / 2;
      blob = await canvasToBlob(canvas, mime, quality);
      if (blob.size > targetBytes) hi = quality;
      else lo = quality;
    }
    return {
      blob,
      outputWidth: width,
      outputHeight: height,
      originalSize: file.size,
      outputSize: blob.size,
      format: fmt,
    };
  }

  const blob = await canvasToBlob(canvas, mime, quality);
  return {
    blob,
    outputWidth: width,
    outputHeight: height,
    originalSize: file.size,
    outputSize: blob.size,
    format: fmt,
  };
}

/**
 * Resize an image by absolute dimensions or percentage.
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions,
  signal?: AbortSignal,
): Promise<ResizeResult> {
  signal?.throwIfAborted();

  const bitmap = await loadImageBitmap(file);
  signal?.throwIfAborted();

  const origW = bitmap.width;
  const origH = bitmap.height;
  let newW: number;
  let newH: number;

  if (options.percent != null) {
    newW = Math.round((origW * options.percent) / 100);
    newH = Math.round((origH * options.percent) / 100);
  } else if (options.width != null && options.height != null) {
    if (options.keepAspectRatio) {
      const scale = Math.min(options.width / origW, options.height / origH);
      newW = Math.round(origW * scale);
      newH = Math.round(origH * scale);
    } else {
      newW = options.width;
      newH = options.height;
    }
  } else if (options.width != null) {
    newW = options.width;
    newH = options.keepAspectRatio ? Math.round((origH * options.width) / origW) : origH;
  } else if (options.height != null) {
    newH = options.height;
    newW = options.keepAspectRatio ? Math.round((origW * options.height) / origH) : origW;
  } else {
    throw new Error('Provide width, height, or percent.');
  }

  newW = Math.max(1, newW);
  newH = Math.max(1, newH);

  const fmt = options.outputFormat ?? resolveFormat(file);
  const mime = FORMAT_TO_MIME[fmt];
  const quality = options.quality ?? (fmt === 'jpeg' ? 0.85 : 0.9);

  const canvas = createCanvas(newW, newH);
  const ctx = getCtx(canvas);
  if (fmt === 'jpeg') fillBackground(ctx, newW, newH, '#ffffff');
  ctx.drawImage(bitmap, 0, 0, newW, newH);
  bitmap.close();

  signal?.throwIfAborted();
  const blob = await canvasToBlob(canvas, mime, quality);

  return {
    blob,
    outputWidth: newW,
    outputHeight: newH,
    originalWidth: origW,
    originalHeight: origH,
    format: fmt,
  };
}

/**
 * Crop an image to the specified rectangle.
 */
export async function cropImage(
  file: File,
  options: CropOptions,
  signal?: AbortSignal,
): Promise<CropResult> {
  signal?.throwIfAborted();

  const bitmap = await loadImageBitmap(file);
  signal?.throwIfAborted();

  const { x, y, width, height } = options;
  if (width <= 0 || height <= 0) throw new Error('Crop dimensions must be positive.');
  if (x < 0 || y < 0) throw new Error('Crop origin must be non-negative.');
  if (x + width > bitmap.width || y + height > bitmap.height) {
    throw new Error('Crop area exceeds image bounds.');
  }

  const fmt = options.outputFormat ?? resolveFormat(file);
  const mime = FORMAT_TO_MIME[fmt];
  const quality = options.quality ?? (fmt === 'jpeg' ? 0.9 : 0.95);

  const canvas = createCanvas(width, height);
  const ctx = getCtx(canvas);
  if (fmt === 'jpeg') fillBackground(ctx, width, height, '#ffffff');
  ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
  bitmap.close();

  signal?.throwIfAborted();
  const blob = await canvasToBlob(canvas, mime, quality);

  return { blob, outputWidth: width, outputHeight: height, format: fmt };
}

/**
 * Convert an image to a different format.
 */
export async function convertImage(
  file: File,
  options: ConvertOptions,
  signal?: AbortSignal,
): Promise<ConvertResult> {
  signal?.throwIfAborted();

  const bitmap = await loadImageBitmap(file);
  signal?.throwIfAborted();

  const { width, height } = bitmap;
  const fmt = options.outputFormat;
  const mime = FORMAT_TO_MIME[fmt];
  const quality = options.quality ?? (fmt === 'jpeg' ? 0.85 : 0.9);

  const srcFmt = resolveFormat(file);
  const srcHasTransparency = srcFmt === 'png' || srcFmt === 'webp';
  const transparencyLost = srcHasTransparency && fmt === 'jpeg';

  const canvas = createCanvas(width, height);
  const ctx = getCtx(canvas);

  if (fmt === 'jpeg') {
    const bg = options.jpegBackground ?? '#ffffff';
    fillBackground(ctx, width, height, bg);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  signal?.throwIfAborted();
  const blob = await canvasToBlob(canvas, mime, quality);

  return {
    blob,
    outputWidth: width,
    outputHeight: height,
    outputFormat: fmt,
    transparencyLost,
  };
}

/**
 * Rotate and/or flip an image.
 */
export async function transformImage(
  file: File,
  options: TransformOptions,
  signal?: AbortSignal,
): Promise<TransformResult> {
  signal?.throwIfAborted();

  const bitmap = await loadImageBitmap(file);
  signal?.throwIfAborted();

  const srcW = bitmap.width;
  const srcH = bitmap.height;

  const angle = options.rotate ?? 0;
  const flip = options.flip;

  // After rotation by 90/270 degrees, width and height swap
  const swapped = angle === 90 || angle === 270;
  const outW = swapped ? srcH : srcW;
  const outH = swapped ? srcW : srcH;

  const canvas = createCanvas(outW, outH);
  const ctx = getCtx(canvas);

  ctx.save();
  ctx.translate(outW / 2, outH / 2);

  if (angle) {
    ctx.rotate((angle * Math.PI) / 180);
  }

  if (flip === 'horizontal') {
    ctx.scale(-1, 1);
  } else if (flip === 'vertical') {
    ctx.scale(1, -1);
  }

  // Draw centered
  ctx.drawImage(bitmap, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx.restore();
  bitmap.close();

  const fmt = options.outputFormat ?? resolveFormat(file);
  const mime = FORMAT_TO_MIME[fmt];
  const quality = options.quality ?? (fmt === 'jpeg' ? 0.9 : 0.95);

  signal?.throwIfAborted();
  const blob = await canvasToBlob(canvas, mime, quality);

  return { blob, outputWidth: outW, outputHeight: outH, format: fmt };
}

// ─── Object URL lifecycle ─────────────────────────────────────────────────────

export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

// ─── File size formatting ──────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function compressionSavings(original: number, output: number): string {
  const delta = original - output;
  const pct = Math.round((Math.abs(delta) / original) * 100);
  if (delta > 0) return `-${pct}% smaller`;
  if (delta < 0) return `+${pct}% larger`;
  return 'no change';
}

// ─── Filename helpers ─────────────────────────────────────────────────────────

export function outputFilename(originalName: string, format: ImageFormat, suffix = ''): string {
  const lower = originalName.toLowerCase();
  const dot = lower.lastIndexOf('.');
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;
  return `${stem}${suffix}${FORMAT_EXTENSIONS[format]}`;
}
