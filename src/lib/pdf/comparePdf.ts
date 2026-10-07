import type { PdfFile } from '@/types/pdf';

export interface PageTextContent {
  pageIndex: number;
  text: string;
}

export interface DiffResult {
  pageIndex: number;
  added: string[];
  removed: string[];
  unchanged: number;
}

export async function extractTextPages(pdfFile: PdfFile): Promise<PageTextContent[]> {
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
  const pages: PageTextContent[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push({ pageIndex: i - 1, text });
  }

  return pages;
}

export function diffTextPages(
  pages1: PageTextContent[],
  pages2: PageTextContent[],
): DiffResult[] {
  const maxLen = Math.max(pages1.length, pages2.length);
  const results: DiffResult[] = [];

  for (let i = 0; i < maxLen; i++) {
    const text1 = pages1[i]?.text ?? '';
    const text2 = pages2[i]?.text ?? '';

    const lines1 = text1.split('\n').filter((l) => l.trim().length > 0);
    const lines2 = text2.split('\n').filter((l) => l.trim().length > 0);

    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    const removed = lines1.filter((l) => !set2.has(l));
    const added = lines2.filter((l) => !set1.has(l));
    const unchanged = lines1.filter((l) => set2.has(l)).length;

    results.push({ pageIndex: i, added, removed, unchanged });
  }

  return results;
}

export function hasDifferences(diffs: DiffResult[]): boolean {
  return diffs.some((d) => d.added.length > 0 || d.removed.length > 0);
}
