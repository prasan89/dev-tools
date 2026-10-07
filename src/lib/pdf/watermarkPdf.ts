import type { PdfFile, PdfToolResult } from '@/types/pdf';

// ─── Watermark config types ───────────────────────────────────────────────────

export type WatermarkType = 'text' | 'image';

export type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'diagonal' | 'diagonal-reverse';

export type PageSelection = 'all' | 'odd' | 'even' | 'range';

export interface TextWatermarkConfig {
  type: 'text';
  text: string;
  fontFamily: 'Helvetica' | 'Courier' | 'Times New Roman';
  fontSize: number;
  color: string;        // hex
  opacity: number;      // 0–1
  rotation: number;     // degrees
  position: WatermarkPosition;
  marginX: number;      // pts from edge for non-center positions
  marginY: number;
  pageSelection: PageSelection;
  pageRange: string;    // e.g. "1-3,5"
}

export interface ImageWatermarkConfig {
  type: 'image';
  imageData: string;    // data URL (jpeg/png)
  imageMimeType: 'image/jpeg' | 'image/png';
  imageBytes: Uint8Array;
  width: number;        // pts
  height: number;       // pts
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
  marginX: number;
  marginY: number;
  pageSelection: PageSelection;
  pageRange: string;
}

export type WatermarkConfig = TextWatermarkConfig | ImageWatermarkConfig;

export function defaultTextConfig(): TextWatermarkConfig {
  return {
    type: 'text',
    text: 'CONFIDENTIAL',
    fontFamily: 'Helvetica',
    fontSize: 48,
    color: '#6b7280',
    opacity: 0.25,
    rotation: -45,
    position: 'diagonal',
    marginX: 40,
    marginY: 40,
    pageSelection: 'all',
    pageRange: '',
  };
}

export function defaultImageConfig(): ImageWatermarkConfig {
  return {
    type: 'image',
    imageData: '',
    imageMimeType: 'image/png',
    imageBytes: new Uint8Array(0),
    width: 150,
    height: 75,
    opacity: 0.3,
    rotation: 0,
    position: 'center',
    marginX: 40,
    marginY: 40,
    pageSelection: 'all',
    pageRange: '',
  };
}

// ─── Page selection helpers ───────────────────────────────────────────────────

export function parsePageRange(rangeStr: string, totalPages: number): Set<number> {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) {
          if (i >= 1 && i <= totalPages) pages.add(i - 1);
        }
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.add(n - 1);
    }
  }
  return pages;
}

export function selectedPageIndices(
  config: WatermarkConfig,
  totalPages: number,
): number[] {
  switch (config.pageSelection) {
    case 'all':
      return Array.from({ length: totalPages }, (_, i) => i);
    case 'odd':
      return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 0);
    case 'even':
      return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 1);
    case 'range': {
      return [...parsePageRange(config.pageRange, totalPages)];
    }
  }
}

// ─── Position calculation ─────────────────────────────────────────────────────

export function calcWatermarkPosition(
  position: WatermarkPosition,
  pageW: number,
  pageH: number,
  itemW: number,
  itemH: number,
  marginX: number,
  marginY: number,
): { x: number; y: number } {
  // pdf-lib coords: x left, y from BOTTOM
  const cx = pageW / 2 - itemW / 2;
  const cy = pageH / 2 - itemH / 2;

  switch (position) {
    case 'top-left':     return { x: marginX, y: pageH - itemH - marginY };
    case 'top-center':   return { x: cx, y: pageH - itemH - marginY };
    case 'top-right':    return { x: pageW - itemW - marginX, y: pageH - itemH - marginY };
    case 'center-left':  return { x: marginX, y: cy };
    case 'center':       return { x: cx, y: cy };
    case 'center-right': return { x: pageW - itemW - marginX, y: cy };
    case 'bottom-left':  return { x: marginX, y: marginY };
    case 'bottom-center':return { x: cx, y: marginY };
    case 'bottom-right': return { x: pageW - itemW - marginX, y: marginY };
    case 'diagonal':
    case 'diagonal-reverse': return { x: cx, y: cy };
  }
}

// ─── hex → rgb ────────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return { r: ((n >> 16) & 0xff) / 255, g: ((n >> 8) & 0xff) / 255, b: (n & 0xff) / 255 };
}

// ─── Font family → pdf-lib StandardFonts ─────────────────────────────────────

async function embedFontForFamily(
  pdfDoc: import('pdf-lib').PDFDocument,
  family: string,
): Promise<import('pdf-lib').PDFFont> {
  const { StandardFonts } = await import('pdf-lib');
  const map: Record<string, string> = {
    'Helvetica': StandardFonts.Helvetica,
    'Courier': StandardFonts.Courier,
    'Times New Roman': StandardFonts.TimesRoman,
  };
  return pdfDoc.embedFont(map[family] ?? StandardFonts.Helvetica);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function buildWatermarkedPdf(
  pdfFile: PdfFile,
  config: WatermarkConfig,
): Promise<PdfToolResult> {
  if (config.type === 'text' && !config.text.trim()) {
    return { success: false, error: 'Watermark text cannot be empty' };
  }
  if (config.type === 'image' && config.imageBytes.length === 0) {
    return { success: false, error: 'No watermark image selected' };
  }

  try {
    const { PDFDocument, rgb, degrees } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices = selectedPageIndices(config, totalPages);

    if (config.type === 'text') {
      const font = await embedFontForFamily(pdfDoc, config.fontFamily);
      const textW = font.widthOfTextAtSize(config.text, config.fontSize);
      const textH = config.fontSize;
      const { r, g, b } = hexToRgb(config.color);

      const effectiveRotation =
        config.position === 'diagonal' ? -45
        : config.position === 'diagonal-reverse' ? 45
        : config.rotation;

      for (const pi of pageIndices) {
        const page = pdfDoc.getPage(pi);
        const { width: pw, height: ph } = page.getSize();
        const { x, y } = calcWatermarkPosition(
          config.position, pw, ph, textW, textH, config.marginX, config.marginY,
        );
        page.drawText(config.text, {
          x,
          y,
          size: config.fontSize,
          font,
          color: rgb(r, g, b),
          opacity: config.opacity,
          rotate: degrees(effectiveRotation),
        });
      }
    } else {
      let embeddedImage: import('pdf-lib').PDFImage;
      if (config.imageMimeType === 'image/jpeg') {
        embeddedImage = await pdfDoc.embedJpg(config.imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedPng(config.imageBytes);
      }

      for (const pi of pageIndices) {
        const page = pdfDoc.getPage(pi);
        const { width: pw, height: ph } = page.getSize();
        const { x, y } = calcWatermarkPosition(
          config.position, pw, ph, config.width, config.height, config.marginX, config.marginY,
        );
        page.drawImage(embeddedImage, {
          x,
          y,
          width: config.width,
          height: config.height,
          opacity: config.opacity,
          rotate: degrees(config.rotation),
        });
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_watermarked.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add watermark' };
  }
}
