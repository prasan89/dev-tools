import type { PdfFile } from '@/types/pdf';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CropRect {
  x: number; // points from left of page
  y: number; // points from bottom of page (PDF coordinate system)
  w: number; // width in points
  h: number; // height in points
}

export interface PageCropConfig {
  /** Original page dimensions in points */
  pageWidth: number;
  pageHeight: number;
  /** Current /Rotate value on the page (0, 90, 180, 270) */
  pageRotation: number;
  /** The crop to apply (in PDF page coordinate space) */
  crop: CropRect;
}

export type CropModeType = 'all' | 'current' | 'selected' | 'per-page';
export type AspectRatioMode = 'free' | '1:1' | '4:3' | '16:9' | 'a4' | 'letter';
export type PresetMode = 'original' | 'a4' | 'a5' | 'letter' | 'square' | 'custom';

export interface CropSuccess {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface CropError {
  success: false;
  error: string;
}

export type CropOutcome = CropSuccess | CropError;

// ─── Aspect ratio helpers ─────────────────────────────────────────────────────

export function getAspectRatio(mode: AspectRatioMode): number | null {
  switch (mode) {
    case '1:1': return 1;
    case '4:3': return 4 / 3;
    case '16:9': return 16 / 9;
    case 'a4': return 210 / 297; // portrait
    case 'letter': return 8.5 / 11; // portrait
    default: return null; // free
  }
}

/**
 * Constrain a crop rectangle to an aspect ratio.
 * Adjusts height to match the ratio while keeping x/y fixed.
 */
export function constrainToAspectRatio(
  rect: CropRect,
  ratio: number,
  pageW: number,
  pageH: number,
): CropRect {
  let { x, y, w, h } = rect;
  h = w / ratio;
  // Clamp within page
  if (y + h > pageH) {
    h = pageH - y;
    w = h * ratio;
  }
  if (x + w > pageW) w = pageW - x;
  return { x, y, w, h };
}

// ─── Preset helpers ───────────────────────────────────────────────────────────

/** Return preset dimensions in points (72pt = 1in). */
export function getPresetDimensions(preset: PresetMode): { w: number; h: number } | null {
  switch (preset) {
    case 'a4':     return { w: 595.28, h: 841.89 };
    case 'a5':     return { w: 419.53, h: 595.28 };
    case 'letter': return { w: 612,    h: 792    };
    case 'square': return null; // handled separately
    default:       return null;
  }
}

/**
 * Compute a centered crop rectangle for a given preset within a page.
 * Returns null for 'original' (no crop needed) and 'custom'.
 */
export function presetToCrop(
  preset: PresetMode,
  pageW: number,
  pageH: number,
): CropRect | null {
  if (preset === 'original' || preset === 'custom') return null;

  if (preset === 'square') {
    const side = Math.min(pageW, pageH);
    return {
      x: (pageW - side) / 2,
      y: (pageH - side) / 2,
      w: side,
      h: side,
    };
  }

  const dims = getPresetDimensions(preset);
  if (!dims) return null;

  // Fit preset within page, preserving aspect ratio
  const presetAspect = dims.w / dims.h;
  const pageAspect = pageW / pageH;
  let w: number;
  let h: number;
  if (presetAspect > pageAspect) {
    w = pageW;
    h = pageW / presetAspect;
  } else {
    h = pageH;
    w = pageH * presetAspect;
  }
  return {
    x: (pageW - w) / 2,
    y: (pageH - h) / 2,
    w,
    h,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateCrop(crop: CropRect, pageW: number, pageH: number): string | null {
  if (crop.w < 1 || crop.h < 1) return 'Crop region is too small.';
  if (crop.x < 0 || crop.y < 0) return 'Crop region extends outside the page.';
  if (crop.x + crop.w > pageW + 0.5 || crop.y + crop.h > pageH + 0.5) {
    return 'Crop region extends beyond the page boundaries.';
  }
  return null;
}

// ─── Output filename ──────────────────────────────────────────────────────────

function buildOutputFilename(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 50);
  return `${base}-cropped.pdf`;
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

// ─── PDF generation ───────────────────────────────────────────────────────────

/**
 * Apply crop boxes to a PDF using pdf-lib.
 * Sets /CropBox and /MediaBox on each page — no rasterization.
 *
 * cropConfigs: map of 0-based page index → PageCropConfig.
 * Pages not in the map are left unchanged.
 */
export async function buildCroppedPdf(
  pdfFile: PdfFile,
  cropConfigs: Map<number, CropRect>,
  signal?: AbortSignal,
): Promise<CropOutcome> {
  if (cropConfigs.size === 0) {
    return { success: false, error: 'No crop regions specified.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  const { PDFDocument } = await import('pdf-lib');

  let doc: import('pdf-lib').PDFDocument;
  try {
    doc = await PDFDocument.load(srcBytes, { ignoreEncryption: false });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be cropped.' };
    }
    return { success: false, error: 'This PDF appears to be corrupted or is not a valid PDF.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  const pages = doc.getPages();

  for (const [pageIdx, crop] of cropConfigs.entries()) {
    if (pageIdx < 0 || pageIdx >= pages.length) continue;
    const page = pages[pageIdx];
    const { width, height } = page.getSize();

    // Validate crop against actual page dimensions
    const err = validateCrop(crop, width, height);
    if (err) {
      return { success: false, error: `Page ${pageIdx + 1}: ${err}` };
    }

    // pdf-lib Y origin is bottom-left, matching CropRect convention
    page.setCropBox(crop.x, crop.y, crop.w, crop.h);
    // Also set MediaBox to match so viewers don't show the uncropped area
    page.setMediaBox(crop.x, crop.y, crop.w, crop.h);
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await doc.save({ useObjectStreams: true });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough browser memory to save this PDF. Try a smaller file.' };
    }
    return { success: false, error: `PDF generation failed: ${msg.slice(0, 100)}` };
  }

  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  return {
    success: true,
    blob,
    filename: buildOutputFilename(pdfFile.name),
    pageCount: pages.length,
    sizeBytes: blob.size,
  };
}
