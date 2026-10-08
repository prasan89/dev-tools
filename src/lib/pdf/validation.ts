import {
  PDF_MAX_FILE_SIZE,
  PDF_ACCEPTED_MIME,
  PDF_ACCEPTED_EXTENSION,
  type PdfValidationResult,
} from '@/types/pdf';

const PDF_MAGIC = '%PDF-';

export function validatePdfFile(file: File): PdfValidationResult {
  if (file.size === 0) {
    return { valid: false, error: 'empty-file' };
  }
  if (file.size > PDF_MAX_FILE_SIZE) {
    return { valid: false, error: 'file-too-large' };
  }
  const hasMime = file.type === PDF_ACCEPTED_MIME || file.type === '';
  const hasExt = file.name.toLowerCase().endsWith(PDF_ACCEPTED_EXTENSION);
  if (!hasMime && !hasExt) {
    return { valid: false, error: 'invalid-type' };
  }
  if (!hasExt) {
    return { valid: false, error: 'invalid-extension' };
  }
  return { valid: true };
}

export function validatePdfFiles(files: File[]): PdfValidationResult[] {
  return files.map(validatePdfFile);
}

export async function checkPdfMagicBytes(file: File): Promise<PdfValidationResult> {
  return new Promise((resolve) => {
    try {
      const slice = file.slice(0, 5);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          if (bytes.length < 5) {
            resolve({ valid: false, error: 'corrupted' });
            return;
          }
          const header = String.fromCharCode(...bytes);
          resolve(
            header.startsWith(PDF_MAGIC)
              ? { valid: true }
              : { valid: false, error: 'corrupted' }
          );
        } catch {
          resolve({ valid: false, error: 'corrupted' });
        }
      };
      reader.onerror = () => resolve({ valid: false, error: 'corrupted' });
      reader.readAsArrayBuffer(slice);
    } catch {
      resolve({ valid: false, error: 'corrupted' });
    }
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizePdfFilename(name: string): string {
  return name
    .replace(/\.\./g, '')           // strip path traversal sequences
    .replace(/[/\\]/g, '_')         // replace path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.pdf$/i, '') + '.pdf';
}
