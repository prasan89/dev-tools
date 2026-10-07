import type { PdfFile } from '@/types/pdf';

// ─── Range parsing ────────────────────────────────────────────────────────────

export interface ParsedRange {
  start: number; // 1-based
  end: number;   // 1-based, inclusive
}

export type RangeParseResult =
  | { ok: true; ranges: ParsedRange[] }
  | { ok: false; error: string };

/**
 * Parse a page range string into sorted, deduplicated page numbers.
 * Accepts: "1", "1-5", "1,3,5", "2-4,8", "1-3,5,7-9"
 * Returns error for: "0", "20-10", "abc", empty ranges, duplicate pages.
 */
export function parsePageRanges(input: string, totalPages: number): RangeParseResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: 'Enter at least one page number or range.' };

  const seen = new Set<number>();
  const pages: number[] = [];

  const segments = raw.split(',').map((s) => s.trim()).filter(Boolean);

  for (const seg of segments) {
    const rangeParts = seg.split('-').map((s) => s.trim());
    if (rangeParts.length === 1) {
      const n = parseInt(rangeParts[0], 10);
      if (isNaN(n) || !isFinite(n) || String(n) !== rangeParts[0]) {
        return { ok: false, error: `"${seg}" is not a valid page number.` };
      }
      if (n < 1) return { ok: false, error: `Page numbers start at 1 (got ${n}).` };
      if (n > totalPages) return { ok: false, error: `Page ${n} does not exist — this PDF has ${totalPages} page${totalPages !== 1 ? 's' : ''}.` };
      if (!seen.has(n)) { seen.add(n); pages.push(n); }
    } else if (rangeParts.length === 2) {
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);
      if (isNaN(start) || String(start) !== rangeParts[0]) {
        return { ok: false, error: `"${seg}" contains an invalid start page.` };
      }
      if (isNaN(end) || String(end) !== rangeParts[1]) {
        return { ok: false, error: `"${seg}" contains an invalid end page.` };
      }
      if (start < 1) return { ok: false, error: `Page numbers start at 1 (got ${start}).` };
      if (end < start) return { ok: false, error: `Range "${seg}" is reversed — start must be ≤ end.` };
      if (end > totalPages) return { ok: false, error: `Page ${end} does not exist — this PDF has ${totalPages} page${totalPages !== 1 ? 's' : ''}.` };
      for (let p = start; p <= end; p++) {
        if (!seen.has(p)) { seen.add(p); pages.push(p); }
      }
    } else {
      return { ok: false, error: `"${seg}" is not a valid range. Use "start-end" format.` };
    }
  }

  if (pages.length === 0) return { ok: false, error: 'No pages selected.' };
  return { ok: true, ranges: collapseToRanges(pages.sort((a, b) => a - b)) };
}

/** Convert an array of sorted page numbers back to ParsedRange[] */
function collapseToRanges(pages: number[]): ParsedRange[] {
  if (pages.length === 0) return [];
  const ranges: ParsedRange[] = [];
  let start = pages[0];
  let end = pages[0];
  for (let i = 1; i < pages.length; i++) {
    if (pages[i] === end + 1) {
      end = pages[i];
    } else {
      ranges.push({ start, end });
      start = pages[i];
      end = pages[i];
    }
  }
  ranges.push({ start, end });
  return ranges;
}

/** Expand ParsedRange[] back to a sorted list of 0-based page indices */
export function rangesToIndices(ranges: ParsedRange[]): number[] {
  const indices: number[] = [];
  for (const { start, end } of ranges) {
    for (let p = start; p <= end; p++) indices.push(p - 1);
  }
  return indices;
}

// ─── Split outcomes ───────────────────────────────────────────────────────────

export interface SplitPartResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
  label: string; // human-readable label, e.g. "Pages 1–3"
}

export interface SplitSuccess {
  success: true;
  parts: SplitPartResult[];
}

export interface SplitError {
  success: false;
  error: string;
  partIndex?: number;
}

export type SplitOutcome = SplitSuccess | SplitError;

// ─── PDF-lib lazy loader ──────────────────────────────────────────────────────

let pdfLibCache: typeof import('pdf-lib') | null = null;

async function loadPdfLib() {
  if (pdfLibCache) return pdfLibCache;
  pdfLibCache = await import('pdf-lib');
  return pdfLibCache;
}

// ─── File reading ─────────────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

// ─── Core split function ──────────────────────────────────────────────────────

/**
 * Extract a subset of pages (0-based indices) from a loaded PDFDocument.
 * Returns a Blob of the resulting PDF.
 */
