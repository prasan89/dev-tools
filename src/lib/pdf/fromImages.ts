import type { ImageFile } from '@/types/image';

// ─── Page sizes (points: 1pt = 1/72 inch) ────────────────────────────────────

export type PageSizePreset = 'a4' | 'letter' | 'a3' | 'original' | 'custom';
export type OrientationMode = 'portrait' | 'landscape' | 'auto';
export type MarginPreset = 'none' | 'small' | 'medium' | 'large' | 'custom';
export type PlacementMode = 'fit' | 'fill' | 'original' | 'center';

export interface PageDimensions {
  width: number;  // points
  height: number; // points
}

export const PAGE_SIZE_PRESETS: Record<Exclude<PageSizePreset, 'original' | 'custom'>, PageDimensions> = {
  a4:     { width: 595.28, height: 841.89 },
  letter: { width: 612,    height: 792    },
  a3:     { width: 841.89, height: 1190.55 },
};

export const MARGIN_VALUES: Record<Exclude<MarginPreset, 'custom'>, number> = {
  none:   0,
  small:  14.17,  // ~5mm
  medium: 28.35,  // ~10mm
  large:  56.69,  // ~20mm
};

export interface ConvertOptions {
  pageSize: PageSizePreset;
  customWidth: number;   // points, only used when pageSize === 'custom'
  customHeight: number;  // points
  orientation: OrientationMode;
  margin: MarginPreset;
  customMargin: number;  // points
  placement: PlacementMode;
  jpegQuality: number;   // 0–1, for JPEG embeds
}

export const DEFAULT_OPTIONS: ConvertOptions = {
  pageSize: 'a4',
  customWidth: 595.28,
  customHeight: 841.89,
  orientation: 'auto',
  margin: 'small',
  customMargin: 14.17,
  placement: 'fit',
  jpegQuality: 0.88,
};

// ─── Result types ─────────────────────────────────────────────────────────────

export interface ConvertSuccess {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface ConvertError {
  success: false;
  error: string;
  imageIndex?: number;
}

export type ConvertOutcome = ConvertSuccess | ConvertError;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/** Read EXIF orientation from JPEG bytes (no external dependency). Returns 1 if unreadable. */
function readExifOrientation(bytes: Uint8Array): number {
  // JPEG must start with FFD8
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) return 1;

  let offset = 2;
  while (offset < bytes.length - 4) {
    if (bytes[offset] !== 0xFF) break;
    const marker = bytes[offset + 1];
    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];

    // APP1 (0xE1) may contain Exif
    if (marker === 0xE1 && segLen > 6) {
      const app1 = bytes.slice(offset + 4, offset + 4 + segLen - 2);
      // Check for "Exif\0\0"
      if (
        app1[0] === 0x45 && app1[1] === 0x78 && app1[2] === 0x69 &&
        app1[3] === 0x66 && app1[4] === 0x00 && app1[5] === 0x00
      ) {
        const tiff = app1.slice(6);
        // Byte order: 'II' = little-endian, 'MM' = big-endian
        const le = tiff[0] === 0x49 && tiff[1] === 0x49;
        const readU16 = (off: number) =>
          le ? (tiff[off] | (tiff[off + 1] << 8)) : ((tiff[off] << 8) | tiff[off + 1]);
        const readU32 = (off: number) =>
          le
            ? tiff[off] | (tiff[off + 1] << 8) | (tiff[off + 2] << 16) | (tiff[off + 3] << 24)
            : (tiff[off] << 24) | (tiff[off + 1] << 16) | (tiff[off + 2] << 8) | tiff[off + 3];

        const ifdOffset = readU32(4);
        if (ifdOffset + 2 > tiff.length) return 1;
        const entryCount = readU16(ifdOffset);
        for (let i = 0; i < entryCount; i++) {
          const entryOff = ifdOffset + 2 + i * 12;
          if (entryOff + 12 > tiff.length) break;
          const tag = readU16(entryOff);
          if (tag === 0x0112) {
            // Orientation tag
            const val = readU16(entryOff + 8);
            return val >= 1 && val <= 8 ? val : 1;
          }
        }
      }
    }
    offset += 2 + segLen;
  }
  return 1;
}

/**
 * Apply EXIF orientation to a canvas by transforming context before drawing.
 * Returns { drawWidth, drawHeight } — the dimensions to pass to drawImage.
 */
function applyExifTransform(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number,
): void {
  // orientation values 1–8 per EXIF spec
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, canvasW, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, canvasW, canvasH); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, canvasH); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, canvasH, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, canvasH, canvasW); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, canvasW); break;
    default: break; // 1 = normal
  }
  void imgW; void imgH;
}

/** Whether the EXIF orientation swaps width/height (rotations of 90°/270°). */
function isSwappedOrientation(orientation: number): boolean {
  return orientation >= 5 && orientation <= 8;
}

const MAX_CANVAS_SIDE = 8192;
const MAX_CANVAS_AREA = 8192 * 8192;

