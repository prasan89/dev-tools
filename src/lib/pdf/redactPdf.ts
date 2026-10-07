import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface RedactionRect {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function addRedactionRect(rects: RedactionRect[], rect: RedactionRect): RedactionRect[] {
  return [...rects, rect];
}

export function removeRedactionRect(rects: RedactionRect[], id: string): RedactionRect[] {
  return rects.filter((r) => r.id !== id);
}

export async function buildRedactedPdf(
  pdfFile: PdfFile,
  rects: RedactionRect[],
): Promise<PdfToolResult> {
  if (rects.length === 0) {
    return { success: false, error: 'No redactions to apply' };
  }

  try {
    const { PDFDocument, rgb } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const pageCount = pdfDoc.getPageCount();

    for (const rect of rects) {
      if (rect.pageIndex < 0 || rect.pageIndex >= pageCount) continue;
      const page = pdfDoc.getPage(rect.pageIndex);
      page.drawRectangle({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        color: rgb(0, 0, 0),
        opacity: 1,
        borderWidth: 0,
      });
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_redacted.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to redact PDF' };
  }
}
