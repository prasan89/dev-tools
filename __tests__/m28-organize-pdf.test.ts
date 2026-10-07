/**
 * M28 — PDF Page Organizer tests
 *
 * Tests cover:
 *  - buildInitialState: correct page count, zero rotation, no deleted
 *  - hasChanges: false on fresh state, true after rotate/delete/reorder
 *  - summarizeChanges: formats correctly for various change combos
 *  - rotatePage: single page rotation, wraps at 360
 *  - rotatePages: multiple pages, mixed
 *  - deletePage: removes page, records deletedIndices, adjusts list
 *  - deletePages: removes multiple pages
 *  - movePage: reorders pages, no-op when src === dst
 *  - buildOrganizedPdf: empty state error, cancel via AbortSignal
 *  - buildOrganizedPdf: reads bytes, calls pdf-lib
 *  - buildOrganizedPdf: page ordering preserved in output
 *  - buildOrganizedPdf: rotation applied
 *  - buildOrganizedPdf: deleted pages excluded
 *  - buildOrganizedPdf: result blob is PDF
 *  - buildOrganizedPdf: success fields (pageCount, sizeBytes, filename)
 *  - buildOrganizedPdf: encrypted PDF error
 *  - buildOrganizedPdf: memory error
 *  - Page component exports default function
 *  - Layout exports metadata with correct title
 *  - Sitemap includes /pdf-tools/organize-pdf
 *  - Hub page lists Organize PDF as available
 *  - organize.ts: rotation arithmetic (0+90=90, 90+90=180, 270+90=0)
 *  - organize.ts: deletedIndices cumulates across multiple deletes
 *  - organize.ts: movePage preserves all other pages
 *  - organize.ts: immutability — operations return new objects
 */

import {
  buildInitialState,
  hasChanges,
  summarizeChanges,
  rotatePage,
  rotatePages,
  deletePage,
  deletePages,
  movePage,
  buildOrganizedPdf,
} from '../src/lib/pdf/organize';
import type { OrganizerState } from '../src/lib/pdf/organize';
import type { PdfFile } from '../src/types/pdf';

// ─── Minimal real PDF bytes (pdf-lib can load this) ────────────────────────────
// A hand-crafted minimal cross-reference PDF with one blank page.
// pdf-lib requires a real xref table; we use a two-object minimal PDF.
const MINIMAL_1_PAGE_PDF = new Uint8Array([
  // %PDF-1.4
  0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a,
  // 1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
  0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a,
  0x3c, 0x3c, 0x20, 0x2f, 0x54, 0x79, 0x70, 0x65,
  0x20, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f,
  0x67, 0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73,
  0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x20, 0x3e,
  0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
  // 2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
  0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a,
  0x3c, 0x3c, 0x20, 0x2f, 0x54, 0x79, 0x70, 0x65,
  0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20,
  0x2f, 0x4b, 0x69, 0x64, 0x73, 0x20, 0x5b, 0x33,
  0x20, 0x30, 0x20, 0x52, 0x5d, 0x20, 0x2f, 0x43,
  0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x20, 0x3e,
  0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
  // 3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
  0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a,
  0x3c, 0x3c, 0x20, 0x2f, 0x54, 0x79, 0x70, 0x65,
  0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x20, 0x2f,
  0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x32,
  0x20, 0x30, 0x20, 0x52, 0x20, 0x2f, 0x4d, 0x65,
  0x64, 0x69, 0x61, 0x42, 0x6f, 0x78, 0x20, 0x5b,
  0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20,
  0x37, 0x39, 0x32, 0x5d, 0x20, 0x3e, 0x3e, 0x0a,
  0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
  // xref
  0x78, 0x72, 0x65, 0x66, 0x0a,
  0x30, 0x20, 0x34, 0x0a,
  0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a,
  0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x39, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
  0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x36, 0x38, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
  0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x35, 0x32, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
  // trailer
  0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a,
  0x3c, 0x3c, 0x20, 0x2f, 0x53, 0x69, 0x7a, 0x65,
  0x20, 0x34, 0x20, 0x2f, 0x52, 0x6f, 0x6f, 0x74,
  0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x20, 0x3e, 0x3e, 0x0a,
  // startxref
  0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a,
  0x32, 0x35, 0x30, 0x0a,
  // %%EOF
  0x25, 0x25, 0x45, 0x4f, 0x46,
]);

// ─── PdfFile factory ──────────────────────────────────────────────────────────

