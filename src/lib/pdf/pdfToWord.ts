import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface WordConversionOptions {
  includeImages: boolean;
  preserveFormatting: boolean;
}

export function defaultWordOptions(): WordConversionOptions {
  return { includeImages: false, preserveFormatting: true };
}

interface TextItem {
  str: string;
  transform: number[];
  height: number;
}

interface TextLine {
  y: number;
  items: TextItem[];
  text: string;
  height: number;
}

function groupItemsIntoLines(items: TextItem[]): TextLine[] {
  const lines: TextLine[] = [];
  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    const existing = lines.find((l) => Math.abs(l.y - y) < 3);
    if (existing) {
      existing.items.push(item);
      existing.text += item.str;
      existing.height = Math.max(existing.height, item.height);
    } else {
      lines.push({ y, items: [item], text: item.str, height: item.height });
    }
  }
  return lines.sort((a, b) => b.y - a.y);
}

function isHeading(line: TextLine): boolean {
  const t = line.text.trim();
  return line.height > 14 || (t === t.toUpperCase() && t.length > 0 && t.length <= 60);
}

export async function convertPdfToWord(
  pdfFile: PdfFile,
  options: WordConversionOptions = defaultWordOptions(),
): Promise<PdfToolResult> {
  try {
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx');
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');

    if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerPort) {
      GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
    }

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdf = await getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
    const allParagraphs: InstanceType<typeof Paragraph>[] = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      if (p > 1) {
        allParagraphs.push(new Paragraph({ text: '' }));
      }
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const items = (content.items as TextItem[]).filter((i) => typeof i.str === 'string');
      const lines = groupItemsIntoLines(items);

      for (const line of lines) {
        const text = line.text.trim();
        if (!text) continue;
        if (isHeading(line) && options.preserveFormatting) {
          allParagraphs.push(
            new Paragraph({
              text,
              heading: line.height > 18 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
            }),
          );
        } else {
          allParagraphs.push(
            new Paragraph({ children: [new TextRun({ text })] }),
          );
        }
      }
    }

    if (!options.includeImages) {
      allParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '[Images not included in this conversion]', italics: true, color: '888888' })],
        }),
      );
    }

    const doc = new Document({ sections: [{ children: allParagraphs }] });
    const blob = await Packer.toBlob(doc);
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}.docx`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert PDF to Word' };
  }
}
