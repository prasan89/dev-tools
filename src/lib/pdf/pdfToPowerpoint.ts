import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface PowerpointOptions {
  scale: number;
  pageSelection: 'all' | 'range';
  pageRange: string;
}

export function defaultPowerpointOptions(): PowerpointOptions {
  return { scale: 1.5, pageSelection: 'all', pageRange: '' };
}

function parsePageRangeToIndices(rangeStr: string, totalPages: number): number[] {
  const indices: number[] = [];
  for (const part of rangeStr.split(',')) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b && i <= totalPages; i++) {
          if (i >= 1) indices.push(i - 1);
        }
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) indices.push(n - 1);
    }
  }
  return indices;
}

export async function convertPdfToPowerpoint(
  pdfFile: PdfFile,
  options: PowerpointOptions,
  createCanvas?: () => HTMLCanvasElement,
): Promise<PdfToolResult> {
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

    const pageIndices =
      options.pageSelection === 'range'
        ? parsePageRangeToIndices(options.pageRange, pdf.numPages)
        : Array.from({ length: pdf.numPages }, (_, i) => i);

    const PptxGenJS = (await import('pptxgenjs')).default;
    const prs = new PptxGenJS();

    const makeCanvas = createCanvas ?? (() => document.createElement('canvas'));

    for (const pi of pageIndices) {
      const page = await pdf.getPage(pi + 1);
      const vp = page.getViewport({ scale: options.scale });
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
      // slide width 10 inches, height proportional
      const slideW = 10;
      const slideH = (h / w) * slideW;
      prs.defineLayout({ name: `Page${pi}`, width: slideW, height: slideH });

      const slide = prs.addSlide();
      slide.addImage({ data: dataUrl, x: 0, y: 0, w: slideW, h: slideH });
    }

    const pptxData = await prs.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
    const blob = new Blob([pptxData], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return { success: true, outputFile: { blob, filename: `${base}.pptx`, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to PowerPoint' };
  }
}
