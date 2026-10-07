export interface OcrPageResult {
  pageIndex: number;
  text: string;
  confidence: number;
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
): Promise<OcrResult> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');

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
      pages.push({
        pageIndex: i - 1,
        text: result.data.text,
        confidence: result.data.confidence,
      });
    }

    await worker.terminate();

    const fullText = pages.map((p, i) => `--- Page ${i + 1} ---\n${p.text}`).join('\n\n');
    return { success: true, pages, fullText };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'OCR failed' };
  }
}
