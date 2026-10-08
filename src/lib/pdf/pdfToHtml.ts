import type { PdfFile } from '@/types/pdf';

export interface HtmlConversionOptions {
  scale: number;
  includePageNumbers: boolean;
}

export function defaultHtmlOptions(): HtmlConversionOptions {
  return { scale: 1.5, includePageNumbers: true };
}

export async function convertPdfToHtml(
  pdfFile: PdfFile,
  options: HtmlConversionOptions = defaultHtmlOptions(),
  createCanvas?: () => HTMLCanvasElement,
): Promise<{ success: boolean; html?: string; pageCount?: number; error?: string }> {
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
    const pageImages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: options.scale });
      const canvas = makeCanvas();
      canvas.width = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx as unknown as CanvasRenderingContext2D,
          viewport: vp,
          canvas,
        } as Parameters<typeof page.render>[0]).promise;
      }
      pageImages.push(canvas.toDataURL('image/png'));
    }

    const imgTags = pageImages
      .map((src, idx) => {
        const label = options.includePageNumbers
          ? `<p style="text-align:center;font-family:sans-serif;font-size:12px;color:#666;margin:4px 0 12px">Page ${idx + 1}</p>`
          : '';
        return `<div style="margin-bottom:24px;text-align:center">\n  <img src="${src}" style="max-width:100%;box-shadow:0 2px 8px rgba(0,0,0,.15)" alt="Page ${idx + 1}">\n  ${label}\n</div>`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pdfFile.name.replace(/\.pdf$/i, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</title>
<style>body{margin:0;padding:24px;background:#f5f5f5}div{box-sizing:border-box}</style>
</head>
<body>
${imgTags}
</body>
</html>`;

    return { success: true, html, pageCount: pdf.numPages };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to HTML' };
  }
}
