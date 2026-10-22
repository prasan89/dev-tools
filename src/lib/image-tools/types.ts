export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';
export type ImageFormat = 'jpeg' | 'png' | 'webp';

export const MIME_TO_FORMAT: Record<ImageMime, ImageFormat> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const FORMAT_TO_MIME: Record<ImageFormat, ImageMime> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const FORMAT_EXTENSIONS: Record<ImageFormat, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
};

// ─── Input image record ────────────────────────────────────────────────────────

export interface ImageInfo {
  id: string;
  name: string;
  size: number;
  width: number;
  height: number;
  format: ImageFormat;
  objectUrl: string;
  hasTransparency?: boolean;
}

// ─── Processing results ────────────────────────────────────────────────────────

export interface CompressOptions {
  quality: number;       // 0–1
  maxWidth?: number;
  maxHeight?: number;
  targetSizeKb?: number;
}

export interface CompressResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  originalSize: number;
  outputSize: number;
  format: ImageFormat;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  percent?: number;
  keepAspectRatio: boolean;
  outputFormat?: ImageFormat;
  quality?: number;
}

export interface ResizeResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  originalWidth: number;
  originalHeight: number;
  format: ImageFormat;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  outputFormat?: ImageFormat;
  quality?: number;
}

export interface CropResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  format: ImageFormat;
}

export interface ConvertOptions {
  outputFormat: ImageFormat;
  quality?: number;
  /** Background fill color for JPEG output (default: white) */
  jpegBackground?: string;
}

export interface ConvertResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  outputFormat: ImageFormat;
  transparencyLost: boolean;
}

export type RotateAngle = 90 | 180 | 270;
export type FlipDirection = 'horizontal' | 'vertical';

export interface TransformOptions {
  rotate?: RotateAngle;
  flip?: FlipDirection;
  outputFormat?: ImageFormat;
  quality?: number;
}

export interface TransformResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  format: ImageFormat;
}

// ─── Queue types ───────────────────────────────────────────────────────────────

export type QueueItemStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueueItem<TOptions, TResult> {
  id: string;
  file: File;
  imageInfo?: ImageInfo;
  options: TOptions;
  status: QueueItemStatus;
  progress: number;
  result?: TResult;
  error?: string;
  outputUrl?: string;
}

// ─── Inspect result ────────────────────────────────────────────────────────────

export interface InspectResult {
  width: number;
  height: number;
  format: ImageFormat;
  hasTransparency: boolean;
}

export interface ProcessProgress {
  fileId: string;
  progress: number;
  stage?: string;
}
