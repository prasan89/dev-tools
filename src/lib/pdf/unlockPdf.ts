import type { PdfFile, PdfToolResult } from '@/types/pdf';
import type { PasswordRequestCallback } from '@/lib/pdf/loadPdfWithPassword';

export type { PasswordRequestCallback };

export async function unlockPdf(
  pdfFile: PdfFile,
  onPasswordRequest: PasswordRequestCallback,
): Promise<PdfToolResult> {
  try {
    const { loadPdfWithPassword } = await import('@/lib/pdf/loadPdfWithPassword');
    const { PDFDocument } = await import('pdf-lib');

    // pdfjs handles decryption transparently when given the correct password.
    // getData() on the loaded doc returns the fully-decrypted raw PDF bytes.
    const { doc: pdfjsDoc, objectUrl } = await loadPdfWithPassword(pdfFile.file, onPasswordRequest);

    let decryptedBytes: Uint8Array;
    try {
      decryptedBytes = await pdfjsDoc.getData();
    } finally {
      pdfjsDoc.cleanup();
      URL.revokeObjectURL(objectUrl);
    }

    // Load those decrypted bytes into pdf-lib and re-save without encryption.
    const pdfDoc = await PDFDocument.load(decryptedBytes);
    const bytes = await pdfDoc.save();

    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_unlocked.pdf`, size: blob.size },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'Aborted' || msg.includes('cancel') || msg.includes('Cancel')) {
      return { success: false, error: 'Cancelled' };
    }
    return { success: false, error: 'Failed to unlock PDF. Please check the password and try again.' };
  }
}
