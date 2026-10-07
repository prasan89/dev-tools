import type { PdfFile } from '@/types/pdf';
import { ocrPdf } from './ocrPdf';

export interface OcrTextOptions {
  language: string;
  pageSelection: 'all' | 'range';
  pageRange: string;
  onProgress?: (page: number, total: number) => void;
}

export function defaultOcrTextOptions(): OcrTextOptions {
  return { language: 'eng', pageSelection: 'all', pageRange: '' };
}

export interface OcrPageResult {
  pageIndex: number;
  text: string;
  confidence: number;
}

export interface OcrTextResult {
  pages: OcrPageResult[];
  fullText: string;
  averageConfidence: number;
}

export async function extractTextViaOcr(
  pdfFile: PdfFile,
  options: OcrTextOptions,
): Promise<{ success: boolean; result?: OcrTextResult; error?: string }> {
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

  const pages: OcrPageResult[] = ocrResult.pages;
  const fullText = pages
    .map((p, i) => `--- Page ${i + 1} ---\n${p.text}`)
    .join('\n\n');
  const averageConfidence =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.confidence, 0) / pages.length)
      : 0;

  return { success: true, result: { pages, fullText, averageConfidence } };
}
