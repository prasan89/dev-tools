import type { PdfFile } from '@/types/pdf';

export interface MergeResult {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface MergeError {
  success: false;
  error: string;
  fileIndex?: number;
  filename?: string;
}

export type MergeOutcome = MergeResult | MergeError;

let pdfLibCache: typeof import('pdf-lib') | null = null;

async function loadPdfLib() {
  if (pdfLibCache) return pdfLibCache;
  pdfLibCache = await import('pdf-lib');
  return pdfLibCache;
}

export async function mergePdfFiles(files: PdfFile[]): Promise<MergeOutcome> {
  if (files.length === 0) {
    return { success: false, error: 'No PDF files provided.' };
  }
  if (files.length === 1) {
    return { success: false, error: 'Select at least two PDF files to merge.' };
  }

  try {
    const { PDFDocument } = await loadPdfLib();
    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (let i = 0; i < files.length; i++) {
      const pdfFile = files[i];
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await readFileAsArrayBuffer(pdfFile.file);
      } catch {
        return {
          success: false,
          error: `Could not read "${pdfFile.name}". The file may be corrupted.`,
          fileIndex: i,
          filename: pdfFile.name,
        };
      }

      let srcDoc: import('pdf-lib').PDFDocument;
      try {
        srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
      } catch (err: unknown) {
        const msg = String(err);
        if (msg.includes('encrypted') || msg.includes('password') || msg.includes('encrypt')) {
          return {
            success: false,
            error: `"${pdfFile.name}" is password protected and cannot be merged.`,
            fileIndex: i,
            filename: pdfFile.name,
          };
        }
        return {
          success: false,
          error: `"${pdfFile.name}" appears to be corrupted or is not a valid PDF.`,
          fileIndex: i,
          filename: pdfFile.name,
        };
      }

      const pageCount = srcDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
      const copiedPages = await merged.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => merged.addPage(page));
      totalPages += pageCount;
    }

    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
    const filename = buildMergedFilename(files);

    return {
      success: true,
      blob,
      filename,
      pageCount: totalPages,
      sizeBytes: blob.size,
    };
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('memory') || msg.includes('Memory')) {
      return { success: false, error: 'Not enough memory to merge these PDFs. Try with fewer or smaller files.' };
    }
    return { success: false, error: `Merge failed: ${msg.slice(0, 120)}` };
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function buildMergedFilename(files: PdfFile[]): string {
  if (files.length === 2) {
    const a = files[0].name.replace(/\.pdf$/i, '');
    const b = files[1].name.replace(/\.pdf$/i, '');
    const combined = `${a}_${b}`.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
    return `${combined}_merged.pdf`;
  }
  return `merged_${files.length}_files.pdf`;
}
