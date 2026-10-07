/**
 * M50 — Scan/Image to PDF tests
 */

import {
  addScanPage,
  buildScanPdf,
  moveScanPage,
  removeScanPage,
  rotateScanPage,
  setColorMode,
} from '../src/lib/pdf/scanToPdf';
import type { ScanPage } from '../src/lib/pdf/scanToPdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(name = 'scan.jpg', type = 'image/jpeg'): File {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
  return new File([bytes.buffer as ArrayBuffer], name, { type });
}

function makePage(overrides: Partial<ScanPage> = {}): ScanPage {
  return {
    id: 'test-id-1',
    file: makeFile(),
    rotation: 0,
    colorMode: 'original',
    ...overrides,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawImage = jest.fn();
const mockAddPage = jest.fn().mockReturnValue({ drawImage: mockDrawImage });
const mockEmbedJpg = jest.fn().mockResolvedValue({
  width: 400,
  height: 300,
  scale: jest.fn().mockReturnValue({ width: 400, height: 300 }),
});
const mockEmbedPng = jest.fn().mockResolvedValue({
  width: 400,
  height: 300,
  scale: jest.fn().mockReturnValue({ width: 400, height: 300 }),
});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  addPage: mockAddPage,
  embedJpg: mockEmbedJpg,
  embedPng: mockEmbedPng,
  save: mockSave,
};

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue(mockDoc),
  },
  degrees: jest.fn((n: number) => n),
  rgb: jest.fn().mockReturnValue({}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockAddPage.mockReturnValue({ drawImage: mockDrawImage });
  mockEmbedJpg.mockResolvedValue({
    width: 400,
    height: 300,
    scale: jest.fn().mockReturnValue({ width: 400, height: 300 }),
  });
  mockEmbedPng.mockResolvedValue({
    width: 400,
    height: 300,
    scale: jest.fn().mockReturnValue({ width: 400, height: 300 }),
  });
});

// ─── addScanPage ──────────────────────────────────────────────────────────────

describe('addScanPage', () => {
  it('appends a new page', () => {
    const result = addScanPage([], makeFile());
    expect(result).toHaveLength(1);
  });

  it('defaults rotation to 0', () => {
    const result = addScanPage([], makeFile());
    expect(result[0].rotation).toBe(0);
  });

  it('defaults colorMode to original', () => {
    const result = addScanPage([], makeFile());
    expect(result[0].colorMode).toBe('original');
  });

  it('assigns a unique id', () => {
    const r1 = addScanPage([], makeFile());
    const r2 = addScanPage([], makeFile());
    expect(r1[0].id).not.toBe(r2[0].id);
  });

  it('preserves existing pages', () => {
    const existing = [makePage({ id: 'a' })];
    const result = addScanPage(existing, makeFile());
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('a');
  });
});

// ─── removeScanPage ───────────────────────────────────────────────────────────

describe('removeScanPage', () => {
  it('removes page by id', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b' })];
    expect(removeScanPage(pages, 'a')).toHaveLength(1);
    expect(removeScanPage(pages, 'a')[0].id).toBe('b');
  });

  it('returns same array if id not found', () => {
    const pages = [makePage({ id: 'a' })];
    expect(removeScanPage(pages, 'z')).toHaveLength(1);
  });
});

// ─── moveScanPage ─────────────────────────────────────────────────────────────

describe('moveScanPage', () => {
  it('moves page up', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b' }), makePage({ id: 'c' })];
    const result = moveScanPage(pages, 'b', 'up');
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('a');
    expect(result[2].id).toBe('c');
  });

  it('moves page down', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b' }), makePage({ id: 'c' })];
    const result = moveScanPage(pages, 'b', 'down');
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('c');
    expect(result[2].id).toBe('b');
  });

  it('does not move first page up', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b' })];
    const result = moveScanPage(pages, 'a', 'up');
    expect(result[0].id).toBe('a');
  });

  it('does not move last page down', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b' })];
    const result = moveScanPage(pages, 'b', 'down');
    expect(result[1].id).toBe('b');
  });
});

// ─── rotateScanPage ───────────────────────────────────────────────────────────

describe('rotateScanPage', () => {
  it('rotates 0 → 90', () => {
    const pages = [makePage({ id: 'a', rotation: 0 })];
    expect(rotateScanPage(pages, 'a')[0].rotation).toBe(90);
  });

  it('rotates 90 → 180', () => {
    const pages = [makePage({ id: 'a', rotation: 90 })];
    expect(rotateScanPage(pages, 'a')[0].rotation).toBe(180);
  });

  it('rotates 270 → 0', () => {
    const pages = [makePage({ id: 'a', rotation: 270 })];
    expect(rotateScanPage(pages, 'a')[0].rotation).toBe(0);
  });

  it('does not rotate other pages', () => {
    const pages = [makePage({ id: 'a', rotation: 0 }), makePage({ id: 'b', rotation: 0 })];
    expect(rotateScanPage(pages, 'a')[1].rotation).toBe(0);
  });
});

// ─── setColorMode ─────────────────────────────────────────────────────────────

describe('setColorMode', () => {
  it('updates color mode by id', () => {
    const pages = [makePage({ id: 'a', colorMode: 'original' })];
    expect(setColorMode(pages, 'a', 'grayscale')[0].colorMode).toBe('grayscale');
  });

  it('updates to blackwhite', () => {
    const pages = [makePage({ id: 'a', colorMode: 'original' })];
    expect(setColorMode(pages, 'a', 'blackwhite')[0].colorMode).toBe('blackwhite');
  });

  it('does not change other pages', () => {
    const pages = [makePage({ id: 'a' }), makePage({ id: 'b', colorMode: 'grayscale' })];
    const result = setColorMode(pages, 'a', 'blackwhite');
    expect(result[1].colorMode).toBe('grayscale');
  });
});

// ─── buildScanPdf ─────────────────────────────────────────────────────────────

describe('buildScanPdf', () => {
  it('returns error for empty pages', async () => {
    const result = await buildScanPdf([], 'A4');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no pages/i);
  });

  it('returns success blob for jpeg page', async () => {
    const pages = addScanPage([], makeFile('scan.jpg', 'image/jpeg'));
    const result = await buildScanPdf(pages, 'A4');
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toBe('scanned_document.pdf');
  });

  it('returns success blob for png page', async () => {
    const pages = addScanPage([], makeFile('scan.png', 'image/png'));
    const result = await buildScanPdf(pages, 'fit');
    expect(result.success).toBe(true);
  });

  it('calls addPage for each scan page', async () => {
    let pages: ReturnType<typeof addScanPage> = [];
    pages = addScanPage(pages, makeFile('a.jpg', 'image/jpeg'));
    pages = addScanPage(pages, makeFile('b.jpg', 'image/jpeg'));
    await buildScanPdf(pages, 'Letter');
    expect(mockAddPage).toHaveBeenCalledTimes(2);
  });

  it('output blob type is application/pdf', async () => {
    const pages = addScanPage([], makeFile('scan.jpg', 'image/jpeg'));
    const result = await buildScanPdf(pages, 'A4');
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('scan-to-pdf layout metadata', () => {
  it('title contains scan to PDF or image to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/scan-to-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/scan|image.+pdf/i);
  });

  it('has scan/image-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/scan-to-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/scan to pdf|image to pdf|photo to pdf/);
  });

  it('canonical url contains scan-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/scan-to-pdf/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('scan-to-pdf');
  });
});