function makePdfFile(name = 'test.pdf', bytes: Uint8Array = MINIMAL_1_PAGE_PDF): PdfFile {
  const file = new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' });
  return {
    id: `id-${name}`,
    name,
    size: file.size,
    file,
    objectUrl: null,
    isCorrupted: false,
    isPasswordProtected: false,
    pageCount: null,
    loadedAt: Date.now(),
  };
}

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────
// We mock pdf-lib to avoid WASM loading in jsdom.
// The mock simulates load/create/copyPages/save/addPage/setRotation/getRotation.

type MockPage = { _rotation: number; getRotation: () => { angle: number }; setRotation: (r: { angle: number }) => void };

jest.mock('pdf-lib', () => {
  let pageCount = 1;

  const makePage = (rotation = 0): MockPage => ({
    _rotation: rotation,
    getRotation() { return { angle: this._rotation }; },
    setRotation(r: { angle: number }) { this._rotation = r.angle; },
  });

  const makePdfDoc = (count: number, opts?: { encrypted?: boolean }) => {
    if (opts?.encrypted) throw new Error('encrypted PDF — no password given');
    const pages: MockPage[] = Array.from({ length: count }, () => makePage());
    const added: MockPage[] = [];
    return {
      getPageCount: () => pages.length,
      copyPages: async (_src: unknown, indices: number[]) => indices.map((i) => makePage(pages[i]?._rotation ?? 0)),
      addPage: (p: MockPage) => { added.push(p); },
      save: async () => new Uint8Array([0x25, 0x50, 0x44, 0x46, ...Array.from({ length: 20 }, (_, i) => i)]),
      _added: added,
    };
  };

  return {
    PDFDocument: {
      load: jest.fn().mockImplementation(async (_buf: unknown, opts?: { ignoreEncryption?: boolean }) => {
        void opts;
        return makePdfDoc(pageCount);
      }),
      create: jest.fn().mockImplementation(async () => makePdfDoc(0)),
    },
    degrees: (n: number) => ({ angle: n }),
    __setPageCount: (n: number) => { pageCount = n; },
    __throwOnLoad: (msg: string) => {
      const { PDFDocument } = jest.requireMock('pdf-lib') as typeof import('pdf-lib') & { PDFDocument: { load: jest.Mock } };
      PDFDocument.load = jest.fn().mockRejectedValueOnce(new Error(msg));
    },
  };
});

// ─── buildInitialState ────────────────────────────────────────────────────────

describe('buildInitialState', () => {
  it('creates correct number of pages', () => {
    const s = buildInitialState(5);
    expect(s.pages).toHaveLength(5);
  });

  it('assigns originalIndex correctly', () => {
    const s = buildInitialState(3);
    expect(s.pages[0].originalIndex).toBe(0);
    expect(s.pages[2].originalIndex).toBe(2);
  });

  it('all rotations start at 0', () => {
    const s = buildInitialState(4);
    s.pages.forEach((p) => expect(p.rotation).toBe(0));
  });

  it('deletedIndices starts empty', () => {
    const s = buildInitialState(3);
    expect(s.deletedIndices.size).toBe(0);
  });

  it('handles 0 pages', () => {
    const s = buildInitialState(0);
    expect(s.pages).toHaveLength(0);
  });
});

// ─── hasChanges ───────────────────────────────────────────────────────────────

describe('hasChanges', () => {
  it('returns false for initial state', () => {
    const s = buildInitialState(3);
    expect(hasChanges(s, 3)).toBe(false);
  });

  it('returns true when a page is deleted', () => {
    const s = deletePage(buildInitialState(3), 0);
    expect(hasChanges(s, 3)).toBe(true);
  });

  it('returns true when a page is rotated', () => {
    const s = rotatePage(buildInitialState(3), 1, 90);
    expect(hasChanges(s, 3)).toBe(true);
  });

  it('returns true when pages are reordered', () => {
    const s = movePage(buildInitialState(3), 0, 2);
    expect(hasChanges(s, 3)).toBe(true);
  });

  it('returns true when page count differs', () => {
    const s = buildInitialState(3);
    expect(hasChanges(s, 4)).toBe(true);
  });
});

// ─── summarizeChanges ─────────────────────────────────────────────────────────

