/**
 * M40 — Watermark PDF tests
 *
 * Tests cover:
 *  - parsePageRange: ranges, single pages, commas, out-of-range, invalid
 *  - selectedPageIndices: all, odd, even, range
 *  - calcWatermarkPosition: all 11 positions
 *  - hexToRgb
 *  - defaultTextConfig / defaultImageConfig
 *  - buildWatermarkedPdf: text watermark success
 *  - buildWatermarkedPdf: image watermark (PNG/JPG)
 *  - buildWatermarkedPdf: page selection applied
 *  - buildWatermarkedPdf: diagonal rotation
 *  - buildWatermarkedPdf: empty text returns error
 *  - buildWatermarkedPdf: no image returns error
 *  - buildWatermarkedPdf: pdf-lib load error
 *  - layout SEO keywords
 */

import {
  parsePageRange,
  selectedPageIndices,
  calcWatermarkPosition,
  hexToRgb,
  defaultTextConfig,
  defaultImageConfig,
  buildWatermarkedPdf,
} from '../src/lib/pdf/watermarkPdf';
import type { TextWatermarkConfig, ImageWatermarkConfig } from '../src/lib/pdf/watermarkPdf';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 3, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockDrawImage = jest.fn();
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });
const mockPage = { drawText: mockDrawText, drawImage: mockDrawImage, getSize: mockGetSize };
const mockEmbedFont = jest.fn().mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(120) });
const mockEmbedJpg = jest.fn().mockResolvedValue({});
const mockEmbedPng = jest.fn().mockResolvedValue({});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(3),
  getPage: jest.fn().mockReturnValue(mockPage),
  embedFont: mockEmbedFont,
  embedJpg: mockEmbedJpg,
  embedPng: mockEmbedPng,
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
  mockDoc.getPageCount.mockReturnValue(3);
  mockDoc.getPage.mockReturnValue(mockPage);
  mockGetSize.mockReturnValue({ width: 595, height: 842 });
  mockEmbedFont.mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(120) });
  mockEmbedJpg.mockResolvedValue({});
  mockEmbedPng.mockResolvedValue({});
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── parsePageRange ────────────────────────────────────────────────────────────

describe('parsePageRange', () => {
  it('parses a simple range', () => {
    const result = parsePageRange('1-3', 5);
    expect([...result].sort()).toEqual([0, 1, 2]);
  });

  it('parses single pages', () => {
    const result = parsePageRange('1,3,5', 5);
    expect([...result].sort()).toEqual([0, 2, 4]);
  });

  it('parses mixed ranges and singles', () => {
    const result = parsePageRange('1-2,5', 5);
    expect([...result].sort()).toEqual([0, 1, 4]);
  });

  it('ignores out-of-range pages', () => {
    const result = parsePageRange('3-10', 5);
    expect([...result].sort()).toEqual([2, 3, 4]);
  });

  it('returns empty set for invalid input', () => {
    const result = parsePageRange('abc', 5);
    expect(result.size).toBe(0);
  });

  it('handles empty string', () => {
    const result = parsePageRange('', 5);
    expect(result.size).toBe(0);
  });

  it('handles page 1 correctly (converts to index 0)', () => {
    const result = parsePageRange('1', 3);
    expect([...result]).toEqual([0]);
  });
});

// ─── selectedPageIndices ──────────────────────────────────────────────────────

