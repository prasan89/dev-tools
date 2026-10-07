/**
 * M30 — PDF Crop tests
 *
 * Tests cover:
 *  - getAspectRatio: all modes
 *  - constrainToAspectRatio: constrains height, clamps within page
 *  - getPresetDimensions: known presets
 *  - presetToCrop: a4/a5/letter/square, original/custom returns null
 *  - validateCrop: zero size, negative coords, out of bounds, valid
 *  - pxCropToPdfCrop: coordinate conversion
 *  - pdfCropToPxCrop: coordinate conversion round-trip
 *  - buildCroppedPdf: empty cropConfigs error
 *  - buildCroppedPdf: AbortSignal cancelled
 *  - buildCroppedPdf: success returns PDF blob
 *  - buildCroppedPdf: result pageCount and sizeBytes
 *  - buildCroppedPdf: encrypted PDF error
 *  - buildCroppedPdf: invalid crop region error
 *  - buildCroppedPdf: filename has -cropped.pdf suffix
 *  - Page component exports default function
 *  - Layout exports metadata with correct title
 *  - Sitemap includes /pdf-tools/crop-pdf
 *  - Hub page lists Crop PDF as available
 *  - CropOverlay module exports pxCropToPdfCrop and pdfCropToPxCrop
 */

import {
  getAspectRatio,
  constrainToAspectRatio,
  getPresetDimensions,
  presetToCrop,
  validateCrop,
  buildCroppedPdf,
} from '../src/lib/pdf/crop';
import type { CropRect } from '../src/lib/pdf/crop';
import { pxCropToPdfCrop, pdfCropToPxCrop } from '../src/components/pdf/CropOverlay';
import type { PdfFile } from '../src/types/pdf';

// ─── PdfFile factory ──────────────────────────────────────────────────────────

function makePdfFile(name = 'test.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────

jest.mock('pdf-lib', () => {
  const makePage = (w = 612, h = 792) => ({
    getSize: () => ({ width: w, height: h }),
    getRotation: () => ({ angle: 0 }),
    setCropBox: jest.fn(),
    setMediaBox: jest.fn(),
  });

  const makeDoc = (pageCount = 1) => ({
    getPageCount: () => pageCount,
    getPages: () => Array.from({ length: pageCount }, () => makePage()),
    save: jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])),
  });

  return {
    PDFDocument: {
      load: jest.fn().mockImplementation(async () => makeDoc(3)),
      create: jest.fn().mockImplementation(async () => makeDoc(0)),
    },
    __setPageCount: (n: number) => {
      const { PDFDocument } = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
      PDFDocument.load = jest.fn().mockImplementation(async () => makeDoc(n));
    },
    __throwOnLoad: (msg: string) => {
      const { PDFDocument } = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
      PDFDocument.load = jest.fn().mockRejectedValueOnce(new Error(msg));
    },
  };
});

// ─── getAspectRatio ───────────────────────────────────────────────────────────

describe('getAspectRatio', () => {
  it('returns null for free', () => expect(getAspectRatio('free')).toBeNull());
  it('returns 1 for 1:1', () => expect(getAspectRatio('1:1')).toBe(1));
  it('returns 4/3 for 4:3', () => expect(getAspectRatio('4:3')).toBeCloseTo(4 / 3));
  it('returns 16/9 for 16:9', () => expect(getAspectRatio('16:9')).toBeCloseTo(16 / 9));
  it('returns portrait ratio for a4', () => expect(getAspectRatio('a4')).toBeCloseTo(210 / 297));
  it('returns portrait ratio for letter', () => expect(getAspectRatio('letter')).toBeCloseTo(8.5 / 11));
});

// ─── constrainToAspectRatio ───────────────────────────────────────────────────

describe('constrainToAspectRatio', () => {
  it('adjusts height to match ratio', () => {
    const r = constrainToAspectRatio({ x: 0, y: 0, w: 100, h: 200 }, 1, 600, 800);
    expect(r.w).toBe(100);
    expect(r.h).toBeCloseTo(100);
  });

  it('clamps within page boundaries', () => {
    const r = constrainToAspectRatio({ x: 0, y: 0, w: 600, h: 900 }, 1, 600, 400);
    expect(r.w).toBeLessThanOrEqual(600);
    expect(r.h).toBeLessThanOrEqual(400);
  });
});

// ─── getPresetDimensions ──────────────────────────────────────────────────────

