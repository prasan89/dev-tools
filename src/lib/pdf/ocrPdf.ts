export interface OcrWordBbox {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  confidence: number;
}

export interface OcrPageResult {
  pageIndex: number;
  text: string;
  confidence: number;
  words: OcrWordBbox[];
  imageWidth: number;
  imageHeight: number;
}

export interface OcrResult {
  success: boolean;
  pages?: OcrPageResult[];
  fullText?: string;
  error?: string;
}

export type OcrProgressCallback = (progress: { pageIndex: number; total: number; status: string }) => void;

async function renderPdfPageToCanvas(
  data: ArrayBuffer,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const doc = await pdfjs.getDocument({ data: data.slice(0), disableAutoFetch: true }).promise;
  const page = await doc.getPage(pageNumber);
  const vp = page.getViewport({ scale, rotation: 0 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise;
  }
  return canvas;
}

export async function ocrPdf(
  file: File,
  totalPages: number,
  onProgress?: OcrProgressCallback,
  scale = 2.0,
  language = 'eng',
): Promise<OcrResult> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(language);

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    const pages: OcrPageResult[] = [];

    for (let i = 1; i <= totalPages; i++) {
      onProgress?.({ pageIndex: i - 1, total: totalPages, status: `Processing page ${i} of ${totalPages}…` });
      const canvas = await renderPdfPageToCanvas(buf, i, scale);
      const result = await worker.recognize(canvas);

      const rawWords = (result.data as unknown as {
        words?: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      }).words ?? [];

      const words: OcrWordBbox[] = rawWords
        .filter((w) => w.text.trim())
        .map((w) => ({
          text: w.text,
          x0: w.bbox.x0,
          y0: w.bbox.y0,
          x1: w.bbox.x1,
          y1: w.bbox.y1,
          confidence: w.confidence,
        }));

      pages.push({
        pageIndex: i - 1,
        text: result.data.text,
        confidence: result.data.confidence,
        words,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
      });
    }

    await worker.terminate();

    const fullText = pages.map((p, i) => `--- Page ${i + 1} ---\n${p.text}`).join('\n\n');
    return { success: true, pages, fullText };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'OCR failed' };
  }
}
