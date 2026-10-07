import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface ExcelConversionOptions {
  pageSelection: 'all' | 'range';
  pageRange: string;
  tolerance: number;
}

export function defaultExcelOptions(): ExcelConversionOptions {
  return { pageSelection: 'all', pageRange: '', tolerance: 5 };
}

export interface TableRow {
  cells: string[];
}

export interface ExtractedTable {
  pageIndex: number;
  rows: TableRow[];
}

export function extractTablesFromTextItems(
  items: Array<{ str: string; transform: number[]; height: number }>,
  tolerance: number,
): TableRow[] {
  if (items.length === 0) return [];

  // Group by y-position (transform[5] is y in PDF coords)
  const rowMap = new Map<number, Array<{ str: string; x: number }>>();
  for (const item of items) {
    if (!item.str.trim()) continue;
    const rawY = item.transform[5];
    const roundedY = Math.round(rawY / tolerance) * tolerance;
    if (!rowMap.has(roundedY)) rowMap.set(roundedY, []);
    rowMap.get(roundedY)!.push({ str: item.str, x: item.transform[4] });
  }

  // Sort rows by descending y (PDF y is bottom-up)
  const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);

  return sortedYs.map((y) => {
    const cells = rowMap.get(y)!
      .sort((a, b) => a.x - b.x)
      .map((c) => c.str);
    return { cells };
  });
}

function parsePageRangeToIndices(rangeStr: string, totalPages: number): number[] {
  const indices: number[] = [];
  for (const part of rangeStr.split(',')) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b && i <= totalPages; i++) {
          if (i >= 1) indices.push(i - 1);
        }
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) indices.push(n - 1);
    }
  }
  return indices;
}

export async function convertPdfToExcel(
  pdfFile: PdfFile,
  options: ExcelConversionOptions,
): Promise<PdfToolResult> {
  try {
    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerPort) {
      GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
    }

    const pdf = await getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;

    const pageIndices =
      options.pageSelection === 'range'
        ? parsePageRangeToIndices(options.pageRange, pdf.numPages)
        : Array.from({ length: pdf.numPages }, (_, i) => i);

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    for (const pi of pageIndices) {
      const page = await pdf.getPage(pi + 1);
      const content = await page.getTextContent();
      const items = content.items
        .filter((item): item is Extract<typeof item, { str: string }> => 'str' in item && typeof (item as { str?: unknown }).str === 'string')
        .filter((item) => item.str.trim().length > 0)
        .map((item) => ({
          str: item.str,
          transform: (item as unknown as { transform: number[] }).transform,
          height: (item as unknown as { height?: number }).height ?? 0,
        }));

      const rows = extractTablesFromTextItems(items, options.tolerance);
      const aoa = rows.map((r) => r.cells);

      const ws = XLSX.utils.aoa_to_sheet(aoa.length > 0 ? aoa : [['']]);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${pi + 1}`);
    }

    const xlsxBytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
    const blob = new Blob([xlsxBytes.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return { success: true, outputFile: { blob, filename: `${base}.xlsx`, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to Excel' };
  }
}
