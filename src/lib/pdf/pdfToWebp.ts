import type { PdfFile } from '@/types/pdf';

export interface WebpConversionOptions {
  scale: number;
  quality: number;
  pageSelection: 'all' | 'range';
  pageRange: string;
}

export interface WebpPage {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

export function defaultWebpOptions(): WebpConversionOptions {
  return { scale: 2.0, quality: 0.85, pageSelection: 'all', pageRange: '' };
}

function parseRange(rangeStr: string, total: number): number[] {
  const indices: number[] = [];
  for (const part of rangeStr.split(',')) {
    const t = part.trim();
    if (!t) continue;
    if (t.includes('-')) {
      const [a, b] = t.split('-').map((s) => parseInt(s, 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) {
          if (i >= 1 && i <= total) indices.push(i - 1);
        }
      }
    } else {
      const n = parseInt(t, 10);
      if (!isNaN(n) && n >= 1 && n <= total) indices.push(n - 1);
    }
  }
  return indices;
}

export async function convertPdfToWebp(
  pdfFile: PdfFile,
  options: WebpConversionOptions,
): Promise<{ success: boolean; pages?: WebpPage[]; error?: string }> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined' && !GlobalWorkerOptions.workerPort) {
      GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
    }

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdf = await getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
    const total = pdf.numPages;

    const indices =
      options.pageSelection === 'range'
        ? parseRange(options.pageRange, total)
        : Array.from({ length: total }, (_, i) => i);

    const pages: WebpPage[] = [];

    for (const pi of indices) {
      const page = await pdf.getPage(pi + 1);
      const vp = page.getViewport({ scale: options.scale });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport: vp,
        canvas,
      } as Parameters<typeof page.render>[0]).promise;
      const dataUrl = canvas.toDataURL('image/webp', options.quality);
      pages.push({ pageIndex: pi, dataUrl, width: vp.width, height: vp.height });
    }

    return { success: true, pages };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Conversion failed' };
  }
}
