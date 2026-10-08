import type { PdfToolResult } from '@/types/pdf';
import { convertHtmlToPdf } from '@/lib/pdf/htmlToPdf';
import { sanitizeConverterHtml } from '@/lib/security';

export async function convertWordToPdf(file: File): Promise<PdfToolResult> {
  try {
    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer: buf });
    const rawHtml = result.value;

    if (!rawHtml.trim()) {
      return { success: false, error: 'No content could be extracted from the Word document' };
    }

    // Sanitize mammoth output before passing to the PDF renderer
    const html = sanitizeConverterHtml(rawHtml);

    const title = file.name.replace(/\.docx?$/i, '');
    const pdfResult = await convertHtmlToPdf(html, title);
    if (!pdfResult.success) return pdfResult;

    return {
      success: true,
      outputFile: {
        blob: pdfResult.outputFile!.blob,
        filename: `${title}.pdf`,
        size: pdfResult.outputFile!.size,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert Word document' };
  }
}
