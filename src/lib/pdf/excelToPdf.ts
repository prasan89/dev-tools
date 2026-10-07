import type { PdfToolResult } from '@/types/pdf';

export interface ExcelToPdfOptions {
  sheetNames: string[];
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  fontSize: number;
}

export function defaultExcelToPdfOptions(): ExcelToPdfOptions {
  return { sheetNames: [], pageSize: 'A4', orientation: 'portrait', fontSize: 10 };
}

function pageDims(pageSize: 'A4' | 'Letter', orientation: 'portrait' | 'landscape') {
  const [w, h] = pageSize === 'A4' ? [595, 842] : [612, 792];
  return orientation === 'landscape' ? { w: h, h: w } : { w, h };
}

export async function convertExcelToPdf(file: File, options: ExcelToPdfOptions): Promise<PdfToolResult> {
  try {
    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    const xlsx = await import('xlsx');
    const workbook = xlsx.read(new Uint8Array(buf), { type: 'array' });

    const sheetsToProcess = options.sheetNames.length > 0
      ? options.sheetNames.filter((n) => workbook.SheetNames.includes(n))
      : workbook.SheetNames;

    if (sheetsToProcess.length === 0) {
      return { success: false, error: 'No valid sheets found to convert' };
    }

    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setProducer('DevToolsHub Excel to PDF');
    pdfDoc.setCreator('DevToolsHub');

    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const { w: PAGE_W, h: PAGE_H } = pageDims(options.pageSize, options.orientation);
    const MARGIN = 40;
    const ROW_H = options.fontSize + 4;
    const COL_W = Math.floor((PAGE_W - MARGIN * 2) / 12); // ~12 cols default

    for (const sheetName of sheetsToProcess) {
      const sheet = workbook.Sheets[sheetName];
      const rows: string[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][];

      if (rows.length === 0) continue;

      let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      // Sheet title
      page.drawText(sheetName, {
        x: MARGIN, y: y - options.fontSize,
        size: options.fontSize + 2, font: boldFont, color: rgb(0.1, 0.1, 0.1),
      });
      y -= ROW_H + 6;

      for (let r = 0; r < rows.length; r++) {
        if (y - ROW_H < MARGIN) {
          page = pdfDoc.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - MARGIN;
        }
        const row = rows[r];
        const isHeader = r === 0;
        const rowFont = isHeader ? boldFont : font;
        const maxCols = Math.min(row.length, Math.floor((PAGE_W - MARGIN * 2) / COL_W));

        for (let c = 0; c < maxCols; c++) {
          const cellText = String(row[c] ?? '').slice(0, 20);
          if (cellText) {
            page.drawText(cellText, {
              x: MARGIN + c * COL_W,
              y: y - options.fontSize,
              size: options.fontSize,
              font: rowFont,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
        }
        y -= ROW_H;
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.xlsx?$/i, '');
    return { success: true, outputFile: { blob, filename: `${baseName}.pdf`, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert Excel file' };
  }
}
