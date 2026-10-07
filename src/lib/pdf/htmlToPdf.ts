import type { PdfToolResult } from '@/types/pdf';

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export type HtmlBlock = { type: 'heading' | 'paragraph' | 'list'; text: string; level?: number };

export function parseHtmlToBlocks(html: string): HtmlBlock[] {
  const blocks: HtmlBlock[] = [];

  // Extract heading tags h1-h6
  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  // Extract p tags
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  // Extract li tags
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;

  // Track positions to preserve rough order
  const items: { start: number; block: HtmlBlock }[] = [];

  let m: RegExpExecArray | null;

  const re1 = new RegExp(headingRe.source, 'gi');
  while ((m = re1.exec(html)) !== null) {
    const text = stripHtmlTags(m[2]).trim();
    if (text) items.push({ start: m.index, block: { type: 'heading', text, level: parseInt(m[1], 10) } });
  }

  const re2 = new RegExp(pRe.source, 'gi');
  while ((m = re2.exec(html)) !== null) {
    const text = stripHtmlTags(m[1]).trim();
    if (text) items.push({ start: m.index, block: { type: 'paragraph', text } });
  }

  const re3 = new RegExp(liRe.source, 'gi');
  while ((m = re3.exec(html)) !== null) {
    const text = stripHtmlTags(m[1]).trim();
    if (text) items.push({ start: m.index, block: { type: 'list', text } });
  }

  // Sort by position in source
  items.sort((a, b) => a.start - b.start);

  // If no structured tags found, fall back to treating the whole content as a paragraph
  if (items.length === 0) {
    const plain = stripHtmlTags(html).trim();
    if (plain) blocks.push({ type: 'paragraph', text: plain });
    return blocks;
  }

  return items.map((i) => i.block);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars) : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function convertHtmlToPdf(html: string, title: string): Promise<PdfToolResult> {
  if (!html.trim()) {
    return { success: false, error: 'HTML content is empty' };
  }

  try {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();

    if (title) pdfDoc.setTitle(title);
    pdfDoc.setProducer('DevToolsHub HTML to PDF');
    pdfDoc.setCreator('DevToolsHub');

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN = 50;
    const LINE_GAP = 4;
    const PARA_GAP = 10;
    const MAX_CHARS_AT_12 = Math.floor((PAGE_W - MARGIN * 2) / 7);

    const blocks = parseHtmlToBlocks(html);

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const ensureSpace = (needed: number) => {
      if (y - needed < MARGIN) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
    };

    for (const block of blocks) {
      const isHeading = block.type === 'heading';
      const level = block.level ?? 1;
      const fontSize = isHeading
        ? level === 1 ? 24 : level === 2 ? 20 : level <= 3 ? 16 : 13
        : 12;
      const font = isHeading ? fontBold : fontRegular;
      const prefix = block.type === 'list' ? '• ' : '';
      const maxChars = Math.floor(MAX_CHARS_AT_12 * (12 / fontSize));
      const lines = wrapText(prefix + block.text, maxChars);
      const blockHeight = lines.length * (fontSize + LINE_GAP) + (isHeading ? 6 : 0);

      ensureSpace(blockHeight + PARA_GAP);

      if (isHeading) y -= 4;
      for (const line of lines) {
        ensureSpace(fontSize + LINE_GAP);
        page.drawText(line, { x: MARGIN, y: y - fontSize, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        y -= fontSize + LINE_GAP;
      }
      y -= PARA_GAP;
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const filename = `${(title || 'converted').replace(/[^a-z0-9_\-]/gi, '_')}.pdf`;
    return { success: true, outputFile: { blob, filename, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Conversion failed' };
  }
}
