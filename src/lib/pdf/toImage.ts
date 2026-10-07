import type { PdfFile } from '@/types/pdf';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageFormat = 'jpeg' | 'png';

export type ResolutionPreset = 'low' | 'medium' | 'high' | 'custom';

/** scale factor applied to PDF viewport (1.0 = 72dpi equivalent, 2.0 = 144dpi, etc.) */
export const RESOLUTION_SCALES: Record<Exclude<ResolutionPreset, 'custom'>, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
};

export interface ConvertOptions {
  format: ImageFormat;
  /** JPEG quality 0–1, ignored for PNG */
  quality: number;
  /** Scale factor: 1.0 = 72 dpi equivalent. Use RESOLUTION_SCALES for presets. */
  scale: number;
  /** 1-based page numbers to convert, sorted */
  pages: number[];
}

export interface ImagePartResult {
  blob: Blob;
  filename: string;
  pageNumber: number;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface ConvertSuccess {
  success: true;
  parts: ImagePartResult[];
}

export interface ConvertError {
  success: false;
  error: string;
  pageNumber?: number;
}

export type ConvertOutcome = ConvertSuccess | ConvertError;

// ─── Canvas safety limits ─────────────────────────────────────────────────────
// Chrome hard limit is 16384×16384; Safari is lower. Stay well under.

const MAX_CANVAS_DIMENSION = 8192;
const MAX_CANVAS_AREA = 8192 * 8192; // ~67 MP

function clampScale(width: number, height: number, requestedScale: number): number {
  const sw = requestedScale * width;
  const sh = requestedScale * height;
  if (sw > MAX_CANVAS_DIMENSION || sh > MAX_CANVAS_DIMENSION) {
    const dimScale = MAX_CANVAS_DIMENSION / Math.max(width, height);
    return Math.min(requestedScale, dimScale);
  }
  if (sw * sh > MAX_CANVAS_AREA) {
    const areaScale = Math.sqrt(MAX_CANVAS_AREA / (width * height));
    return Math.min(requestedScale, areaScale);
  }
  return requestedScale;
}

// ─── pdfjs loader (reuses same pattern as PdfViewer) ─────────────────────────

type PdfjsLib = typeof import('pdfjs-dist');
let pdfjsCache: PdfjsLib | null = null;

async function loadPdfjs(): Promise<PdfjsLib> {
  if (pdfjsCache) return pdfjsCache;
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  pdfjsCache = pdfjs;
  return pdfjs;
}

// ─── File reader helper ───────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

// ─── Canvas → Blob ────────────────────────────────────────────────────────────

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas.toBlob() returned null'));
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? Math.max(0.01, Math.min(1, quality)) : undefined,
    );
  });
}

// ─── Safe filename builder ────────────────────────────────────────────────────

function buildImageFilename(
  originalName: string,
  pageNumber: number,
  format: ImageFormat,
): string {
  const base = originalName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 50);
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  return `${base}-page-${pageNumber}.${ext}`;
}

// ─── Core conversion ──────────────────────────────────────────────────────────

/**
 * Convert selected PDF pages to JPG or PNG images, entirely in the browser.
 *
 * - Renders pages one at a time to release memory between pages
 * - Clamps canvas dimensions to safe browser limits
 * - Calls onProgress(pageIndex, totalPages) after each page
 * - Respects the AbortSignal for cancellation
 */
export async function convertPdfToImages(
  pdfFile: PdfFile,
  options: ConvertOptions,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ConvertOutcome> {
  if (options.pages.length === 0) {
    return { success: false, error: 'No pages selected for conversion.' };
  }

  // Read file
  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };

  // Load pdfjs
  const pdfjs = await loadPdfjs();
  if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };

  // Open document
  const loadingTask = pdfjs.getDocument({
    data: srcBytes,
    disableAutoFetch: true,
    disableStream: false,
    wasmUrl: '/wasm/',
  });

  let doc: import('pdfjs-dist').PDFDocumentProxy;
  try {
    doc = await loadingTask.promise;
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('PasswordException') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be converted.' };
    }
    if (msg.includes('InvalidPDFException') || msg.includes('corrupt')) {
      return { success: false, error: 'This PDF appears to be corrupted or is not a valid PDF.' };
    }
    return { success: false, error: `Failed to open PDF: ${msg.slice(0, 100)}` };
  }

  if (signal?.aborted) {
    doc.cleanup();
    await loadingTask.destroy().catch(() => {});
    return { success: false, error: 'Conversion cancelled.' };
  }

  const totalPages = doc.numPages;
  // Validate all page numbers
  for (const p of options.pages) {
    if (p < 1 || p > totalPages) {
      doc.cleanup();
      await loadingTask.destroy().catch(() => {});
      return {
        success: false,
        error: `Page ${p} does not exist — this PDF has ${totalPages} page${totalPages !== 1 ? 's' : ''}.`,
        pageNumber: p,
      };
    }
  }

  const parts: ImagePartResult[] = [];

  for (let i = 0; i < options.pages.length; i++) {
    if (signal?.aborted) {
      doc.cleanup();
      await loadingTask.destroy().catch(() => {});
      return { success: false, error: 'Conversion cancelled.' };
    }

    const pageNumber = options.pages[i];
    let page: import('pdfjs-dist').PDFPageProxy | null = null;

    try {
      page = await doc.getPage(pageNumber);
      const unscaled = page.getViewport({ scale: 1, rotation: 0 });
      const safeScale = clampScale(unscaled.width, unscaled.height, options.scale);
      const viewport = page.getViewport({ scale: safeScale, rotation: 0 });

      const canvas = document.createElement('canvas');
      const w = Math.floor(viewport.width);
      const h = Math.floor(viewport.height);
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        page.cleanup();
        continue;
      }

      // PNG: transparent background by default; JPG: white fill
      if (options.format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
      await renderTask.promise;

      const blob = await canvasToBlob(canvas, options.format, options.quality);

      parts.push({
        blob,
        filename: buildImageFilename(pdfFile.name, pageNumber, options.format),
        pageNumber,
        width: w,
        height: h,
        sizeBytes: blob.size,
      });

      onProgress?.(i + 1, options.pages.length);
    } catch (err: unknown) {
      if (signal?.aborted) {
        page?.cleanup();
        doc.cleanup();
        await loadingTask.destroy().catch(() => {});
        return { success: false, error: 'Conversion cancelled.' };
      }
      const msg = String(err);
      if (msg.includes('memory') || msg.includes('Memory')) {
        doc.cleanup();
        await loadingTask.destroy().catch(() => {});
        return {
          success: false,
          error: `Ran out of browser memory on page ${pageNumber}. Try fewer pages or a lower resolution.`,
          pageNumber,
        };
      }
      // Try to recover and skip this page — but report error
      page?.cleanup();
      doc.cleanup();
      await loadingTask.destroy().catch(() => {});
      return {
        success: false,
        error: `Failed to render page ${pageNumber}: ${msg.slice(0, 100)}`,
        pageNumber,
      };
    } finally {
      page?.cleanup();
    }
  }

  doc.cleanup();
  await loadingTask.destroy().catch(() => {});

  if (parts.length === 0) {
    return { success: false, error: 'No pages could be converted.' };
  }

  return { success: true, parts };
}
