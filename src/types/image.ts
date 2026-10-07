export interface ImageFile {
  id: string;
  name: string;
  size: number;
  file: File;
  objectUrl: string | null;
  /** Natural width in pixels — null until decoded */
  width: number | null;
  /** Natural height in pixels — null until decoded */
  height: number | null;
  /** EXIF orientation (1–8) or null if not applicable/readable */
  exifOrientation: number | null;
  isCorrupted: boolean;
  loadedAt: number;
}

export type ImageFormat = 'jpeg' | 'png';

export const IMAGE_ACCEPTED_MIME = 'image/jpeg,image/png';
export const IMAGE_ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
export const IMAGE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const IMAGE_MAX_FILES = 50;

export type ImageValidationError =
  | 'invalid-type'
  | 'empty-file'
  | 'file-too-large';

export interface ImageValidationResult {
  valid: boolean;
  error?: ImageValidationError;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (file.size === 0) return { valid: false, error: 'empty-file' };
  if (file.size > IMAGE_MAX_FILE_SIZE) return { valid: false, error: 'file-too-large' };
  const lower = file.name.toLowerCase();
  const hasExt = IMAGE_ACCEPTED_EXTENSIONS.some((e) => lower.endsWith(e));
  const hasMime = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === '';
  if (!hasExt && !hasMime) return { valid: false, error: 'invalid-type' };
  return { valid: true };
}