async function extractPages(
  srcBytes: ArrayBuffer,
  pageIndices: number[],
  pdfLib: typeof import('pdf-lib'),
): Promise<Blob> {
  const { PDFDocument } = pdfLib;
  const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: false });
  const outDoc = await PDFDocument.create();
  const copied = await outDoc.copyPages(srcDoc, pageIndices);
  copied.forEach((page) => outDoc.addPage(page));
  const bytes = await outDoc.save();
  return new Blob([bytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/** Build a safe filename fragment from the source PDF name */
function baseName(pdfFile: PdfFile): string {
  return pdfFile.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 40);
}

// ─── Split modes ──────────────────────────────────────────────────────────────

/**
 * Extract pages given by a range string (e.g. "1-5,8,10-12") into a single PDF.
 */
export async function extractPageRange(
  pdfFile: PdfFile,
  rangeInput: string,
  totalPages: number,
): Promise<SplitOutcome> {
  const parsed = parsePageRanges(rangeInput, totalPages);
  if (!parsed.ok) return { success: false, error: parsed.error };

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  const indices = rangesToIndices(parsed.ranges);

  try {
    const pdfLib = await loadPdfLib();
    const blob = await extractPages(srcBytes, indices, pdfLib);
    const base = baseName(pdfFile);
    const label = formatRangeLabel(parsed.ranges);
    return {
      success: true,
      parts: [{
        blob,
        filename: `${base}_pages_${label.replace(/\s/g, '_')}.pdf`,
        pageCount: indices.length,
        sizeBytes: blob.size,
        label: `Pages ${label}`,
      }],
    };
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be split.' };
    }
    return { success: false, error: `Could not extract pages: ${msg.slice(0, 100)}` };
  }
}

/**
 * Split every page into its own PDF file.
 */
export async function splitEveryPage(pdfFile: PdfFile, totalPages: number): Promise<SplitOutcome> {
  if (totalPages < 2) {
    return { success: false, error: 'The PDF must have at least 2 pages to split.' };
  }

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  const pdfLib = await loadPdfLib();
  const parts: SplitPartResult[] = [];
  const base = baseName(pdfFile);

  for (let i = 0; i < totalPages; i++) {
    try {
      const blob = await extractPages(srcBytes, [i], pdfLib);
      parts.push({
        blob,
        filename: `${base}_page_${i + 1}.pdf`,
        pageCount: 1,
        sizeBytes: blob.size,
        label: `Page ${i + 1}`,
      });
    } catch (err: unknown) {
      return {
        success: false,
        error: `Failed on page ${i + 1}: ${String(err).slice(0, 80)}`,
        partIndex: i,
      };
    }
  }

  return { success: true, parts };
}

/**
 * Split by multiple named ranges, producing one PDF per range.
 * rangeInputs: array of range strings, e.g. ["1-3", "4-7", "8-10"]
 */
export async function splitByRanges(
  pdfFile: PdfFile,
  rangeInputs: string[],
  totalPages: number,
): Promise<SplitOutcome> {
  if (rangeInputs.length === 0) {
    return { success: false, error: 'Provide at least one page range.' };
  }

  // Parse all ranges first, fail-fast on any parse error
  const parsedRanges: { indices: number[]; label: string; raw: string }[] = [];
  for (let i = 0; i < rangeInputs.length; i++) {
    const raw = rangeInputs[i].trim();
    if (!raw) continue;
    const parsed = parsePageRanges(raw, totalPages);
    if (!parsed.ok) {
      return { success: false, error: `Range ${i + 1} ("${raw}"): ${parsed.error}` };
    }
    parsedRanges.push({
      indices: rangesToIndices(parsed.ranges),
      label: formatRangeLabel(parsed.ranges),
      raw,
    });
  }

  if (parsedRanges.length === 0) return { success: false, error: 'No valid ranges provided.' };

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  const pdfLib = await loadPdfLib();
  const parts: SplitPartResult[] = [];
  const base = baseName(pdfFile);

  for (let i = 0; i < parsedRanges.length; i++) {
    const { indices, label } = parsedRanges[i];
    try {
      const blob = await extractPages(srcBytes, indices, pdfLib);
      parts.push({
        blob,
        filename: `${base}_part_${i + 1}.pdf`,
        pageCount: indices.length,
        sizeBytes: blob.size,
        label: `Part ${i + 1} — Pages ${label}`,
      });
    } catch (err: unknown) {
      return {
        success: false,
        error: `Failed to extract part ${i + 1}: ${String(err).slice(0, 80)}`,
        partIndex: i,
      };
    }
  }

  return { success: true, parts };
}

/**
 * Extract specific pages (1-based) given as a Set.
 */
export async function extractSelectedPages(
  pdfFile: PdfFile,
  selectedPages: number[], // 1-based, sorted
): Promise<SplitOutcome> {
  if (selectedPages.length === 0) {
    return { success: false, error: 'Select at least one page.' };
  }

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  const indices = selectedPages.map((p) => p - 1);
  try {
    const pdfLib = await loadPdfLib();
    const blob = await extractPages(srcBytes, indices, pdfLib);
    const base = baseName(pdfFile);
    const ranges = collapseToRanges([...selectedPages].sort((a, b) => a - b));
    const label = formatRangeLabel(ranges);
    return {
      success: true,
      parts: [{
        blob,
        filename: `${base}_selected_pages.pdf`,
        pageCount: selectedPages.length,
        sizeBytes: blob.size,
        label: `Selected pages — ${label}`,
      }],
    };
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be split.' };
    }
    return { success: false, error: `Could not extract selected pages: ${msg.slice(0, 100)}` };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRangeLabel(ranges: ParsedRange[]): string {
  return ranges
    .map(({ start, end }) => (start === end ? String(start) : `${start}–${end}`))
    .join(', ');
}

export { formatRangeLabel };
