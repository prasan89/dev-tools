/**
 * M35–M36 — PDF Editor: Freehand Drawing + Whiteout tests
 *
 * Tests cover:
 *  - StrokeObject in state
 *  - WhiteoutObject in state
 *  - duplicateObject for stroke (all points offset)
 *  - duplicateObject for whiteout (x/y offset)
 *  - buildEditedPdf: stroke object drawn as line segments
 *  - buildEditedPdf: stroke with single point is skipped
 *  - buildEditedPdf: whiteout object drawn as rectangle
 *  - buildEditedPdf: mixed stroke+whiteout+text success
 *  - buildEditedPdf: stroke on out-of-range page is skipped
 *  - layout metadata updated for M35/M36 keywords
 */

import {
  createEditorState,
  addObject,
  duplicateObject,
  buildEditedPdf,
} from '../src/lib/pdf/editPdf';
import type {
  StrokeObject, WhiteoutObject, TextObject, EditorObject,
} from '../src/lib/pdf/editPdf';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'test.pdf', pageCount = 1): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount,
    objectUrl: 'blob:test',
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: 0,
  };
}

function makeStroke(overrides: Partial<StrokeObject> = {}): Omit<StrokeObject, 'zIndex'> {
  return {
    id: 'stroke-1',
    type: 'stroke',
    pageIndex: 0,
    points: [{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 60 }],
    color: '#e11d48',
    width: 3,
    opacity: 1,
    ...overrides,
  };
}

function makeWhiteout(overrides: Partial<WhiteoutObject> = {}): Omit<WhiteoutObject, 'zIndex'> {
  return {
    id: 'whiteout-1',
    type: 'whiteout',
    pageIndex: 0,
    x: 100,
    y: 200,
    width: 150,
    height: 50,
    fillColor: '#ffffff',
    fillOpacity: 1,
    borderColor: '#cccccc',
    borderWidth: 0,
    opacity: 1,
    ...overrides,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawLine = jest.fn();
const mockDrawRectangle = jest.fn();
const mockDrawText = jest.fn();
const mockDrawImage = jest.fn();
const mockDrawEllipse = jest.fn();
const mockEmbedFont = jest.fn().mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(50) });
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });

const mockPage = {
  drawLine: mockDrawLine,
  drawRectangle: mockDrawRectangle,
  drawText: mockDrawText,
  drawImage: mockDrawImage,
  drawEllipse: mockDrawEllipse,
  getSize: mockGetSize,
};

const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(1),
  getPage: jest.fn().mockReturnValue(mockPage),
  embedFont: mockEmbedFont,
  embedJpg: jest.fn().mockResolvedValue({}),
  embedPng: jest.fn().mockResolvedValue({}),
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
    degrees: jest.fn().mockReturnValue(0),
    StandardFonts: {
      Helvetica: 'Helvetica',
      HelveticaBold: 'HelveticaBold',
      HelveticaOblique: 'HelveticaOblique',
      HelveticaBoldOblique: 'HelveticaBoldOblique',
      Courier: 'Courier',
      CourierBold: 'CourierBold',
      CourierOblique: 'CourierOblique',
      CourierBoldOblique: 'CourierBoldOblique',
      TimesRoman: 'TimesRoman',
      TimesRomanBold: 'TimesRomanBold',
      TimesRomanItalic: 'TimesRomanItalic',
      TimesRomanBoldItalic: 'TimesRomanBoldItalic',
    },
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
  mockDoc.getPageCount.mockReturnValue(1);
  mockDoc.getPage.mockReturnValue(mockPage);
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── State tests ───────────────────────────────────────────────────────────────

describe('StrokeObject in state', () => {
  it('can be added and retrieved', () => {
    let s = createEditorState();
    s = addObject(s, makeStroke());
    expect(s.objects).toHaveLength(1);
    const obj = s.objects[0] as StrokeObject;
    expect(obj.type).toBe('stroke');
    expect(obj.points).toHaveLength(3);
    expect(obj.color).toBe('#e11d48');
    expect(obj.width).toBe(3);
    expect(obj.zIndex).toBe(0);
  });
});

describe('WhiteoutObject in state', () => {
  it('can be added and retrieved', () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout());
    expect(s.objects).toHaveLength(1);
    const obj = s.objects[0] as WhiteoutObject;
    expect(obj.type).toBe('whiteout');
    expect(obj.x).toBe(100);
    expect(obj.y).toBe(200);
    expect(obj.fillColor).toBe('#ffffff');
    expect(obj.fillOpacity).toBe(1);
    expect(obj.zIndex).toBe(0);
  });
});

// ─── duplicateObject tests ─────────────────────────────────────────────────────

