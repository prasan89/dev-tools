import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export function emptyMetadata(): PdfMetadata {
  return {
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: '',
    modificationDate: '',
  };
}

function safeGet<T>(fn: () => T | undefined): string {
  try {
    const val = fn();
    if (val === undefined || val === null) return '';
    if (val instanceof Date) return isNaN(val.getTime()) ? '' : val.toISOString();
    return String(val);
  } catch {
    return '';
  }
}

export async function readMetadata(pdfFile: PdfFile): Promise<PdfMetadata> {
  const { PDFDocument } = await import('pdf-lib');

  const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(pdfFile.file);
  });

  const pdfDoc = await PDFDocument.load(buf);

  return {
    title: safeGet(() => pdfDoc.getTitle()),
    author: safeGet(() => pdfDoc.getAuthor()),
    subject: safeGet(() => pdfDoc.getSubject()),
    keywords: safeGet(() => pdfDoc.getKeywords()),
    creator: safeGet(() => pdfDoc.getCreator()),
    producer: safeGet(() => pdfDoc.getProducer()),
    creationDate: safeGet(() => pdfDoc.getCreationDate()),
    modificationDate: safeGet(() => pdfDoc.getModificationDate()),
  };
}

export async function buildMetadataEditedPdf(
  pdfFile: PdfFile,
  metadata: PdfMetadata,
  clearAll: boolean,
): Promise<PdfToolResult> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);

    if (clearAll) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setCreator('');
      pdfDoc.setProducer('');
    } else {
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords ? [metadata.keywords] : []);
      pdfDoc.setCreator(metadata.creator);
      pdfDoc.setProducer(metadata.producer);

      if (metadata.creationDate) {
        const d = new Date(metadata.creationDate);
        if (!isNaN(d.getTime())) pdfDoc.setCreationDate(d);
      }
      if (metadata.modificationDate) {
        const d = new Date(metadata.modificationDate);
        if (!isNaN(d.getTime())) pdfDoc.setModificationDate(d);
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_metadata.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to edit metadata' };
  }
}