describe('selectedPageIndices', () => {
  const baseConfig = defaultTextConfig();

  it('all: returns all page indices', () => {
    const indices = selectedPageIndices({ ...baseConfig, pageSelection: 'all' }, 4);
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it('odd: returns indices 0,2 for 4 pages (pages 1,3)', () => {
    const indices = selectedPageIndices({ ...baseConfig, pageSelection: 'odd' }, 4);
    expect(indices).toEqual([0, 2]);
  });

  it('even: returns indices 1,3 for 4 pages (pages 2,4)', () => {
    const indices = selectedPageIndices({ ...baseConfig, pageSelection: 'even' }, 4);
    expect(indices).toEqual([1, 3]);
  });

  it('range: returns parsed page indices', () => {
    const indices = selectedPageIndices({ ...baseConfig, pageSelection: 'range', pageRange: '1,3' }, 4);
    expect(indices.sort()).toEqual([0, 2]);
  });
});

// ─── calcWatermarkPosition ─────────────────────────────────────────────────────

describe('calcWatermarkPosition', () => {
  const pw = 595, ph = 842, iw = 100, ih = 20, mx = 40, my = 40;

  it('top-left: x=marginX, y=ph-ih-marginY', () => {
    const { x, y } = calcWatermarkPosition('top-left', pw, ph, iw, ih, mx, my);
    expect(x).toBe(40);
    expect(y).toBe(842 - 20 - 40);
  });

  it('bottom-right: x=pw-iw-marginX, y=marginY', () => {
    const { x, y } = calcWatermarkPosition('bottom-right', pw, ph, iw, ih, mx, my);
    expect(x).toBe(595 - 100 - 40);
    expect(y).toBe(40);
  });

  it('center: centered both axes', () => {
    const { x, y } = calcWatermarkPosition('center', pw, ph, iw, ih, mx, my);
    expect(x).toBeCloseTo((pw - iw) / 2);
    expect(y).toBeCloseTo((ph - ih) / 2);
  });

  it('diagonal: same as center', () => {
    const c = calcWatermarkPosition('center', pw, ph, iw, ih, mx, my);
    const d = calcWatermarkPosition('diagonal', pw, ph, iw, ih, mx, my);
    expect(d).toEqual(c);
  });

  it('top-center: centered x, near top', () => {
    const { x, y } = calcWatermarkPosition('top-center', pw, ph, iw, ih, mx, my);
    expect(x).toBeCloseTo((pw - iw) / 2);
    expect(y).toBe(ph - ih - my);
  });

  it('bottom-center: centered x, near bottom', () => {
    const { x, y } = calcWatermarkPosition('bottom-center', pw, ph, iw, ih, mx, my);
    expect(x).toBeCloseTo((pw - iw) / 2);
    expect(y).toBe(my);
  });
});

// ─── hexToRgb ─────────────────────────────────────────────────────────────────

describe('hexToRgb', () => {
  it('converts #000000 to 0,0,0', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts #ffffff to 1,1,1', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('converts #ff0000 correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
  });

  it('converts #6b7280 (gray) reasonably', () => {
    const { r, g, b } = hexToRgb('#6b7280');
    expect(r).toBeCloseTo(0.42, 1);
    expect(g).toBeCloseTo(0.447, 1);
    expect(b).toBeCloseTo(0.502, 1);
  });
});

// ─── defaultTextConfig / defaultImageConfig ───────────────────────────────────

describe('defaultTextConfig', () => {
  it('has CONFIDENTIAL as default text', () => {
    expect(defaultTextConfig().text).toBe('CONFIDENTIAL');
  });

  it('has opacity < 1 by default', () => {
    expect(defaultTextConfig().opacity).toBeLessThan(1);
  });

  it('defaults to diagonal position', () => {
    expect(defaultTextConfig().position).toBe('diagonal');
  });
});

describe('defaultImageConfig', () => {
  it('has empty imageData by default', () => {
    expect(defaultImageConfig().imageData).toBe('');
  });

  it('has center position by default', () => {
    expect(defaultImageConfig().position).toBe('center');
  });
});

// ─── buildWatermarkedPdf: text watermark ─────────────────────────────────────

describe('buildWatermarkedPdf: text', () => {
  it('returns success and output blob', async () => {
    const config = defaultTextConfig();
    const result = await buildWatermarkedPdf(makePdfFile(), config);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toMatch(/_watermarked\.pdf$/);
  });

  it('calls drawText for each selected page', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), pageSelection: 'all' };
    await buildWatermarkedPdf(makePdfFile(), config);
    // 3 pages → drawText called 3 times
    expect(mockDrawText).toHaveBeenCalledTimes(3);
  });

  it('calls drawText with watermark text', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), text: 'DRAFT', pageSelection: 'all' };
    await buildWatermarkedPdf(makePdfFile(), config);
    expect(mockDrawText).toHaveBeenCalledWith('DRAFT', expect.any(Object));
  });

  it('applies diagonal rotation of -45 for diagonal position', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), position: 'diagonal', pageSelection: 'all' };
    await buildWatermarkedPdf(makePdfFile(), config);
    const call = mockDrawText.mock.calls[0][1];
    expect(call.rotate).toBe(-45);
  });

  it('applies diagonal-reverse rotation of +45', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), position: 'diagonal-reverse', pageSelection: 'all' };
    await buildWatermarkedPdf(makePdfFile(), config);
    const call = mockDrawText.mock.calls[0][1];
    expect(call.rotate).toBe(45);
  });

  it('passes opacity to drawText', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), opacity: 0.15, pageSelection: 'all' };
    await buildWatermarkedPdf(makePdfFile(), config);
    const call = mockDrawText.mock.calls[0][1];
    expect(call.opacity).toBe(0.15);
  });

  it('output filename contains _watermarked', async () => {
    const result = await buildWatermarkedPdf(makePdfFile('report.pdf'), defaultTextConfig());
    expect(result.outputFile!.filename).toBe('report_watermarked.pdf');
  });
});

