import type { PdfFile } from '@/types/pdf';

export interface ExtractedPage {
  pageIndex: number;
  text: string;
}

export interface TextExtractionResult {
  pages: ExtractedPage[];
  fullText: string;
}

export async function extractTextFromPdf(
  pdfFile: PdfFile,
): Promise<{ success: boolean; result?: TextExtractionResult; error?: string }> {
  try {
    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerPort) {
      GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
    }

    const pdf = await getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
    const pages: ExtractedPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((s) => s.length > 0)
        .join(' ');
      pages.push({ pageIndex: i - 1, text });
    }

    const fullText = pages
      .map((p, idx) => `\n\n--- Page ${idx + 1} ---\n\n${p.text}`)
      .join('')
      .trim();

    return { success: true, result: { pages, fullText } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to extract text' };
  }
}
