import type { PdfFile } from '@/types/pdf';

// ─── Range parsing ────────────────────────────────────────────────────────────

export interface ParsedRange {
  ranges: Array<[number, number]>; // 1-based inclusive pairs
  pages: number[];                 // sorted unique 1-based page numbers
}

export interface RangeParseError {
  error: string;
}

export type RangeParseResult = ParsedRange | RangeParseError;

/**
 * Parse a range string like "1-5,8,10-12" into a sorted unique list of 1-based page numbers.
 * Validates against the given pageCount.
 */
export function parsePageRanges(input: string, pageCount: number): RangeParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { error: 'Empty range input.' };

  const segments = trimmed.split(/[,;\s]+/).filter(Boolean);
  const pageSet = new Set<number>();
  const ranges: Array<[number, number]> = [];

  for (const seg of segments) {
    const rangeParts = seg.split('-');
    if (rangeParts.length === 1) {
      const n = parseInt(rangeParts[0], 10);
      if (isNaN(n) || n < 1) return { error: `"${seg}" is not a valid page number.` };
      if (n > pageCount) return { error: `Page ${n} exceeds the document's ${pageCount} pages.` };
      pageSet.add(n);
      ranges.push([n, n]);
    } else if (rangeParts.length === 2) {
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < 1) {
        return { error: `"${seg}" is not a valid range.` };
      }
      if (start > end) return { error: `Range "${seg}" is invalid — start must not exceed end.` };
      if (end > pageCount) return { error: `Page ${end} exceeds the document's ${pageCount} pages.` };
      ranges.push([start, end]);
      for (let p = start; p <= end; p++) pageSet.add(p);
    } else {
      return { error: `"${seg}" is not a valid range expression.` };
    }
  }

  const pages = [...pageSet].sort((a, b) => a - b);
  return { ranges, pages };
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface ExtractSuccess {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface ExtractError {
  success: false;
  error: string;
}

export type ExtractOutcome = ExtractSuccess | ExtractError;

// ─── PDF generation ───────────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function buildOutputFilename(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 50);
  return `${base}-extracted.pdf`;
}

/**
 * Extract specific pages (1-based sorted) from a PDF and return a new PDF blob.
 * Pages are in original document order; content is NOT rasterized.
 */
export async function extractPages(
  pdfFile: PdfFile,
  pages: number[], // 1-based, must be sorted and in-range
  signal?: AbortSignal,
): Promise<ExtractOutcome> {
  if (pages.length === 0) {
    return { success: false, error: 'No pages selected for extraction.' };
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

  let srcDoc: import('pdf-lib').PDFDocument;
  try {
    srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: false });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be processed.' };
    }
    return { success: false, error: 'This PDF appears to be corrupted or is not a valid PDF.' };
  }

  const totalPages = srcDoc.getPageCount();
  for (const p of pages) {
    if (p < 1 || p > totalPages) {
      return { success: false, error: `Page ${p} is out of range (document has ${totalPages} pages).` };
    }
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  // Convert to 0-based indices (already in sorted document order)
  const indices = pages.map((p) => p - 1);
  const outDoc = await PDFDocument.create();

  let copiedPages: import('pdf-lib').PDFPage[];
  try {
    copiedPages = await outDoc.copyPages(srcDoc, indices);
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough browser memory to extract pages. Try a smaller selection.' };
    }
    return { success: false, error: `Failed to copy pages: ${msg.slice(0, 100)}` };
  }

  for (const page of copiedPages) {
    outDoc.addPage(page);
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await outDoc.save({ useObjectStreams: true });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough browser memory to generate the PDF.' };
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
