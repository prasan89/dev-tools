import type { PdfToolResult } from '@/types/pdf';

export type ColorMode = 'original' | 'grayscale' | 'blackwhite';

export interface ScanPage {
  id: string;
  file: File;
  rotation: 0 | 90 | 180 | 270;
  colorMode: ColorMode;
}

export function addScanPage(pages: ScanPage[], file: File): ScanPage[] {
  const page: ScanPage = {
    id: crypto.randomUUID(),
    file,
    rotation: 0,
    colorMode: 'original',
  };
  return [...pages, page];
}

export function removeScanPage(pages: ScanPage[], id: string): ScanPage[] {
  return pages.filter((p) => p.id !== id);
}

export function moveScanPage(
  pages: ScanPage[],
  id: string,
  direction: 'up' | 'down',
): ScanPage[] {
  const idx = pages.findIndex((p) => p.id === id);
  if (idx < 0) return pages;
  const newIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= pages.length) return pages;
  const next = [...pages];
  [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
  return next;
}

export function rotateScanPage(pages: ScanPage[], id: string): ScanPage[] {
  return pages.map((p) => {
    if (p.id !== id) return p;
    const next = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    return { ...p, rotation: next };
  });
}

export function setColorMode(
  pages: ScanPage[],
  id: string,
  mode: ColorMode,
): ScanPage[] {
  return pages.map((p) => (p.id !== id ? p : { ...p, colorMode: mode }));
}

// ─── Canvas-based color processing ───────────────────────────────────────────

async function applyColorMode(
  file: File,
  mode: ColorMode,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      if (mode === 'original') {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
        return;
      }
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        if (mode === 'grayscale') {
          ctx.filter = 'grayscale(1)';
        }
        ctx.drawImage(img, 0, 0);
        if (mode === 'blackwhite') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imageData.data;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const val = lum > 128 ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = val;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        canvas.toBlob((b) => {
          if (!b) { reject(new Error('Canvas toBlob failed')); return; }
          b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab))).catch(reject);
        }, 'image/png');
      };
      img.src = url;
    };
    reader.readAsArrayBuffer(file);
  });
}

// ─── Page size constants (points) ────────────────────────────────────────────

const PAGE_SIZES = {
  A4: [595.28, 841.89] as [number, number],
  Letter: [612, 792] as [number, number],
} as const;

// ─── Main export ──────────────────────────────────────────────────────────────

export async function buildScanPdf(
  pages: ScanPage[],
  pageSize: 'fit' | 'A4' | 'Letter',
): Promise<PdfToolResult> {
  if (pages.length === 0) {
    return { success: false, error: 'No pages to convert' };
  }

  try {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();

    for (const scanPage of pages) {
      const mimeType = scanPage.file.type || 'image/jpeg';
      const isJpeg = mimeType === 'image/jpeg' || mimeType === 'image/jpg';

      const processedBytes =
        scanPage.colorMode === 'original' && isJpeg
          ? await new Promise<Uint8Array>((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(reader.error);
              reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
              reader.readAsArrayBuffer(scanPage.file);
            })
          : await applyColorMode(scanPage.file, scanPage.colorMode);

      const embedFn = isJpeg && scanPage.colorMode === 'original'
        ? (b: Uint8Array) => pdfDoc.embedJpg(b)
        : (b: Uint8Array) => pdfDoc.embedPng(b);

      const embeddedImage = await embedFn(processedBytes);
      const imgW = embeddedImage.width;
      const imgH = embeddedImage.height;

      let pageW: number;
      let pageH: number;

      if (pageSize === 'fit') {
        if (scanPage.rotation === 90 || scanPage.rotation === 270) {
          pageW = imgH;
          pageH = imgW;
        } else {
          pageW = imgW;
          pageH = imgH;
        }
      } else {
        const [pw, ph] = PAGE_SIZES[pageSize];
        if (scanPage.rotation === 90 || scanPage.rotation === 270) {
          pageW = ph;
          pageH = pw;
        } else {
          pageW = pw;
          pageH = ph;
        }
      }

      const pdfPage = pdfDoc.addPage([pageW, pageH]);

      let drawW: number;
      let drawH: number;

      if (pageSize === 'fit') {
        drawW = pageW;
        drawH = pageH;
      } else {
        // Fit image within page preserving aspect ratio
        const ratio =
          scanPage.rotation === 90 || scanPage.rotation === 270
            ? Math.min(pageW / imgH, pageH / imgW)
            : Math.min(pageW / imgW, pageH / imgH);
        drawW = (scanPage.rotation === 90 || scanPage.rotation === 270 ? imgH : imgW) * ratio;
        drawH = (scanPage.rotation === 90 || scanPage.rotation === 270 ? imgW : imgH) * ratio;
      }

      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      pdfPage.drawImage(embeddedImage, {
        x,
        y,
        width: drawW,
        height: drawH,
        rotate: degrees(scanPage.rotation),
      });
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return {
      success: true,
      outputFile: { blob, filename: 'scanned_document.pdf', size: blob.size },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to build PDF',
    };
  }
}