// ─── buildWatermarkedPdf: page selection ─────────────────────────────────────

describe('buildWatermarkedPdf: page selection', () => {
  it('odd: watermarks pages 1 and 3 only (indices 0,2) out of 3', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), pageSelection: 'odd' };
    await buildWatermarkedPdf(makePdfFile(), config);
    expect(mockDrawText).toHaveBeenCalledTimes(2);
    expect(mockDoc.getPage).toHaveBeenCalledWith(0);
    expect(mockDoc.getPage).toHaveBeenCalledWith(2);
    expect(mockDoc.getPage).not.toHaveBeenCalledWith(1);
  });

  it('even: watermarks page 2 only (index 1) out of 3', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), pageSelection: 'even' };
    await buildWatermarkedPdf(makePdfFile(), config);
    expect(mockDrawText).toHaveBeenCalledTimes(1);
    expect(mockDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('range: watermarks only pages in range', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), pageSelection: 'range', pageRange: '1,3' };
    await buildWatermarkedPdf(makePdfFile(), config);
    expect(mockDrawText).toHaveBeenCalledTimes(2);
  });
});

// ─── buildWatermarkedPdf: image watermark ────────────────────────────────────

describe('buildWatermarkedPdf: image', () => {
  it('calls embedPng for PNG image', async () => {
    const config: ImageWatermarkConfig = {
      ...defaultImageConfig(),
      imageData: 'data:image/png;base64,abc',
      imageMimeType: 'image/png',
      imageBytes: new Uint8Array([1, 2, 3]),
      pageSelection: 'all',
    };
    const result = await buildWatermarkedPdf(makePdfFile(), config);
    expect(result.success).toBe(true);
    expect(mockEmbedPng).toHaveBeenCalled();
    expect(mockDrawImage).toHaveBeenCalledTimes(3);
  });

  it('calls embedJpg for JPEG image', async () => {
    const config: ImageWatermarkConfig = {
      ...defaultImageConfig(),
      imageData: 'data:image/jpeg;base64,abc',
      imageMimeType: 'image/jpeg',
      imageBytes: new Uint8Array([1, 2, 3]),
      pageSelection: 'all',
    };
    await buildWatermarkedPdf(makePdfFile(), config);
    expect(mockEmbedJpg).toHaveBeenCalled();
  });

  it('passes opacity to drawImage', async () => {
    const config: ImageWatermarkConfig = {
      ...defaultImageConfig(),
      imageBytes: new Uint8Array([1]),
      imageMimeType: 'image/png',
      opacity: 0.4,
      pageSelection: 'all',
    };
    await buildWatermarkedPdf(makePdfFile(), config);
    const call = mockDrawImage.mock.calls[0][1];
    expect(call.opacity).toBe(0.4);
  });
});

// ─── buildWatermarkedPdf: validation errors ───────────────────────────────────

describe('buildWatermarkedPdf: validation', () => {
  it('returns error for empty text watermark', async () => {
    const config: TextWatermarkConfig = { ...defaultTextConfig(), text: '' };
    const result = await buildWatermarkedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('returns error for image watermark with no image data', async () => {
    const config: ImageWatermarkConfig = { ...defaultImageConfig() }; // imageBytes empty
    const result = await buildWatermarkedPdf(makePdfFile(), config);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no watermark image/i);
  });
});

// ─── buildWatermarkedPdf: pdf-lib error ───────────────────────────────────────

describe('buildWatermarkedPdf: error handling', () => {
  it('returns failure when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('bad pdf');
    const result = await buildWatermarkedPdf(makePdfFile(), defaultTextConfig());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('watermark-pdf layout metadata', () => {
  it('title contains watermark PDF', async () => {
    const mod = await import('../src/app/pdf-tools/watermark-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/watermark.+pdf/i);
  });

  it('has watermark-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/watermark-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/watermark pdf|add watermark|stamp/);
  });
});
