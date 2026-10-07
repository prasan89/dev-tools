import type { PdfFile, PdfToolResult } from '@/types/pdf';

export async function repairPdf(pdfFile: PdfFile): Promise<PdfToolResult> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(
      buf,
      { ignoreEncryption: true, throwOnInvalidObject: false } as Parameters<typeof PDFDocument.load>[1],
    );

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_repaired.pdf`, size: blob.size },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: `Unable to repair: ${msg}. The file may be severely corrupted.`,
    };
  }
}
