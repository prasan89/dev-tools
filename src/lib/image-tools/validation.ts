import type { ImageFormat, ImageMime } from './types';

// ─── Supported MIME types for input ───────────────────────────────────────────

export const ACCEPTED_MIME_TYPES: ImageMime[] = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ACCEPTED_MIME_STRING = ACCEPTED_MIME_TYPES.join(',');

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_FILES = 20;
export const MAX_DIMENSION = 16384;
export const MIN_DIMENSION = 1;

// ─── Format detection ─────────────────────────────────────────────────────────

const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff]);
const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]; // RIFF
const WEBP_MARK = [0x57, 0x45, 0x42, 0x50]; // WEBP (at offset 8)

function bytesMatch(buf: Uint8Array, magic: number[] | Uint8Array, offset = 0): boolean {
  for (let i = 0; i < magic.length; i++) {
    if (buf[offset + i] !== magic[i]) return false;
  }
  return true;
}

export async function detectFormatFromBytes(file: File): Promise<ImageFormat | null> {
  const slice = file.slice(0, 12);
  const buf = new Uint8Array(await slice.arrayBuffer());
  if (bytesMatch(buf, JPEG_MAGIC)) return 'jpeg';
  if (bytesMatch(buf, PNG_MAGIC)) return 'png';
  if (bytesMatch(buf, WEBP_RIFF) && bytesMatch(buf, WEBP_MARK, 8)) return 'webp';
  return null;
}

export function formatFromMime(mime: string): ImageFormat | null {
  if (mime === 'image/jpeg') return 'jpeg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return null;
}

// ─── File validation ───────────────────────────────────────────────────────────

export type ImageValidationError =
  | 'empty-file'
  | 'file-too-large'
  | 'unsupported-format'
  | 'invalid-extension';

export interface ImageValidationResult {
  valid: boolean;
  error?: ImageValidationError;
  message?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (file.size === 0) {
    return { valid: false, error: 'empty-file', message: 'File is empty.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'file-too-large',
      message: `File exceeds the 50 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }
  const lower = file.name.toLowerCase();
  const hasExt = ACCEPTED_EXTENSIONS.some((e) => lower.endsWith(e));
  const hasMime = ACCEPTED_MIME_TYPES.includes(file.type as ImageMime);
  if (!hasExt && !hasMime) {
    return {
      valid: false,
      error: 'unsupported-format',
      message: 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }
  return { valid: true };
}

// ─── Dimension validation ──────────────────────────────────────────────────────

export function validateDimension(value: number, name = 'dimension'): string | null {
  if (!Number.isFinite(value) || value < MIN_DIMENSION) {
    return `${name} must be at least ${MIN_DIMENSION}px.`;
  }
  if (value > MAX_DIMENSION) {
    return `${name} must not exceed ${MAX_DIMENSION}px.`;
  }
  return null;
}

// ─── Output filename helpers ───────────────────────────────────────────────────

/** Strip path components and null bytes; keep only the base filename. */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/\\/g, '/')
    .split('/')
    .pop()!
    .replace(/[\x00-\x1f]/g, '')
    .trim() || 'image';
}

export function changeExtension(filename: string, ext: string): string {
  const base = sanitizeFilename(filename);
  const dot = base.lastIndexOf('.');
  const stem = dot > 0 ? base.slice(0, dot) : base;
  return `${stem}${ext}`;
}

// ─── Format support detection (browser capabilities) ─────────────────────────

let _webpEncodeSupported: boolean | null = null;

/** Returns true if the browser can encode to WebP via canvas.toBlob. */
export async function canEncodeWebP(): Promise<boolean> {
  if (_webpEncodeSupported !== null) return _webpEncodeSupported;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, 'image/webp', 0.8)
    );
    _webpEncodeSupported = blob !== null && blob.type === 'image/webp';
  } catch {
    _webpEncodeSupported = false;
  }
  return _webpEncodeSupported;
}

let _offscreenCanvasSupported: boolean | null = null;

export function isOffscreenCanvasSupported(): boolean {
  if (_offscreenCanvasSupported !== null) return _offscreenCanvasSupported;
  _offscreenCanvasSupported =
    typeof OffscreenCanvas !== 'undefined' &&
    typeof OffscreenCanvas.prototype.convertToBlob === 'function';
  return _offscreenCanvasSupported;
}
