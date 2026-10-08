import type { PdfFile, PdfToolResult } from '@/types/pdf';
import { ocrPdf } from './ocrPdf';

export interface OcrPdfOptions {
  language: string;
  pageSelection: 'all' | 'range';
  pageRange: string;
  onProgress?: (page: number, total: number) => void;
}

export function defaultOcrPdfOptions(): OcrPdfOptions {
  return { language: 'eng', pageSelection: 'all', pageRange: '' };
}

export async function buildOcrSearchablePdf(
  pdfFile: PdfFile,
  options: OcrPdfOptions,
): Promise<PdfToolResult> {
  const totalPages = pdfFile.pageCount ?? 1;

  const ocrResult = await ocrPdf(
    pdfFile.file,
    totalPages,
    options.onProgress
      ? ({ pageIndex, total }) => options.onProgress!(pageIndex, total)
      : undefined,
    2.0,
    options.language || 'eng',
  );

  if (!ocrResult.success || !ocrResult.pages) {
    return { success: false, error: ocrResult.error ?? 'OCR failed' };
  }

  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const pageResult of ocrResult.pages) {
      const { pageIndex, words = [], imageWidth = 0, imageHeight = 0, text } = pageResult;
      if (pageIndex >= pdfDoc.getPageCount()) continue;
      const page = pdfDoc.getPage(pageIndex);
      const { width: pageW, height: pageH } = page.getSize();

      if (words.length > 0 && imageWidth > 0 && imageHeight > 0) {
        // Scale factor from OCR image coordinates to PDF page coordinates.
        // OCR bbox origin is top-left; PDF origin is bottom-left.
        const scaleX = pageW / imageWidth;
        const scaleY = pageH / imageHeight;

        for (const word of words) {
          if (!word.text.trim()) continue;
          const pdfX = word.x0 * scaleX;
          // Convert OCR y (top-down) to PDF y (bottom-up)
          const wordHeightPx = word.y1 - word.y0;
          const pdfY = pageH - word.y1 * scaleY;
          const fontSize = Math.max(1, wordHeightPx * scaleY);

          page.drawText(word.text, {
            x: pdfX,
            y: pdfY,
            size: fontSize,
            font,
            color: rgb(1, 1, 1),
            opacity: 0,
          });
        }
      } else if (text.trim()) {
        // Fallback: no word bboxes available — place full text invisibly at bottom
        page.drawText(text.slice(0, 2000), {
          x: 0,
          y: 10,
          size: 1,
          font,
          color: rgb(1, 1, 1),
          opacity: 0,
        });
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_searchable.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to build searchable PDF' };
  }
}