/**
 * Decode an image File to ImageBitmap, applying EXIF orientation via canvas.
 * Returns a Blob (JPEG or PNG) of the correctly-oriented image, plus dimensions.
 *
 * We always go through canvas to:
 *  1. Apply EXIF orientation for JPEGs
 *  2. Flatten transparency with a white background for JPEGs
 *  3. Downsample if the image exceeds browser canvas limits
 */
async function normalizeImage(
  file: File,
  bytes: Uint8Array,
  jpegQuality: number,
): Promise<{ blob: Blob; width: number; height: number } | null> {
  const isJpeg = file.type === 'image/jpeg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  // Read EXIF orientation for JPEGs
  const exifOrientation = isJpeg ? readExifOrientation(bytes) : 1;
  const swapped = isSwappedOrientation(exifOrientation);

  // For PNGs: get dimensions first to decide whether canvas is needed
  // We need canvas only if the image exceeds browser limits.
  // Otherwise pass raw bytes directly to pdf-lib (avoids canvas toBlob round-trip).
  if (!isJpeg) {
    // Decode dimensions without canvas using an img element
    const blob0 = new Blob([bytes as unknown as Uint8Array<ArrayBuffer>], { type: 'image/png' });
    const url = URL.createObjectURL(blob0);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = document.createElement('img');
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error(`Failed to decode ${file.name}`));
        el.src = url;
      });
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // No downsampling needed — pass raw bytes directly
      if (w <= MAX_CANVAS_SIDE && h <= MAX_CANVAS_SIDE && w * h <= MAX_CANVAS_AREA) {
        return {
          blob: new Blob([bytes as unknown as Uint8Array<ArrayBuffer>], { type: 'image/png' }),
          width: w,
          height: h,
        };
      }

      // Oversized — fall through to canvas downsampling below
      const scale = Math.min(
        MAX_CANVAS_SIDE / Math.max(w, h),
        Math.sqrt(MAX_CANVAS_AREA / (w * h)),
        1,
      );
      const canvasW = Math.max(1, Math.floor(w * scale));
      const canvasH = Math.max(1, Math.floor(h * scale));
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, canvasW, canvasH);
      const outBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });
      if (!outBlob) return null;
      return { blob: outBlob, width: canvasW, height: canvasH };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // JPEG path: always go through canvas for EXIF correction + white background
  const blob0 = new Blob([bytes as unknown as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob0);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = document.createElement('img');
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Failed to decode ${file.name}`));
      el.src = url;
    });

    const rawW = img.naturalWidth;
    const rawH = img.naturalHeight;

    const logicalW = swapped ? rawH : rawW;
    const logicalH = swapped ? rawW : rawH;

    let scale = 1;
    if (logicalW > MAX_CANVAS_SIDE || logicalH > MAX_CANVAS_SIDE) {
      scale = MAX_CANVAS_SIDE / Math.max(logicalW, logicalH);
    }
    if (logicalW * logicalH * scale * scale > MAX_CANVAS_AREA) {
      scale = Math.min(scale, Math.sqrt(MAX_CANVAS_AREA / (logicalW * logicalH)));
    }

    const canvasW = Math.max(1, Math.floor(logicalW * scale));
    const canvasH = Math.max(1, Math.floor(logicalH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.save();
    applyExifTransform(ctx, exifOrientation, rawW, rawH, canvasW, canvasH);
    if (swapped) {
      ctx.drawImage(img, 0, 0, rawH * scale, rawW * scale);
    } else {
      ctx.drawImage(img, 0, 0, canvasW, canvasH);
    }
    ctx.restore();

    const outBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        'image/jpeg',
        Math.max(0.01, Math.min(1, jpegQuality)),
      );
    });
    if (!outBlob) return null;

    return { blob: outBlob, width: canvasW, height: canvasH };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Get effective page dimensions accounting for orientation. */
function getPageDimensions(
  opts: ConvertOptions,
  imgW: number,
  imgH: number,
): PageDimensions {
  let base: PageDimensions;

  if (opts.pageSize === 'original') {
    // Convert pixels to points (72 dpi)
    base = { width: imgW * 0.75, height: imgH * 0.75 };
  } else if (opts.pageSize === 'custom') {
    base = { width: opts.customWidth, height: opts.customHeight };
  } else {
    base = { ...PAGE_SIZE_PRESETS[opts.pageSize] };
  }

  if (opts.orientation === 'landscape') {
    return base.width < base.height
      ? { width: base.height, height: base.width }
      : base;
  }
  if (opts.orientation === 'portrait') {
    return base.width > base.height
      ? { width: base.height, height: base.width }
      : base;
  }
  // auto: match image orientation
  const imgIsLandscape = imgW > imgH;
  const pageIsLandscape = base.width > base.height;
  if (imgIsLandscape !== pageIsLandscape) {
    return { width: base.height, height: base.width };
  }
  return base;
}

function getMarginPt(opts: ConvertOptions): number {
  if (opts.margin === 'custom') return Math.max(0, opts.customMargin);
  return MARGIN_VALUES[opts.margin] ?? 0;
}

/**
 * Compute draw position and size to place the image within available space.
 * Returns {x, y, w, h} in PDF points (already offset by margin).
 */
function computePlacement(
  placement: PlacementMode,
  imgW: number,
  imgH: number,
  availW: number,
  availH: number,
): { x: number; y: number; drawW: number; drawH: number } {
  const imgAspect = imgW / imgH;
  const areaAspect = availW / availH;

  let drawW: number;
  let drawH: number;

  switch (placement) {
    case 'fill': {
      if (imgAspect > areaAspect) {
        drawH = availH;
        drawW = availH * imgAspect;
      } else {
        drawW = availW;
        drawH = availW / imgAspect;
      }
      break;
    }
    case 'original': {
      // 1 pixel = 0.75 pt (72 dpi)
      drawW = Math.min(imgW * 0.75, availW);
      drawH = drawW / imgAspect;
      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * imgAspect;
      }
      break;
    }
    case 'center': {
      drawW = Math.min(imgW * 0.75, availW);
      drawH = drawW / imgAspect;
      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * imgAspect;
      }
      break;
    }
    case 'fit':
    default: {
      if (imgAspect > areaAspect) {
        drawW = availW;
        drawH = availW / imgAspect;
      } else {
        drawH = availH;
        drawW = availH * imgAspect;
      }
      break;
    }
  }

  // Center within available area
  const x = (availW - drawW) / 2;
  const y = (availH - drawH) / 2;
  return { x, y, drawW, drawH };
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Convert an ordered list of image files into a single PDF, entirely in the browser.
 *
 * - Reads and normalizes each image (EXIF orientation, white-fill for JPEG, canvas downsampling)
 * - Embeds using pdf-lib embedJpg / embedPng
 * - Respects page size, orientation, margins, and placement modes
 * - Calls onProgress(done, total) after each page
 * - Respects AbortSignal at each iteration
 */
export async function convertImagesToPdf(
  images: ImageFile[],
  options: ConvertOptions = DEFAULT_OPTIONS,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ConvertOutcome> {
  if (images.length === 0) {
    return { success: false, error: 'No images selected.' };
  }

  if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };

  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };

    const imgFile = images[i];
    let srcBytes: ArrayBuffer;
    try {
      srcBytes = await readFileAsArrayBuffer(imgFile.file);
    } catch {
      return { success: false, error: `Could not read image: ${imgFile.name}`, imageIndex: i };
    }

    if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };

    // Normalize: apply EXIF, flatten transparency, downscale if needed
    let normalizedBlob: Blob;
    let imgW: number;
    let imgH: number;

    const srcU8 = new Uint8Array(srcBytes);
    const normalized = await normalizeImage(imgFile.file, srcU8, options.jpegQuality);
    if (!normalized) {
      return {
        success: false,
        error: `Could not decode image: ${imgFile.name}. The file may be corrupted or an unsupported format.`,
        imageIndex: i,
      };
    }
    normalizedBlob = normalized.blob;
    imgW = normalized.width;
    imgH = normalized.height;

    // Read blob back to bytes for pdf-lib
    const imgBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('blob read failed'));
      reader.readAsArrayBuffer(normalizedBlob);
    });

    // Embed image
    const isJpeg = normalizedBlob.type === 'image/jpeg';
    let embeddedImage: import('pdf-lib').PDFImage;
    try {
      embeddedImage = isJpeg
        ? await pdfDoc.embedJpg(imgBytes)
        : await pdfDoc.embedPng(imgBytes);
    } catch (err: unknown) {
      const msg = String(err);
      if (msg.includes('memory') || msg.includes('Memory')) {
        return {
          success: false,
          error: `Ran out of browser memory on image ${i + 1}. Try fewer or smaller images.`,
          imageIndex: i,
        };
      }
      return {
        success: false,
        error: `Failed to embed image ${i + 1} (${imgFile.name}): ${msg.slice(0, 100)}`,
        imageIndex: i,
      };
    }

    // Page size
    const pageDims = getPageDimensions(options, imgW, imgH);
    const marginPt = getMarginPt(options);
    const availW = Math.max(1, pageDims.width - marginPt * 2);
    const availH = Math.max(1, pageDims.height - marginPt * 2);

    // Placement
    const { x, y, drawW, drawH } = computePlacement(
      options.placement,
      imgW,
      imgH,
      availW,
      availH,
    );

    // Create page
    const page = pdfDoc.addPage([pageDims.width, pageDims.height]);
    page.drawImage(embeddedImage, {
      x: marginPt + x,
      // pdf-lib Y origin is bottom-left; flip: availH - y - drawH
      y: marginPt + (availH - y - drawH),
      width: drawW,
      height: drawH,
    });

    onProgress?.(i + 1, images.length);

    if (signal?.aborted) return { success: false, error: 'Conversion cancelled.' };
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Ran out of browser memory generating the PDF. Try fewer or smaller images.' };
    }
    return { success: false, error: `PDF generation failed: ${msg.slice(0, 100)}` };
  }

  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  return {
    success: true,
    blob,
    filename: 'images-to-pdf.pdf',
    pageCount: images.length,
    sizeBytes: blob.size,
  };
}
