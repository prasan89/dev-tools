import type { PdfFile } from '@/types/pdf';

export interface SvgConversionOptions {
  scale: number;
  pageIndex: number;
}

export function defaultSvgOptions(): SvgConversionOptions {
  return { scale: 2.0, pageIndex: 0 };
}

export async function convertPdfPageToSvg(
  pdfFile: PdfFile,
  options: SvgConversionOptions,
  createCanvas?: () => HTMLCanvasElement,
): Promise<{ success: boolean; svg?: string; width?: number; height?: number; error?: string }> {
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
    const pageNum = Math.min(Math.max(0, options.pageIndex), pdf.numPages - 1);
    const page = await pdf.getPage(pageNum + 1);
    const vp = page.getViewport({ scale: options.scale });
    const w = Math.round(vp.width);
    const h = Math.round(vp.height);

    const makeCanvas = createCanvas ?? (() => document.createElement('canvas'));
    const canvas = makeCanvas();
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport: vp,
        canvas,
      } as Parameters<typeof page.render>[0]).promise;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <image href="${dataUrl}" width="${w}" height="${h}"/>\n</svg>`;

    return { success: true, svg, width: w, height: h };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to SVG' };
  }
}

export async function convertPdfToSvg(
  pdfFile: PdfFile,
  scale = 2.0,
  createCanvas?: () => HTMLCanvasElement,
): Promise<{ success: boolean; svgs?: string[]; error?: string }> {
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
    const makeCanvas = createCanvas ?? (() => document.createElement('canvas'));
    const svgs: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale });
      const w = Math.round(vp.width);
      const h = Math.round(vp.height);
      const canvas = makeCanvas();
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx as unknown as CanvasRenderingContext2D,
          viewport: vp,
          canvas,
        } as Parameters<typeof page.render>[0]).promise;
      }
      const dataUrl = canvas.toDataURL('image/png');
      svgs.push(
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <image href="${dataUrl}" width="${w}" height="${h}"/>\n</svg>`,
      );
    }

    return { success: true, svgs };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to SVG' };
  }
}
