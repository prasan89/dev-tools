/**
 * M41 — PDF Page Numbers tests
 */

import {
  defaultConfig,
  formatPageNumber,
  selectedPageIndices,
  buildPageNumberedPdf,
} from '../src/lib/pdf/pageNumbers';
import type { PageNumberConfig } from '../src/lib/pdf/pageNumbers';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'doc.pdf', pageCount = 5): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockPage = { drawText: mockDrawText, getSize: mockGetSize };
const mockEmbedFont = jest.fn().mockResolvedValue({
  widthOfTextAtSize: jest.fn().mockReturnValue(60),
});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(5),
  getPage: jest.fn().mockReturnValue(mockPage),
  embedFont: mockEmbedFont,
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
  };
  return {
    PDFDocument,
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    degrees: jest.fn((n: number) => n),
    StandardFonts: { Helvetica: 'Helvetica', Courier: 'Courier', TimesRoman: 'TimesRoman' },
    __throwOnLoad: (msg: string) => {
      _throw = msg;
      PDFDocument.load = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetLoad: () => {
      _throw = null;
      PDFDocument.load = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockDoc.getPageCount.mockReturnValue(5);
  mockDoc.getPage.mockReturnValue(mockPage);
  mockGetSize.mockReturnValue({ width: 595, height: 842 });
  mockEmbedFont.mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(60) });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── formatPageNumber ──────────────────────────────────────────────────────────

describe('formatPageNumber', () => {
  const cfg = defaultConfig();

  it('format "1" returns plain number', () => {
    expect(formatPageNumber(3, 10, { ...cfg, format: '1' })).toBe('3');
  });

  it('format "Page N" returns "Page N"', () => {
    expect(formatPageNumber(3, 10, { ...cfg, format: 'Page N' })).toBe('Page 3');
  });

  it('format "Page N of T" returns "Page N of T"', () => {
    expect(formatPageNumber(3, 10, { ...cfg, format: 'Page N of T' })).toBe('Page 3 of 10');
  });

  it('format "N / T" returns "N / T"', () => {
    expect(formatPageNumber(3, 10, { ...cfg, format: 'N / T' })).toBe('3 / 10');
  });

  it('format "custom" applies prefix and suffix', () => {
    const result = formatPageNumber(2, 5, { ...cfg, format: 'custom', customPrefix: 'Pg. ', customSuffix: '.' });
    expect(result).toBe('Pg. 2.');
  });

  it('startNumber shifts displayed number via caller', () => {
    // caller computes pageNumber = startNumber + counter - 1
    expect(formatPageNumber(10, 20, { ...cfg, format: '1' })).toBe('10');
  });
});

// ─── selectedPageIndices ──────────────────────────────────────────────────────

describe('selectedPageIndices', () => {
  const cfg = defaultConfig();

  it('all: returns all indices', () => {
    expect(selectedPageIndices({ ...cfg, pageSelection: 'all' }, 4)).toEqual([0, 1, 2, 3]);
  });

  it('odd: returns even-index pages (pages 1,3,5…)', () => {
    expect(selectedPageIndices({ ...cfg, pageSelection: 'odd' }, 4)).toEqual([0, 2]);
  });

  it('even: returns odd-index pages (pages 2,4…)', () => {
    expect(selectedPageIndices({ ...cfg, pageSelection: 'even' }, 4)).toEqual([1, 3]);
  });

  it('range: parses page range string', () => {
    const result = selectedPageIndices({ ...cfg, pageSelection: 'range', pageRange: '1,3' }, 5);
    expect(result.sort()).toEqual([0, 2]);
  });

  it('range with hyphen: includes range', () => {
    const result = selectedPageIndices({ ...cfg, pageSelection: 'range', pageRange: '2-4' }, 5);
    expect(result.sort()).toEqual([1, 2, 3]);
  });
});

// ─── buildPageNumberedPdf ─────────────────────────────────────────────────────

describe('buildPageNumberedPdf: success', () => {
  it('returns success with output blob', async () => {
    const result = await buildPageNumberedPdf(makePdfFile(), defaultConfig());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toMatch(/_numbered\.pdf$/);
  });

  it('output filename is correct', async () => {
    const result = await buildPageNumberedPdf(makePdfFile('report.pdf'), defaultConfig());
    expect(result.outputFile!.filename).toBe('report_numbered.pdf');
  });

  it('calls drawText once per selected page (all, 5 pages)', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 5), { ...defaultConfig(), pageSelection: 'all' });
    expect(mockDrawText).toHaveBeenCalledTimes(5);
  });

  it('calls drawText with page number text', async () => {
    await buildPageNumberedPdf(makePdfFile(), { ...defaultConfig(), format: '1', pageSelection: 'all' });
    const calls = mockDrawText.mock.calls.map((c: [string, unknown]) => c[0]);
    expect(calls).toContain('1');
    expect(calls).toContain('5');
  });

  it('odd selection: draws on 3 pages out of 5 (pages 1,3,5)', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 5), { ...defaultConfig(), pageSelection: 'odd' });
    expect(mockDrawText).toHaveBeenCalledTimes(3);
  });

  it('even selection: draws on 2 pages out of 5 (pages 2,4)', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 5), { ...defaultConfig(), pageSelection: 'even' });
    expect(mockDrawText).toHaveBeenCalledTimes(2);
  });

  it('range selection: draws only on specified pages', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 5), {
      ...defaultConfig(),
      pageSelection: 'range',
      pageRange: '1,3',
    });
    expect(mockDrawText).toHaveBeenCalledTimes(2);
  });

  it('passes opacity to drawText', async () => {
    await buildPageNumberedPdf(makePdfFile(), { ...defaultConfig(), opacity: 0.5, pageSelection: 'all' });
    const call = mockDrawText.mock.calls[0][1];
    expect(call.opacity).toBe(0.5);
  });

  it('passes font size to drawText', async () => {
    await buildPageNumberedPdf(makePdfFile(), { ...defaultConfig(), fontSize: 14, pageSelection: 'all' });
    const call = mockDrawText.mock.calls[0][1];
    expect(call.size).toBe(14);
  });

  it('embeds font', async () => {
    await buildPageNumberedPdf(makePdfFile(), defaultConfig());
    expect(mockEmbedFont).toHaveBeenCalledTimes(1);
  });

  it('skips first N pages when pageOffset > 0', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 5), {
      ...defaultConfig(),
      pageSelection: 'all',
      pageOffset: 2,
    });
    // pages 0,1 skipped; pages 2,3,4 numbered
    expect(mockDrawText).toHaveBeenCalledTimes(3);
  });

  it('startNumber shifts first displayed number', async () => {
    await buildPageNumberedPdf(makePdfFile('doc.pdf', 3), {
      ...defaultConfig(),
      format: '1',
      pageSelection: 'all',
      startNumber: 5,
    });
    const calls = mockDrawText.mock.calls.map((c: [string, unknown]) => c[0]);
    expect(calls[0]).toBe('5');
    expect(calls[2]).toBe('7');
  });
});

describe('buildPageNumberedPdf: error handling', () => {
  it('returns failure when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('bad pdf data');
    const result = await buildPageNumberedPdf(makePdfFile(), defaultConfig());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf data/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('page-numbers layout metadata', () => {
  it('title contains page numbers', async () => {
    const mod = await import('../src/app/pdf-tools/page-numbers/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/page number/i);
  });

  it('has page numbering keywords', async () => {
    const mod = await import('../src/app/pdf-tools/page-numbers/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/add page numbers|page numbering|number pdf/);
  });

  it('canonical url contains page-numbers', async () => {
    const mod = await import('../src/app/pdf-tools/page-numbers/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('page-numbers');
  });
});
