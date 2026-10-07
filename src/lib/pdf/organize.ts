import type { PdfFile } from '@/types/pdf';

// ─── Page state ───────────────────────────────────────────────────────────────

export interface PageState {
  /** Original 0-based index in the source PDF */
  originalIndex: number;
  /** Current rotation delta applied on top of the PDF's own rotation (0, 90, 180, 270) */
  rotation: number; // additional degrees, multiple of 90
}

export interface OrganizerState {
  pages: PageState[];
  deletedIndices: Set<number>; // original indices deleted
}

export function buildInitialState(pageCount: number): OrganizerState {
  return {
    pages: Array.from({ length: pageCount }, (_, i) => ({
      originalIndex: i,
      rotation: 0,
    })),
    deletedIndices: new Set(),
  };
}

export function hasChanges(state: OrganizerState, pageCount: number): boolean {
  if (state.deletedIndices.size > 0) return true;
  if (state.pages.length !== pageCount) return true;
  for (let i = 0; i < state.pages.length; i++) {
    if (state.pages[i].originalIndex !== i) return true;
    if (state.pages[i].rotation !== 0) return true;
  }
  return false;
}

export function summarizeChanges(state: OrganizerState, originalCount: number): string {
  const parts: string[] = [];
  if (state.deletedIndices.size > 0) {
    parts.push(`${state.deletedIndices.size} deleted`);
  }
  const rotated = state.pages.filter((p) => p.rotation !== 0).length;
  if (rotated > 0) parts.push(`${rotated} rotated`);
  const reordered = state.pages.some((p, i) => p.originalIndex !== i);
  if (reordered) parts.push('pages reordered');
  if (parts.length === 0) return 'No changes';
  return `Original: ${originalCount} pages · Current: ${state.pages.length} pages · Changes: ${parts.join(', ')}`;
}

// ─── State operations ─────────────────────────────────────────────────────────

export function rotatePage(state: OrganizerState, pageListIndex: number, delta: number): OrganizerState {
  const pages = [...state.pages];
  const p = pages[pageListIndex];
  pages[pageListIndex] = { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 };
  return { ...state, pages };
}

export function rotatePages(state: OrganizerState, pageListIndices: number[], delta: number): OrganizerState {
  const pages = [...state.pages];
  for (const i of pageListIndices) {
    const p = pages[i];
    pages[i] = { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 };
  }
  return { ...state, pages };
}

export function deletePage(state: OrganizerState, pageListIndex: number): OrganizerState {
  const removed = state.pages[pageListIndex];
  const pages = state.pages.filter((_, i) => i !== pageListIndex);
  const deletedIndices = new Set(state.deletedIndices);
  deletedIndices.add(removed.originalIndex);
  return { ...state, pages, deletedIndices };
}

export function deletePages(state: OrganizerState, pageListIndices: number[]): OrganizerState {
  const toRemove = new Set(pageListIndices);
  const removed = state.pages.filter((_, i) => toRemove.has(i));
  const pages = state.pages.filter((_, i) => !toRemove.has(i));
  const deletedIndices = new Set(state.deletedIndices);
  for (const p of removed) deletedIndices.add(p.originalIndex);
  return { ...state, pages, deletedIndices };
}

export function movePage(state: OrganizerState, fromIndex: number, toIndex: number): OrganizerState {
  if (fromIndex === toIndex) return state;
  const pages = [...state.pages];
  const [moved] = pages.splice(fromIndex, 1);
  pages.splice(toIndex, 0, moved);
  return { ...state, pages };
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface OrganizeSuccess {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface OrganizeError {
  success: false;
  error: string;
}

export type OrganizeOutcome = OrganizeSuccess | OrganizeError;

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
  return `${base}-organized.pdf`;
}

/**
 * Build a new PDF from the organizer state.
 * - Pages are copied in the current display order (state.pages)
 * - Rotation is applied on top of each page's existing rotation
 * - Content is NOT rasterized; pdf-lib copies vector/text/image streams intact
 */
export async function buildOrganizedPdf(
  pdfFile: PdfFile,
  state: OrganizerState,
  signal?: AbortSignal,
): Promise<OrganizeOutcome> {
  if (state.pages.length === 0) {
    return { success: false, error: 'Cannot create a PDF with no pages. Add or restore some pages first.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  let srcBytes: ArrayBuffer;
  try {
    srcBytes = await readFileAsArrayBuffer(pdfFile.file);
  } catch {
    return { success: false, error: 'Could not read the PDF file.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  const { PDFDocument, degrees } = await import('pdf-lib');

  let srcDoc: import('pdf-lib').PDFDocument;
  try {
    srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: false });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('encrypted') || msg.includes('password')) {
      return { success: false, error: 'This PDF is password protected and cannot be modified.' };
    }
    return { success: false, error: 'This PDF appears to be corrupted or is not a valid PDF.' };
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  // Copy pages in the desired order
  const indices = state.pages.map((p) => p.originalIndex);
  const outDoc = await PDFDocument.create();

  let copiedPages: import('pdf-lib').PDFPage[];
  try {
    copiedPages = await outDoc.copyPages(srcDoc, indices);
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough browser memory to process this PDF. Try a smaller file.' };
    }
    return { success: false, error: `Failed to copy pages: ${msg.slice(0, 100)}` };
  }

  for (let i = 0; i < copiedPages.length; i++) {
    const page = copiedPages[i];
    outDoc.addPage(page);

    // Apply additional rotation on top of whatever the page already has
    const additionalRotation = state.pages[i].rotation;
    if (additionalRotation !== 0) {
      const existing = page.getRotation().angle;
      page.setRotation(degrees((existing + additionalRotation) % 360));
    }
  }

  if (signal?.aborted) return { success: false, error: 'Operation cancelled.' };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await outDoc.save({ useObjectStreams: true });
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
    pageCount: state.pages.length,
    sizeBytes: blob.size,
  };
}