describe('duplicateObject for stroke', () => {
  it('offsets all points by +10/-10', () => {
    let s = createEditorState();
    s = addObject(s, makeStroke());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    expect(s.objects).toHaveLength(2);
    const dup = s.objects[1] as StrokeObject;
    expect(dup.type).toBe('stroke');
    expect(dup.id).not.toBe(id);
    expect(dup.points[0]).toEqual({ x: 20, y: 10 });
    expect(dup.points[1]).toEqual({ x: 40, y: 30 });
    expect(dup.points[2]).toEqual({ x: 60, y: 50 });
  });

  it('does not mutate original points', () => {
    let s = createEditorState();
    s = addObject(s, makeStroke());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const orig = s.objects[0] as StrokeObject;
    expect(orig.points[0]).toEqual({ x: 10, y: 20 });
  });
});

describe('duplicateObject for whiteout', () => {
  it('offsets x/y by +10/-10', () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    expect(s.objects).toHaveLength(2);
    const dup = s.objects[1] as WhiteoutObject;
    expect(dup.type).toBe('whiteout');
    expect(dup.id).not.toBe(id);
    expect(dup.x).toBe(110);
    expect(dup.y).toBe(190);
    expect(dup.fillColor).toBe('#ffffff');
  });
});

// ─── buildEditedPdf tests for stroke ─────────────────────────────────────────

describe('buildEditedPdf: stroke', () => {
  it('draws line segments for each consecutive point pair', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke());
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    // 3 points → 2 line segments
    expect(mockDrawLine).toHaveBeenCalledTimes(2);
    expect(mockDrawLine).toHaveBeenNthCalledWith(1, expect.objectContaining({
      start: { x: 10, y: 20 },
      end: { x: 30, y: 40 },
      thickness: 3,
    }));
    expect(mockDrawLine).toHaveBeenNthCalledWith(2, expect.objectContaining({
      start: { x: 30, y: 40 },
      end: { x: 50, y: 60 },
      thickness: 3,
    }));
  });

  it('skips stroke with only one point', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke({ points: [{ x: 10, y: 20 }] }));
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawLine).not.toHaveBeenCalled();
  });

  it('skips stroke with no points', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke({ points: [] }));
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawLine).not.toHaveBeenCalled();
  });

  it('skips stroke on out-of-range page', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke({ pageIndex: 5 }));
    const result = await buildEditedPdf(makePdfFile('test.pdf', 1), s);
    expect(result.success).toBe(true);
    expect(mockDrawLine).not.toHaveBeenCalled();
  });

  it('draws stroke with correct opacity', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke({ opacity: 0.5 }));
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawLine).toHaveBeenCalledWith(expect.objectContaining({ opacity: 0.5 }));
  });
});

// ─── buildEditedPdf tests for whiteout ───────────────────────────────────────

describe('buildEditedPdf: whiteout', () => {
  it('draws filled rectangle with fillColor and fillOpacity', async () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout());
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).toHaveBeenCalledWith(expect.objectContaining({
      x: 100,
      y: 200,
      width: 150,
      height: 50,
    }));
  });

  it('draws whiteout with combined opacity (fillOpacity * opacity)', async () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout({ fillOpacity: 0.8, opacity: 0.5 }));
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawRectangle).toHaveBeenCalledWith(expect.objectContaining({
      opacity: 0.8 * 0.5,
    }));
  });

  it('does not draw border when borderWidth is 0', async () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout({ borderWidth: 0 }));
    await buildEditedPdf(makePdfFile(), s);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.borderColor).toBeUndefined();
  });

  it('draws border when borderWidth > 0', async () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout({ borderWidth: 2, borderColor: '#000000' }));
    await buildEditedPdf(makePdfFile(), s);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.borderWidth).toBe(2);
    expect(call.borderColor).toBeDefined();
  });

  it('skips whiteout on out-of-range page', async () => {
    let s = createEditorState();
    s = addObject(s, makeWhiteout({ pageIndex: 99 }));
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).not.toHaveBeenCalled();
  });
});

// ─── Mixed M35+M36 test ───────────────────────────────────────────────────────

describe('buildEditedPdf: mixed stroke + whiteout + text', () => {
  it('processes all three object types together', async () => {
    let s = createEditorState();
    s = addObject(s, makeStroke());
    s = addObject(s, makeWhiteout());
    const textObj: Omit<TextObject, 'zIndex'> = {
      id: 'txt-1',
      type: 'text',
      pageIndex: 0,
      x: 10, y: 10, width: 100, height: 20,
      text: 'Hello',
      fontFamily: 'Helvetica',
      fontSize: 12,
      bold: false, italic: false, underline: false,
      color: '#000000',
      opacity: 1,
      align: 'left',
    };
    s = addObject(s, textObj as Omit<EditorObject, 'zIndex'>);
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    // Stroke: 2 line segments; text: drawText; whiteout: drawRectangle
    expect(mockDrawLine).toHaveBeenCalledTimes(2);
    expect(mockDrawRectangle).toHaveBeenCalledTimes(1);
    expect(mockDrawText).toHaveBeenCalledTimes(1);
  });
});

// ─── Layout metadata ──────────────────────────────────────────────────────────

describe('layout metadata updated for M35/M36', () => {
  it('mentions freehand drawing and whiteout in title', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/drawing|whiteout/i);
  });

  it('has draw/whiteout in keywords', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/draw|freehand|whiteout/);
  });
});
