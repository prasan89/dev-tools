import type { PdfFile, PdfToolResult } from '@/types/pdf';

export async function unlockPdf(pdfFile: PdfFile, password: string): Promise<PdfToolResult> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    let pdfDoc: import('pdf-lib').PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(buf, { password } as Parameters<typeof PDFDocument.load>[1]);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('password') || msg.includes('encrypted') || msg.includes('decrypt')) {
        return { success: false, error: 'Incorrect password' };
      }
      throw err;
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_unlocked.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to unlock PDF' };
  }
}