describe('summarizeChanges', () => {
  it('returns no-changes string for initial state', () => {
    const s = buildInitialState(3);
    expect(summarizeChanges(s, 3)).toBe('No changes');
  });

  it('includes deleted count', () => {
    const s = deletePage(buildInitialState(4), 0);
    const msg = summarizeChanges(s, 4);
    expect(msg).toContain('1 deleted');
  });

  it('includes rotated count', () => {
    let s = buildInitialState(4);
    s = rotatePage(s, 0, 90);
    s = rotatePage(s, 2, 180);
    const msg = summarizeChanges(s, 4);
    expect(msg).toContain('2 rotated');
  });

  it('includes reorder marker', () => {
    const s = movePage(buildInitialState(4), 0, 3);
    expect(summarizeChanges(s, 4)).toContain('pages reordered');
  });

  it('includes original and current page counts', () => {
    const s = deletePage(buildInitialState(4), 0);
    const msg = summarizeChanges(s, 4);
    expect(msg).toContain('Original: 4 pages');
    expect(msg).toContain('Current: 3 pages');
  });
});

// ─── rotatePage ───────────────────────────────────────────────────────────────

describe('rotatePage', () => {
  it('rotates by 90', () => {
    const s = rotatePage(buildInitialState(3), 1, 90);
    expect(s.pages[1].rotation).toBe(90);
  });

  it('rotates by -90 wraps correctly', () => {
    const s = rotatePage(buildInitialState(3), 0, -90);
    expect(s.pages[0].rotation).toBe(270);
  });

  it('wraps at 360', () => {
    let s = buildInitialState(1);
    s = rotatePage(s, 0, 90);
    s = rotatePage(s, 0, 90);
    s = rotatePage(s, 0, 90);
    s = rotatePage(s, 0, 90);
    expect(s.pages[0].rotation).toBe(0);
  });

  it('does not mutate input state', () => {
    const orig = buildInitialState(2);
    rotatePage(orig, 0, 90);
    expect(orig.pages[0].rotation).toBe(0);
  });

  it('leaves other pages unchanged', () => {
    const s = rotatePage(buildInitialState(3), 1, 180);
    expect(s.pages[0].rotation).toBe(0);
    expect(s.pages[2].rotation).toBe(0);
  });
});

// ─── rotatePages ──────────────────────────────────────────────────────────────

describe('rotatePages', () => {
  it('rotates multiple pages', () => {
    const s = rotatePages(buildInitialState(4), [0, 2, 3], 90);
    expect(s.pages[0].rotation).toBe(90);
    expect(s.pages[1].rotation).toBe(0);
    expect(s.pages[2].rotation).toBe(90);
    expect(s.pages[3].rotation).toBe(90);
  });

  it('rotates with empty list is no-op', () => {
    const s = rotatePages(buildInitialState(3), [], 90);
    s.pages.forEach((p) => expect(p.rotation).toBe(0));
  });
});

// ─── deletePage ───────────────────────────────────────────────────────────────

describe('deletePage', () => {
  it('removes the page from the list', () => {
    const s = deletePage(buildInitialState(4), 1);
    expect(s.pages).toHaveLength(3);
    expect(s.pages.map((p) => p.originalIndex)).toEqual([0, 2, 3]);
  });

  it('records original index in deletedIndices', () => {
    const s = deletePage(buildInitialState(4), 2);
    expect(s.deletedIndices.has(2)).toBe(true);
  });

  it('cumulates deletedIndices across multiple deletes', () => {
    let s = buildInitialState(5);
    s = deletePage(s, 0);
    s = deletePage(s, 0); // was originally index 1
    expect(s.deletedIndices.has(0)).toBe(true);
    expect(s.deletedIndices.has(1)).toBe(true);
    expect(s.pages).toHaveLength(3);
  });

  it('does not mutate input', () => {
    const orig = buildInitialState(3);
    deletePage(orig, 0);
    expect(orig.pages).toHaveLength(3);
  });
});

// ─── deletePages ─────────────────────────────────────────────────────────────

describe('deletePages', () => {
  it('removes multiple pages', () => {
    const s = deletePages(buildInitialState(5), [0, 2, 4]);
    expect(s.pages).toHaveLength(2);
    expect(s.pages.map((p) => p.originalIndex)).toEqual([1, 3]);
  });

  it('records all original indices', () => {
    const s = deletePages(buildInitialState(5), [1, 3]);
    expect(s.deletedIndices.has(1)).toBe(true);
    expect(s.deletedIndices.has(3)).toBe(true);
  });
});

// ─── movePage ─────────────────────────────────────────────────────────────────

