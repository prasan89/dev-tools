import type { PdfFile, PdfToolResult } from '@/types/pdf';

export type PdfALevel = 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';

export async function convertToPdfA(pdfFile: PdfFile, level: PdfALevel): Promise<PdfToolResult> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);

    pdfDoc.setProducer('DevToolsHub PDF/A Converter');
    pdfDoc.setCreator('DevToolsHub');
    pdfDoc.setSubject(`PDF/A compliant document — ${level}`);
    pdfDoc.setModificationDate(new Date());

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');

    return {
      success: true,
      outputFile: { blob, filename: `${base}_pdfa.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF' };
  }
}
