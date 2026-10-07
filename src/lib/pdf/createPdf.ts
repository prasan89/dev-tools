import type { PdfToolResult } from '@/types/pdf';

export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5';
export type PageOrientation = 'portrait' | 'landscape';

export interface CreatePdfConfig {
  pageSize: PageSize;
  orientation: PageOrientation;
  pageCount: number;
  title: string;
  author: string;
  backgroundColor: string;
}

const PAGE_DIMS: Record<PageSize, [number, number]> = {
  A4: [595, 842],
  Letter: [612, 792],
  Legal: [612, 1008],
  A3: [842, 1190],
  A5: [420, 595],
};

export function defaultCreatePdfConfig(): CreatePdfConfig {
  return {
    pageSize: 'A4',
    orientation: 'portrait',
    pageCount: 1,
    title: '',
    author: '',
    backgroundColor: '#ffffff',
  };
}

export function getPageDimensions(size: PageSize, orientation: PageOrientation): { width: number; height: number } {
  const [w, h] = PAGE_DIMS[size];
  return orientation === 'landscape' ? { width: h, height: w } : { width: w, height: h };
}

export async function buildNewPdf(config: CreatePdfConfig): Promise<PdfToolResult> {
  const count = Math.max(1, Math.min(100, Math.round(config.pageCount)));

  try {
    const { PDFDocument, rgb } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    const { width, height } = getPageDimensions(config.pageSize, config.orientation);

    if (config.title.trim()) pdfDoc.setTitle(config.title.trim());
    if (config.author.trim()) pdfDoc.setAuthor(config.author.trim());
    pdfDoc.setProducer('DevToolsHub');
    pdfDoc.setCreator('DevToolsHub');

    const isWhite = config.backgroundColor.toLowerCase() === '#ffffff' || config.backgroundColor.toLowerCase() === '#fff';

    for (let i = 0; i < count; i++) {
      const page = pdfDoc.addPage([width, height]);
      if (!isWhite) {
        const hex = config.backgroundColor.replace('#', '');
        const n = parseInt(hex.length === 3
          ? hex.split('').map(c => c + c).join('')
          : hex, 16);
        const r = ((n >> 16) & 0xff) / 255;
        const g = ((n >> 8) & 0xff) / 255;
        const b = (n & 0xff) / 255;
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r, g, b) });
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = config.title.trim() || 'document';
    const safeName = base.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();

    return {
      success: true,
      outputFile: { blob, filename: `${safeName}_new.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create PDF' };
  }
}
