import type { PdfToolResult } from '@/types/pdf';

export async function convertUrlToPdf(_url: string): Promise<{ success: false; instructions: string }> {
  return {
    success: false,
    instructions:
      'To save a webpage as PDF:\n1. Open the page in your browser.\n2. Press Ctrl+P (Cmd+P on Mac).\n3. Choose "Save as PDF" as the printer.\n4. Click Save.',
  };
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface HtmlBlock {
  type: 'heading' | 'paragraph' | 'list';
  text: string;
  level?: number;
}

function parseHtmlToBlocks(html: string): HtmlBlock[] {
  const blocks: HtmlBlock[] = [];
  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;

  const positions: Array<{ index: number; block: HtmlBlock }> = [];

  let m: RegExpExecArray | null;

  headingRe.lastIndex = 0;
  while ((m = headingRe.exec(html)) !== null) {
    positions.push({ index: m.index, block: { type: 'heading', text: stripHtmlTags(m[2]), level: parseInt(m[1], 10) } });
  }

  pRe.lastIndex = 0;
  while ((m = pRe.exec(html)) !== null) {
    const text = stripHtmlTags(m[1]).trim();
    if (text) positions.push({ index: m.index, block: { type: 'paragraph', text } });
  }

  liRe.lastIndex = 0;
  while ((m = liRe.exec(html)) !== null) {
    const text = stripHtmlTags(m[1]).trim();
    if (text) positions.push({ index: m.index, block: { type: 'list', text } });
  }

  positions.sort((a, b) => a.index - b.index);

  if (positions.length === 0) {
    const plain = stripHtmlTags(html);
    if (plain) return [{ type: 'paragraph', text: plain }];
    return [];
  }

  return positions.map((p) => p.block);
}

export async function convertHtmlSourceToPdf(htmlSource: string, title: string): Promise<PdfToolResult> {
  if (!htmlSource.trim()) {
    return { success: false, error: 'HTML source is empty' };
  }

  try {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();

    pdfDoc.setTitle(title || 'Converted Document');
    pdfDoc.setProducer('DevToolsHub');
    pdfDoc.setCreator('DevToolsHub Web Page to PDF');

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN = 50;
    const MAX_WIDTH = PAGE_W - MARGIN * 2;

    const blocks = parseHtmlToBlocks(htmlSource);

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const newPage = () => {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    };

    const ensureSpace = (needed: number) => {
      if (y - needed < MARGIN) newPage();
    };

    const drawWrappedText = (text: string, fontSize: number, font: typeof helvetica, color = rgb(0, 0, 0)) => {
      const words = text.split(/\s+/);
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w > MAX_WIDTH && line) {
          ensureSpace(fontSize + 4);
          page.drawText(line, { x: MARGIN, y, size: fontSize, font, color });
          y -= fontSize + 4;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        ensureSpace(fontSize + 4);
        page.drawText(line, { x: MARGIN, y, size: fontSize, font, color });
        y -= fontSize + 4;
      }
    };

    for (const block of blocks) {
      if (!block.text.trim()) continue;
      if (block.type === 'heading') {
        const sizes: Record<number, number> = { 1: 24, 2: 20, 3: 16, 4: 14, 5: 12, 6: 12 };
        const sz = sizes[block.level ?? 1] ?? 16;
        y -= 8;
        ensureSpace(sz + 8);
        drawWrappedText(block.text, sz, helveticaBold);
        y -= 4;
      } else if (block.type === 'list') {
        ensureSpace(14);
        const bullet = '• ';
        const bw = helvetica.widthOfTextAtSize(bullet, 12);
        page.drawText(bullet, { x: MARGIN, y, size: 12, font: helvetica, color: rgb(0, 0, 0) });
        const savedX = MARGIN;
        const indentX = savedX + bw;
        const words = block.text.split(/\s+/);
        let line = '';
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          const w = helvetica.widthOfTextAtSize(test, 12);
          if (w > MAX_WIDTH - bw && line) {
            page.drawText(line, { x: indentX, y, size: 12, font: helvetica, color: rgb(0, 0, 0) });
            y -= 16;
            ensureSpace(16);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) {
          page.drawText(line, { x: indentX, y, size: 12, font: helvetica, color: rgb(0, 0, 0) });
          y -= 16;
        }
      } else {
        drawWrappedText(block.text, 12, helvetica);
        y -= 6;
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const filename = `${(title || 'converted').replace(/[^a-z0-9_\-]/gi, '_')}.pdf`;
    return { success: true, outputFile: { blob, filename, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to convert HTML to PDF' };
  }
}
