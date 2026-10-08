import type { PdfFile } from '@/types/pdf';

// ─── Compression levels ───────────────────────────────────────────────────────

export type CompressionLevel = 'low' | 'recommended' | 'maximum';

export interface CompressionOptions {
  level: CompressionLevel;
  removeMetadata: boolean;
  optimizeObjectStreams: boolean;
}

export const DEFAULT_OPTIONS: CompressionOptions = {
  level: 'recommended',
  removeMetadata: true,
  optimizeObjectStreams: true,
};

// ─── Result types ─────────────────────────────────────────────────────────────

export interface CompressSuccess {
  success: true;
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  reductionPercent: number;
  note?: string;
}

export interface CompressError {
  success: false;
  error: string;
}

export type CompressOutcome = CompressSuccess | CompressError;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let pdfLibCache: typeof import('pdf-lib') | null = null;

async function loadPdfLib() {
  if (pdfLibCache) return pdfLibCache;
  pdfLibCache = await import('pdf-lib');
  return pdfLibCache;
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function buildFilename(original: string): string {
  const base = original.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50);
  return `${base}_compressed.pdf`;
}

// ─── pdf-lib save options by level ───────────────────────────────────────────
//
// pdf-lib's PDFDocument.save() accepts:
//   objectsPerTick   – controls how many objects are processed per "tick" (lower = more GC)
//   useObjectStreams  – pack objects into compressed object streams (reduces size for text-heavy PDFs)
//   addDefaultPage   – irrelevant here
//   updateFieldAppearances – skip for compression
//
// "useObjectStreams: true" is the main lever pdf-lib exposes for size reduction.
// It re-encodes non-stream objects into compressed cross-reference streams (PDF 1.5+),
// which can noticeably reduce file size for PDFs with many small objects (forms, annotations, metadata).
// For already-optimized or image-heavy PDFs the difference is minimal.

interface PdfLibSaveOptions {
  useObjectStreams: boolean;
  objectsPerTick: number;
}

function getSaveOptions(level: CompressionLevel): PdfLibSaveOptions {
  switch (level) {
    case 'low':
      return { useObjectStreams: false, objectsPerTick: 50 };
    case 'recommended':
      return { useObjectStreams: true, objectsPerTick: 50 };
    case 'maximum':
      return { useObjectStreams: true, objectsPerTick: 50 };
  }
}

// ─── Main compress function ───────────────────────────────────────────────────

/**
 * Compress a PDF using pdf-lib's structural optimization.
 *
 * What this does:
 *  - Re-saves the PDF through pdf-lib (removes unreferenced/garbage-collected objects)
 *  - For recommended/maximum: packs objects into compressed object streams (PDF 1.5 cross-reference streams)
 *  - For maximum + removeMetadata: strips document info dictionary (author, creator, producer, etc.)
 *
 * What this does NOT do:
 *  - Resample or re-encode embedded images (pdf-lib doesn't expose image re-encoding)
 *  - Re-compress already-JPEG-compressed images
 *  - Convert color images to grayscale
 *
 * Honest limitations: image-heavy PDFs where images are already compressed will see minimal
 * size reduction. Text-heavy/form-heavy PDFs can see 10–40% reduction from object stream packing.
 */
export async function compressPdf(
  pdfFile: PdfFile,
  options: CompressionOptions = DEFAULT_OPTIONS,
  onProgress?: (msg: string) => void,
): Promise<CompressOutcome> {
  const originalSize = pdfFile.size;

  onProgress?.('Reading PDF…');
  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  onProgress?.('Analyzing PDF…');
  const { PDFDocument } = await loadPdfLib();

  let doc: import('pdf-lib').PDFDocument;
  let pageCount: number;
  try {
    doc = await PDFDocument.load(srcBytes, { ignoreEncryption: false });
    pageCount = doc.getPageCount();
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be compressed.' };
    }
    return { success: false, error: 'This PDF appears to be corrupted or is not a valid PDF.' };
  }

  onProgress?.('Optimizing PDF structure…');

  // Strip metadata for recommended/maximum with removeMetadata
  if (options.removeMetadata && options.level !== 'low') {
    try {
      doc.setProducer('');
      doc.setCreator('');
      doc.setKeywords([]);
      doc.setSubject('');
      doc.setAuthor('');
    } catch {
      // Metadata removal is best-effort — don't fail the whole operation
    }
  }

  onProgress?.('Rebuilding PDF…');

  const saveOpts = getSaveOptions(options.level);
  let compressedBytes: Uint8Array;
  try {
    compressedBytes = await doc.save({
      useObjectStreams: saveOpts.useObjectStreams,
      objectsPerTick: saveOpts.objectsPerTick,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough browser memory to compress this PDF. Try a smaller file.' };
    }
    return { success: false, error: `Compression failed: ${msg.slice(0, 100)}` };
  }

  const blob = new Blob([compressedBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const compressedSize = blob.size;
  const reductionPercent = originalSize > 0
    ? Math.max(0, ((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  let note: string | undefined;
  if (compressedSize >= originalSize) {
    note = 'This PDF is already well-optimized — no further size reduction was possible without sacrificing quality.';
  } else if (reductionPercent < 2) {
    note = 'Minimal reduction achieved. This PDF may already be compressed or contain mostly images that are already optimized.';
  }

  return {
    success: true,
    blob,
    filename: buildFilename(pdfFile.name),
    originalSize,
    compressedSize,
    pageCount,
    reductionPercent,
    note,
  };
}
