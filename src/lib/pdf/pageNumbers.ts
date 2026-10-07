import type { PdfFile, PdfToolResult } from '@/types/pdf';

export type NumberFormat = '1' | 'Page N' | 'Page N of T' | 'N / T' | 'custom';
export type NumberPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type PageSelection = 'all' | 'odd' | 'even' | 'range';

export interface PageNumberConfig {
  format: NumberFormat;
  customPrefix: string;
  customSuffix: string;
  position: NumberPosition;
  fontFamily: 'Helvetica' | 'Courier' | 'Times New Roman';
  fontSize: number;
  color: string;      // hex
  opacity: number;    // 0–1
  marginX: number;
  marginY: number;
  startNumber: number;
  pageOffset: number; // skip N pages at start (no number printed)
  pageSelection: PageSelection;
  pageRange: string;
}

export function defaultConfig(): PageNumberConfig {
  return {
    format: 'Page N of T',
    customPrefix: 'Page ',
    customSuffix: '',
    position: 'bottom-center',
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#374151',
    opacity: 1,
    marginX: 40,
    marginY: 24,
    startNumber: 1,
    pageOffset: 0,
    pageSelection: 'all',
    pageRange: '',
  };
}

export function formatPageNumber(
  pageNumber: number,
  totalPages: number,
  config: PageNumberConfig,
): string {
  const n = pageNumber;
  const t = totalPages;
  switch (config.format) {
    case '1':            return String(n);
    case 'Page N':       return `Page ${n}`;
    case 'Page N of T':  return `Page ${n} of ${t}`;
    case 'N / T':        return `${n} / ${t}`;
    case 'custom':       return `${config.customPrefix}${n}${config.customSuffix}`;
  }
}

function parsePageRange(rangeStr: string, totalPages: number): Set<number> {
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

export function selectedPageIndices(config: PageNumberConfig, totalPages: number): number[] {
  switch (config.pageSelection) {
    case 'all':
      return Array.from({ length: totalPages }, (_, i) => i);
    case 'odd':
      return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 0);
    case 'even':
      return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 1);
    case 'range':
      return [...parsePageRange(config.pageRange, totalPages)];
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return { r: ((n >> 16) & 0xff) / 255, g: ((n >> 8) & 0xff) / 255, b: (n & 0xff) / 255 };
}

function calcPosition(
  position: NumberPosition,
  pageW: number,
  pageH: number,
  textW: number,
  textH: number,
  marginX: number,
  marginY: number,
): { x: number; y: number } {
  const cx = pageW / 2 - textW / 2;
  switch (position) {
    case 'top-left':      return { x: marginX, y: pageH - textH - marginY };
    case 'top-center':    return { x: cx, y: pageH - textH - marginY };
    case 'top-right':     return { x: pageW - textW - marginX, y: pageH - textH - marginY };
    case 'bottom-left':   return { x: marginX, y: marginY };
    case 'bottom-center': return { x: cx, y: marginY };
    case 'bottom-right':  return { x: pageW - textW - marginX, y: marginY };
  }
}

async function embedFontForFamily(
  pdfDoc: import('pdf-lib').PDFDocument,
  family: string,
): Promise<import('pdf-lib').PDFFont> {
  const { StandardFonts } = await import('pdf-lib');
  const map: Record<string, string> = {
    Helvetica: StandardFonts.Helvetica,
    Courier: StandardFonts.Courier,
    'Times New Roman': StandardFonts.TimesRoman,
  };
  return pdfDoc.embedFont(map[family] ?? StandardFonts.Helvetica);
}

export async function buildPageNumberedPdf(
  pdfFile: PdfFile,
  config: PageNumberConfig,
): Promise<PdfToolResult> {
  try {
    const { PDFDocument, rgb } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices = selectedPageIndices(config, totalPages);
    const font = await embedFontForFamily(pdfDoc, config.fontFamily);
    const { r, g, b } = hexToRgb(config.color);

    // Count only non-skipped pages for numbering display
    const printableTotal = pageIndices.filter((i) => i >= config.pageOffset).length;

    let counter = 0;
    for (const pi of pageIndices) {
      if (pi < config.pageOffset) continue;
      counter++;
      const pageNumber = config.startNumber + counter - 1;
      const label = formatPageNumber(pageNumber, printableTotal, config);
      const textW = font.widthOfTextAtSize(label, config.fontSize);
      const textH = config.fontSize;
      const page = pdfDoc.getPage(pi);
      const { width: pw, height: ph } = page.getSize();
      const { x, y } = calcPosition(
        config.position, pw, ph, textW, textH, config.marginX, config.marginY,
      );
      page.drawText(label, {
        x,
        y,
        size: config.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: config.opacity,
      });
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_numbered.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add page numbers' };
  }
}
