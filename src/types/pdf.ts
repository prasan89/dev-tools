export interface PdfFile {
  id: string;
  name: string;
  size: number;
  file: File;
  objectUrl: string | null;
  pageCount: number | null;
  isPasswordProtected: boolean;
  isCorrupted: boolean;
  loadedAt: number;
}

export type PdfProcessingState =
  | 'idle'
  | 'loading'
  | 'rendering'
  | 'ready'
  | 'error'
  | 'password-required'
  | 'corrupted';

export interface PdfViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  rotation: number;
  fitMode: 'none' | 'width' | 'page';
}

export interface PdfValidationResult {
  valid: boolean;
  error?: PdfValidationError;
  isPasswordProtected?: boolean;
}

export type PdfValidationError =
  | 'invalid-type'
  | 'invalid-extension'
  | 'empty-file'
  | 'file-too-large'
  | 'corrupted'
  | 'password-protected';

export interface PdfToolResult {
  success: boolean;
  outputFile?: {
    blob: Blob;
    filename: string;
    size: number;
  };
  error?: string;
  pageCount?: number;
}

export const PDF_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const PDF_LARGE_FILE_WARNING = 25 * 1024 * 1024; // 25MB
export const PDF_ACCEPTED_MIME = 'application/pdf';
export const PDF_ACCEPTED_EXTENSION = '.pdf';
export const PDF_MAX_FILES = 10;
