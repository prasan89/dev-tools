import type { PdfFile } from '@/types/pdf';

export interface MarkdownResult {
  markdown: string;
  pageCount: number;
}

const BULLET_RE = /^[•◦‣⁃\-\*]\s/;
const ALL_CAPS_RE = /^[A-Z0-9\s\-–—:,.!?()'"]{3,60}$/;

export function textToMarkdown(pageTexts: string[]): string {
  const parts: string[] = [];

  pageTexts.forEach((pageText, idx) => {
    if (idx > 0) parts.push('\n\n---\n');
    const lines = pageText.split('\n');
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        parts.push('');
        continue;
      }
      if (ALL_CAPS_RE.test(line) && line.length <= 60) {
        parts.push(`## ${line}`);
      } else if (BULLET_RE.test(line)) {
        parts.push(`- ${line.replace(BULLET_RE, '')}`);
      } else {
        parts.push(line);
      }
    }
  });

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export async function extractMarkdownFromPdf(
  pdfFile: PdfFile,
): Promise<{ success: boolean; result?: MarkdownResult; error?: string }> {
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
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((s) => s.length > 0)
        .join('\n');
      pageTexts.push(text);
    }

    const markdown = textToMarkdown(pageTexts);
    return { success: true, result: { markdown, pageCount: pdf.numPages } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to Markdown' };
  }
}

export async function convertPdfToMarkdown(
  pdfFile: PdfFile,
): Promise<{ success: boolean; markdown?: string; pageCount?: number; error?: string }> {
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
    const parts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((s) => s.length > 0);

      parts.push(`## Page ${i}`);
      parts.push('');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (BULLET_RE.test(trimmed)) {
          parts.push(`- ${trimmed.replace(BULLET_RE, '')}`);
        } else if (ALL_CAPS_RE.test(trimmed) && trimmed.length <= 60) {
          parts.push(`### ${trimmed}`);
        } else {
          parts.push(trimmed);
        }
      }
      if (i < pdf.numPages) parts.push('\n---');
    }

    const markdown = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return { success: true, markdown, pageCount: pdf.numPages };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to Markdown' };
  }
}
