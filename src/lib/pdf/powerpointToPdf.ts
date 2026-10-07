import type { PdfToolResult } from '@/types/pdf';

export interface PptxToPdfOptions {
  pageSize: 'widescreen' | 'standard';
  fontSize: number;
}

export function defaultPptxToPdfOptions(): PptxToPdfOptions {
  return { pageSize: 'widescreen', fontSize: 14 };
}

export interface SlideContent {
  slideIndex: number;
  texts: Array<{ text: string; x: number; y: number; size: number; bold: boolean }>;
}

// EMU → PDF points (1 inch = 914400 EMU, 1 inch = 72 pts)
function emuToPts(emu: number): number {
  return (emu / 914400) * 72;
}

function parseSlideXml(xml: string, slideIndex: number): SlideContent {
  const texts: SlideContent['texts'] = [];
  // Extract shape trees: <p:sp> elements
  const spRegex = /<p:sp[\s\S]*?<\/p:sp>/g;
  let spMatch: RegExpExecArray | null;
  while ((spMatch = spRegex.exec(xml)) !== null) {
    const spXml = spMatch[0];

    // Get position offset (EMU)
    let x = 0;
    let y = 0;
    const offMatch = /<a:off[^>]+x="(\d+)"[^>]+y="(\d+)"/.exec(spXml);
    if (offMatch) {
      x = emuToPts(parseInt(offMatch[1], 10));
      y = emuToPts(parseInt(offMatch[2], 10));
    }

    // Extract paragraph runs
    const paraRegex = /<a:p>([\s\S]*?)<\/a:p>/g;
    let paraMatch: RegExpExecArray | null;
    while ((paraMatch = paraRegex.exec(spXml)) !== null) {
      const paraXml = paraMatch[1];
      let paraText = '';
      let bold = false;

      // Check paragraph-level bold
      const pPrBold = /<a:pPr[^>]*>[\s\S]*?<a:rPr[^>]*\bbold="true"/.test(paraXml);

      // Extract runs
      const runRegex = /<a:r>([\s\S]*?)<\/a:r>/g;
      let runMatch: RegExpExecArray | null;
      while ((runMatch = runRegex.exec(paraXml)) !== null) {
        const runXml = runMatch[1];
        const tMatch = /<a:t>([\s\S]*?)<\/a:t>/.exec(runXml);
        if (tMatch) {
          const runText = tMatch[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x000D;/g, '\n');
          paraText += runText;
          if (/<a:rPr[^>]*\bbold="true"/.test(runXml)) bold = true;
        }
      }
      if (pPrBold) bold = true;

      const trimmed = paraText.trim();
      if (trimmed) {
        texts.push({ text: trimmed, x, y, size: 12, bold });
      }
    }
  }
  return { slideIndex, texts };
}

export async function extractSlideTexts(
  file: File,
): Promise<{ success: boolean; slides?: SlideContent[]; error?: string }> {
  try {
    const jszipMod = await import('jszip');
    // jszip CJS exports the constructor directly; ESM wraps in .default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZipCtor: any = (jszipMod as any).default ?? jszipMod;
    const zip = new JSZipCtor();
    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
    const loaded = await zip.loadAsync(buf);

    // Collect slide files in order
    const slideKeys = Object.keys(loaded.files)
      .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
        const nb = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
        return na - nb;
      });

    if (slideKeys.length === 0) {
      return { success: false, error: 'No slides found in this file' };
    }

    const slides: SlideContent[] = [];
    for (let i = 0; i < slideKeys.length; i++) {
      const xml = await loaded.files[slideKeys[i]].async('string');
      slides.push(parseSlideXml(xml, i));
    }

    return { success: true, slides };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to parse file' };
  }
}

export async function convertPptxToPdf(
  file: File,
  options: PptxToPdfOptions,
): Promise<PdfToolResult> {
  const extracted = await extractSlideTexts(file);
  if (!extracted.success || !extracted.slides) {
    return { success: false, error: extracted.error ?? 'Failed to extract slides' };
  }

  try {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const [pageW, pageH] = options.pageSize === 'widescreen' ? [960, 540] : [720, 540];

    for (const slide of extracted.slides) {
      const page = pdfDoc.addPage([pageW, pageH]);

      // White background
      page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });

      if (slide.texts.length === 0) {
        // Empty slide placeholder
        const label = `Slide ${slide.slideIndex + 1}`;
        const lw = font.widthOfTextAtSize(label, 12);
        page.drawText(label, {
          x: (pageW - lw) / 2,
          y: pageH / 2 - 6,
          size: 12,
          font,
          color: rgb(0.7, 0.7, 0.7),
        });
        continue;
      }

      // Sort by y descending (PDF y is from bottom; PPTX y is from top)
      const sorted = [...slide.texts].sort((a, b) => a.y - b.y);

      for (const item of sorted) {
        const sz = Math.max(8, Math.min(options.fontSize, 48));
        const f = item.bold ? boldFont : font;
        // Clamp x to safe range
        const x = Math.max(20, Math.min(item.x, pageW - 20));
        // Convert PPTX top-down y to PDF bottom-up y
        const pdfY = Math.max(10, pageH - item.y - sz);

        // Truncate text to fit page width
        let text = item.text;
        const maxW = pageW - x - 20;
        while (text.length > 1 && f.widthOfTextAtSize(text, sz) > maxW) {
          text = text.slice(0, -1);
        }
        if (text !== item.text) text = text.slice(0, -1) + '…';

        page.drawText(text, { x, y: pdfY, size: sz, font: f, color: rgb(0, 0, 0) });
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = file.name.replace(/\.pptx?$/i, '');
    return { success: true, outputFile: { blob, filename: `${base}.pdf`, size: blob.size } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create PDF' };
  }
}
