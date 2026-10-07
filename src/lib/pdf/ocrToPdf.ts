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

    for (const { pageIndex, text } of ocrResult.pages) {
      if (pageIndex >= pdfDoc.getPageCount()) continue;
      const page = pdfDoc.getPage(pageIndex);
      if (!text.trim()) continue;
      page.drawText(text.slice(0, 2000), {
        x: 0,
        y: 10,
        size: 1,
        font,
        color: rgb(1, 1, 1),
        opacity: 0,
      });
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