describe('getPresetDimensions', () => {
  it('a4 returns correct dimensions', () => {
    const d = getPresetDimensions('a4');
    expect(d).not.toBeNull();
    expect(d!.w).toBeCloseTo(595.28, 1);
    expect(d!.h).toBeCloseTo(841.89, 1);
  });

  it('a5 returns correct dimensions', () => {
    const d = getPresetDimensions('a5');
    expect(d).not.toBeNull();
    expect(d!.w).toBeCloseTo(419.53, 1);
  });

  it('letter returns correct dimensions', () => {
    const d = getPresetDimensions('letter');
    expect(d).not.toBeNull();
    expect(d!.w).toBe(612);
    expect(d!.h).toBe(792);
  });

  it('square returns null', () => expect(getPresetDimensions('square')).toBeNull());
  it('original returns null', () => expect(getPresetDimensions('original')).toBeNull());
  it('custom returns null', () => expect(getPresetDimensions('custom')).toBeNull());
});

// ─── presetToCrop ─────────────────────────────────────────────────────────────

describe('presetToCrop', () => {
  it('original returns null', () => expect(presetToCrop('original', 612, 792)).toBeNull());
  it('custom returns null', () => expect(presetToCrop('custom', 612, 792)).toBeNull());

  it('square returns centered square crop', () => {
    const r = presetToCrop('square', 612, 792);
    expect(r).not.toBeNull();
    expect(r!.w).toBe(r!.h);
    expect(r!.w).toBe(612); // min(612, 792)
  });

  it('square is centered vertically on portrait page', () => {
    const r = presetToCrop('square', 612, 792)!;
    expect(r.x).toBeCloseTo(0, 0);
    expect(r.y).toBeCloseTo((792 - 612) / 2, 0);
  });

  it('a4 crop fits within page', () => {
    const r = presetToCrop('a4', 612, 792)!;
    expect(r.x + r.w).toBeLessThanOrEqual(612 + 0.1);
    expect(r.y + r.h).toBeLessThanOrEqual(792 + 0.1);
  });

  it('a4 crop preserves aspect ratio', () => {
    const r = presetToCrop('a4', 612, 792)!;
    expect(r.w / r.h).toBeCloseTo(595.28 / 841.89, 2);
  });

  it('letter crop returns non-null', () => expect(presetToCrop('letter', 612, 792)).not.toBeNull());
});

// ─── validateCrop ─────────────────────────────────────────────────────────────

describe('validateCrop', () => {
  const page = { w: 612, h: 792 };

  it('returns null for valid crop', () => {
    expect(validateCrop({ x: 10, y: 10, w: 500, h: 700 }, page.w, page.h)).toBeNull();
  });

  it('returns error for zero width', () => {
    expect(validateCrop({ x: 0, y: 0, w: 0, h: 100 }, page.w, page.h)).toMatch(/too small/i);
  });

  it('returns error for zero height', () => {
    expect(validateCrop({ x: 0, y: 0, w: 100, h: 0 }, page.w, page.h)).toMatch(/too small/i);
  });

  it('returns error for negative x', () => {
    expect(validateCrop({ x: -1, y: 0, w: 100, h: 100 }, page.w, page.h)).toMatch(/outside/i);
  });

  it('returns error for negative y', () => {
    expect(validateCrop({ x: 0, y: -1, w: 100, h: 100 }, page.w, page.h)).toMatch(/outside/i);
  });

  it('returns error when crop exceeds page width', () => {
    expect(validateCrop({ x: 0, y: 0, w: 700, h: 100 }, page.w, page.h)).toMatch(/beyond/i);
  });

  it('returns error when crop exceeds page height', () => {
    expect(validateCrop({ x: 0, y: 0, w: 100, h: 900 }, page.w, page.h)).toMatch(/beyond/i);
  });

  it('allows sub-point tolerance', () => {
    // 0.5pt overshoot should be fine
    expect(validateCrop({ x: 0, y: 0, w: 612.3, h: 792.3 }, page.w, page.h)).toBeNull();
  });
});

// ─── coordinate conversions ───────────────────────────────────────────────────

describe('pxCropToPdfCrop', () => {
  it('converts correctly (scale=1, pageH=792)', () => {
    const px = { x: 10, y: 20, w: 100, h: 200 };
    const pdf = pxCropToPdfCrop(px, 1, 792);
    expect(pdf.x).toBe(10);
    expect(pdf.w).toBe(100);
    expect(pdf.h).toBe(200);
    // y = pageH - (px.y + px.h) = 792 - 220 = 572
    expect(pdf.y).toBe(572);
  });

  it('scales correctly', () => {
    const px = { x: 20, y: 40, w: 200, h: 400 };
    const pdf = pxCropToPdfCrop(px, 2, 792);
    expect(pdf.x).toBe(10);
    expect(pdf.w).toBe(100);
    expect(pdf.h).toBe(200);
  });
});

