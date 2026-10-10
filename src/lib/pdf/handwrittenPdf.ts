import type { PdfFile } from '@/types/pdf';

export type HandwritingFont = 'Caveat' | 'PatrickHand' | 'ArchitectsDaughter';
export type PaperBackground = 'plain' | 'ruled' | 'grid';

export interface HandwrittenOptions {
  font: HandwritingFont;
  fontSize: number;         // pt, e.g. 16
  inkColor: string;         // hex, e.g. '#1a1a2e'
  lineSpacing: number;      // multiplier, e.g. 1.8
  marginPt: number;         // page margin in pt
  paper: PaperBackground;
  ruleColor: string;        // hex for ruled/grid lines
}

export const HANDWRITING_FONTS: Record<HandwritingFont, { label: string; file: string }> = {
  Caveat:               { label: 'Caveat',                file: '/fonts/Caveat-Regular.ttf' },
  PatrickHand:          { label: 'Patrick Hand',          file: '/fonts/PatrickHand-Regular.ttf' },
  ArchitectsDaughter:   { label: "Architect's Daughter",  file: '/fonts/ArchitectsDaughter-Regular.ttf' },
};

export const DEFAULT_OPTIONS: HandwrittenOptions = {
  font: 'Caveat',
  fontSize: 16,
  inkColor: '#1a1a2e',
  lineSpacing: 1.8,
  marginPt: 50,
  paper: 'ruled',
  ruleColor: '#c8d8e8',
};

export interface HandwrittenResult {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}
export interface HandwrittenError {
  success: false;
  error: string;
}
export type HandwrittenOutcome = HandwrittenResult | HandwrittenError;

function hexToRgb01(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

async function fetchFontBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Font not found: ${path}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function extractText(pdfData: ArrayBuffer): Promise<string[][]> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const doc = await pdfjs.getDocument({ data: pdfData.slice(0), disableAutoFetch: true }).promise;
  const pages: string[][] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    page.cleanup();
    const lines: string[] = [];
    let cur = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      if ((item as { hasEOL?: boolean }).hasEOL) {
        cur += item.str;
        if (cur.trim()) lines.push(cur);
        cur = '';
      } else {
        cur += item.str;
      }
    }
    if (cur.trim()) lines.push(cur);
    pages.push(lines);
  }
  doc.cleanup();
  return pages;
}

function drawPaper(
  page: import('pdf-lib').PDFPage,
  opts: HandwrittenOptions,
  lineYs: number[],
  w: number,
  h: number,
  rgb: (r: number, g: number, b: number) => import('pdf-lib').Color,
) {
  const [lr, lg, lb] = hexToRgb01(opts.ruleColor);
  const lineColor = rgb(lr, lg, lb);
  if (opts.paper === 'ruled') {
    for (const y of lineYs) {
      page.drawLine({ start: { x: opts.marginPt, y }, end: { x: w - opts.marginPt, y }, thickness: 0.4, color: lineColor, opacity: 0.7 });
    }
    // Left margin red line
    page.drawLine({ start: { x: opts.marginPt - 2, y: 0 }, end: { x: opts.marginPt - 2, y: h }, thickness: 0.6, color: rgb(0.85, 0.4, 0.4), opacity: 0.4 });
  } else if (opts.paper === 'grid') {
    const step = opts.fontSize * opts.lineSpacing;
    for (let y = h - opts.marginPt; y > opts.marginPt; y -= step) {
      page.drawLine({ start: { x: 0, y }, end: { x: w, y }, thickness: 0.3, color: lineColor, opacity: 0.5 });
    }
    for (let x = opts.marginPt; x < w; x += step) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: h }, thickness: 0.3, color: lineColor, opacity: 0.5 });
    }
  }
}

export async function convertToHandwritten(
  file: PdfFile,
  opts: HandwrittenOptions,
  onProgress?: (pct: number) => void,
): Promise<HandwrittenOutcome> {
  try {
    onProgress?.(5);
    const { PDFDocument, rgb, PageSizes } = await import('pdf-lib');
    const fontkit = (await import('@pdf-lib/fontkit')).default;

    const fontEntry = HANDWRITING_FONTS[opts.font];
    const fontBytes = await fetchFontBytes(fontEntry.file);
    onProgress?.(15);

    const pdfData = await file.file.arrayBuffer();
    const pages = await extractText(pdfData);
    onProgress?.(35);

    const [pr, pg, pb] = hexToRgb01(opts.inkColor);
    const inkColor = rgb(pr, pg, pb);

    const outDoc = await PDFDocument.create();
    outDoc.registerFontkit(fontkit);
    const font = await outDoc.embedFont(fontBytes);

    const [pageW, pageH] = PageSizes.A4;
    const lineHeight = opts.fontSize * opts.lineSpacing;
    const usableW = pageW - opts.marginPt * 2;
    const startY = pageH - opts.marginPt - opts.fontSize;
    const endY = opts.marginPt;

    const total = pages.length;
    for (let pi = 0; pi < total; pi++) {
      const rawLines = pages[pi];
      // Word-wrap each source line to fit usable width
      const wrappedLines: string[] = [];
      for (const rawLine of rawLines) {
        const words = rawLine.split(' ');
        let current = '';
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          const w = font.widthOfTextAtSize(test, opts.fontSize);
          if (w > usableW && current) {
            wrappedLines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) wrappedLines.push(current);
        wrappedLines.push(''); // blank line between source lines
      }

      // Paginate the wrapped lines
      let y = startY;
      let outPage = outDoc.addPage([pageW, pageH]);
      outPage.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });

      // Pre-compute rule line Y positions for this page
      const ruleYs: number[] = [];
      for (let ry = startY; ry >= endY; ry -= lineHeight) ruleYs.push(ry);
      drawPaper(outPage, opts, ruleYs, pageW, pageH, rgb);

      for (const line of wrappedLines) {
        if (y < endY) {
          // Start new output page
          outPage = outDoc.addPage([pageW, pageH]);
          outPage.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
          const newRuleYs: number[] = [];
          for (let ry = startY; ry >= endY; ry -= lineHeight) newRuleYs.push(ry);
          drawPaper(outPage, opts, newRuleYs, pageW, pageH, rgb);
          y = startY;
        }
        if (line.trim()) {
          outPage.drawText(line, {
            x: opts.marginPt,
            y,
            size: opts.fontSize,
            font,
            color: inkColor,
            maxWidth: usableW,
          });
        }
        y -= lineHeight;
      }

      onProgress?.(35 + Math.round(55 * (pi + 1) / total));
    }

    const bytes = await outDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const baseName = file.file.name.replace(/\.pdf$/i, '');
    onProgress?.(100);
    return {
      success: true,
      blob,
      filename: `${baseName}-handwritten.pdf`,
      pageCount: outDoc.getPageCount(),
      sizeBytes: bytes.length,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
