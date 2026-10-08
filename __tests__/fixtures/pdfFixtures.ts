/**
 * PDF test fixture generators for M80.6 regression tests.
 * All fixtures are created programmatically using pdf-lib — no real user documents.
 */

export async function buildMinimalPdf(pageCount = 1): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export async function buildTextPdf(text: string, pageCount = 1): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`${text} (page ${i + 1})`, {
      x: 50,
      y: 750,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export async function buildUnicodePdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  // Helvetica only covers Latin-1; we use ASCII-safe Unicode placeholders for test
  page.drawText('Unicode test: Cafe Resume naive', { x: 50, y: 750, size: 12, font, color: rgb(0, 0, 0) });
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export async function buildMixedPageSizePdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const sizes: Array<[number, number]> = [[595, 842], [842, 595], [612, 792]]; // A4 portrait, landscape, Letter
  for (const [w, h] of sizes) {
    const page = doc.addPage([w, h]);
    page.drawText(`Page ${w}x${h}`, { x: 50, y: h - 50, size: 12, font, color: rgb(0, 0, 0) });
  }
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export async function buildTablePdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const page = doc.addPage([595, 842]);
  const rows = [
    ['Name', 'Age', 'City'],
    ['Alice', '30', 'London'],
    ['Bob', '25', 'Paris'],
    ['Carol', '35', 'Berlin'],
  ];
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      page.drawText(cell, { x: 50 + ci * 150, y: 780 - ri * 20, size: 10, font, color: rgb(0, 0, 0) });
    });
  });
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export async function buildRotatedPagePdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.setRotation(degrees(90));
  page.drawText('Rotated page', { x: 50, y: 750, size: 12, font, color: rgb(0, 0, 0) });
  return doc.save() as unknown as Promise<Uint8Array<ArrayBuffer>>;
}

export function buildCorruptedPdf(): Uint8Array {
  // Not a valid PDF — truncated header
  return new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>');
}

export function buildNonPdfBytes(): Uint8Array {
  return new TextEncoder().encode('This is not a PDF file at all');
}

export function buildEmptyBytes(): Uint8Array {
  return new Uint8Array(0);
}

export function makeFile(name: string, bytes: Uint8Array): File {
  return new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' });
}

export function makePdfFileObj(name: string, bytes: Uint8Array, extra?: { pageCount?: number }) {
  return {
    id: `fixture-${name}`,
    name,
    size: bytes.length,
    file: makeFile(name, bytes),
    objectUrl: null,
    pageCount: extra?.pageCount ?? null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}