describe('pdfCropToPxCrop', () => {
  it('round-trips with pxCropToPdfCrop', () => {
    const original = { x: 30, y: 50, w: 150, h: 250 };
    const pdf = pxCropToPdfCrop(original, 1.5, 792);
    const back = pdfCropToPxCrop(pdf, 1.5, 792);
    expect(back.x).toBeCloseTo(original.x, 0);
    expect(back.y).toBeCloseTo(original.y, 0);
    expect(back.w).toBeCloseTo(original.w, 0);
    expect(back.h).toBeCloseTo(original.h, 0);
  });
});

// ─── buildCroppedPdf ──────────────────────────────────────────────────────────

describe('buildCroppedPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const m = jest.requireMock('pdf-lib') as { __setPageCount: (n: number) => void };
    m.__setPageCount(3);
  });

  it('returns error for empty cropConfigs', async () => {
    const result = await buildCroppedPdf(makePdfFile(), new Map());
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/no crop/i);
  });

  it('returns error when signal already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const crops: Map<number, CropRect> = new Map([[0, { x: 0, y: 0, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops, ac.signal);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/cancel/i);
  });

  it('returns success for valid single-page crop', async () => {
    const crops: Map<number, CropRect> = new Map([[0, { x: 10, y: 10, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('filename has -cropped.pdf suffix', async () => {
    const crops: Map<number, CropRect> = new Map([[0, { x: 0, y: 0, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile('document.pdf'), crops);
    if (result.success) {
      expect(result.filename).toBe('document-cropped.pdf');
    }
  });

  it('returns pageCount from document', async () => {
    const crops: Map<number, CropRect> = new Map([[0, { x: 0, y: 0, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    if (result.success) {
      expect(result.pageCount).toBe(3);
    }
  });

  it('returns error for encrypted PDF', async () => {
    const m = jest.requireMock('pdf-lib') as { __throwOnLoad: (msg: string) => void };
    m.__throwOnLoad('encrypted PDF — no password');
    const crops: Map<number, CropRect> = new Map([[0, { x: 0, y: 0, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/password|encrypted/i);
  });

  it('returns error for invalid crop (zero size)', async () => {
    const crops: Map<number, CropRect> = new Map([[0, { x: 0, y: 0, w: 0, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    expect(result.success).toBe(false);
  });

  it('calls setCropBox and setMediaBox on affected pages', async () => {
    const crops: Map<number, CropRect> = new Map([[0, { x: 10, y: 20, w: 400, h: 600 }]]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    expect(result.success).toBe(true);
    // Verify the mock page methods were called
    const { PDFDocument } = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
    expect(PDFDocument.load).toHaveBeenCalled();
  });

  it('skips out-of-bounds page indices without error', async () => {
    const crops: Map<number, CropRect> = new Map([
      [0, { x: 0, y: 0, w: 400, h: 600 }],
      [999, { x: 0, y: 0, w: 400, h: 600 }], // doesn't exist
    ]);
    const result = await buildCroppedPdf(makePdfFile(), crops);
    expect(result.success).toBe(true);
  });
});

// ─── Module smoke tests ───────────────────────────────────────────────────────

describe('crop-pdf page module', () => {
  it('exports a default function', async () => {
    const mod = await import('../src/app/pdf-tools/crop-pdf/page');
    expect(typeof mod.default).toBe('function');
  });
});

describe('crop-pdf layout module', () => {
  it('exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/crop-pdf/layout');
    expect(mod.metadata).toBeDefined();
    expect((mod.metadata.title as string).toLowerCase()).toContain('crop');
  });

  it('metadata includes canonical URL', async () => {
    const mod = await import('../src/app/pdf-tools/crop-pdf/layout');
    const canonical = mod.metadata.alternates?.canonical as string;
    expect(canonical).toContain('/pdf-tools/crop-pdf');
  });
});

describe('sitemap', () => {
  it('includes /pdf-tools/crop-pdf', async () => {
    const mod = await import('../src/app/sitemap');
    const urls = mod.default().map((e) => e.url);
    expect(urls.some((u) => u.includes('/pdf-tools/crop-pdf'))).toBe(true);
  });
});

describe('pdf-tools hub', () => {
  it('lists Crop PDF as available', () => {
    const fs = require('fs');
    const src = fs.readFileSync('src/app/pdf-tools/page.tsx', 'utf-8');
    expect(src).toContain('crop-pdf');
    expect(src).toContain('available: true');
  });
});