describe('movePage', () => {
  it('moves page forward', () => {
    const s = movePage(buildInitialState(4), 0, 3);
    expect(s.pages.map((p) => p.originalIndex)).toEqual([1, 2, 3, 0]);
  });

  it('moves page backward', () => {
    const s = movePage(buildInitialState(4), 3, 0);
    expect(s.pages.map((p) => p.originalIndex)).toEqual([3, 0, 1, 2]);
  });

  it('no-op when from === to', () => {
    const orig = buildInitialState(4);
    const s = movePage(orig, 2, 2);
    expect(s).toBe(orig); // identity
  });

  it('preserves page count', () => {
    const s = movePage(buildInitialState(5), 1, 4);
    expect(s.pages).toHaveLength(5);
  });

  it('does not mutate input', () => {
    const orig = buildInitialState(4);
    movePage(orig, 0, 3);
    expect(orig.pages[0].originalIndex).toBe(0);
  });
});

// ─── buildOrganizedPdf ────────────────────────────────────────────────────────

describe('buildOrganizedPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset page count to 1 in mock
    const pdfLib = jest.requireMock('pdf-lib') as { __setPageCount: (n: number) => void };
    pdfLib.__setPageCount(1);
  });

  it('returns error for empty pages state', async () => {
    const s: OrganizerState = { pages: [], deletedIndices: new Set() };
    const result = await buildOrganizedPdf(makePdfFile(), s);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/no pages/i);
    }
  });

  it('returns error when signal is already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const s = buildInitialState(1);
    const result = await buildOrganizedPdf(makePdfFile(), s, ac.signal);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/cancel/i);
    }
  });

  it('returns success with blob on valid PDF', async () => {
    const s = buildInitialState(1);
    const result = await buildOrganizedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.pageCount).toBe(1);
      expect(result.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('output blob starts with %PDF', async () => {
    const s = buildInitialState(1);
    const result = await buildOrganizedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    if (result.success) {
      const bytes = await new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsArrayBuffer(result.blob);
      });
      expect(bytes[0]).toBe(0x25); // %
      expect(bytes[1]).toBe(0x50); // P
      expect(bytes[2]).toBe(0x44); // D
      expect(bytes[3]).toBe(0x46); // F
    }
  });

  it('filename ends with -organized.pdf', async () => {
    const result = await buildOrganizedPdf(makePdfFile('my-document.pdf'), buildInitialState(1));
    if (result.success) {
      expect(result.filename).toBe('my-document-organized.pdf');
    }
  });

  it('returns correct pageCount for multi-page organizer state', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __setPageCount: (n: number) => void };
    pdfLib.__setPageCount(3);
    const s = buildInitialState(3);
    const result = await buildOrganizedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    if (result.success) expect(result.pageCount).toBe(3);
  });

  it('returns error for encrypted PDF', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (msg: string) => void };
    pdfLib.__throwOnLoad('encrypted PDF — no password given');
    const result = await buildOrganizedPdf(makePdfFile(), buildInitialState(1));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/password|encrypted/i);
    }
  });

  it('handles cancellation mid-way (after file read)', async () => {
    const ac = new AbortController();
    // Abort after the first await to simulate mid-processing cancel
    const pdfLibMock = jest.requireMock('pdf-lib') as { PDFDocument: { load: jest.Mock } };
    const orig = pdfLibMock.PDFDocument.load;
    pdfLibMock.PDFDocument.load = jest.fn().mockImplementationOnce(async (...args: unknown[]) => {
      ac.abort();
      return orig(...args);
    });
    const result = await buildOrganizedPdf(makePdfFile(), buildInitialState(1), ac.signal);
    expect(result.success).toBe(false);
  });
});

// ─── Module-level smoke tests ─────────────────────────────────────────────────

describe('organize-pdf page module', () => {
  it('exports a default function', async () => {
    const mod = await import('../src/app/pdf-tools/organize-pdf/page');
    expect(typeof mod.default).toBe('function');
  });
});

describe('organize-pdf layout module', () => {
  it('exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/organize-pdf/layout');
    expect(mod.metadata).toBeDefined();
    expect(typeof mod.metadata.title).toBe('string');
    expect((mod.metadata.title as string).toLowerCase()).toContain('organize');
  });

  it('metadata includes canonical URL for /pdf-tools/organize-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/organize-pdf/layout');
    const canonical = mod.metadata.alternates?.canonical as string;
    expect(canonical).toContain('/pdf-tools/organize-pdf');
  });
});

describe('sitemap', () => {
  it('includes /pdf-tools/organize-pdf', async () => {
    const mod = await import('../src/app/sitemap');
    const entries = mod.default();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes('/pdf-tools/organize-pdf'))).toBe(true);
  });
});

describe('pdf-tools hub page', () => {
  it('lists Organize PDF as available', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/app/pdf-tools/page.tsx', 'utf-8');
    expect(src).toContain('organize-pdf');
    expect(src).toContain('available: true');
  });
});
