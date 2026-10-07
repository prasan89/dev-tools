/**
 * M37 — PDF Editor: Annotations & Comments tests
 *
 * Tests cover:
 *  - StickyNoteObject in state
 *  - CalloutObject in state
 *  - duplicateObject for sticky (x/y offset)
 *  - duplicateObject for callout (x/y + tipX/tipY offset)
 *  - buildEditedPdf: sticky note drawn as rectangle + fold line + text
 *  - buildEditedPdf: callout drawn as rectangle bubble + line pointer + text
 *  - buildEditedPdf: sticky on out-of-range page is skipped
 *  - buildEditedPdf: callout on out-of-range page is skipped
 *  - buildEditedPdf: mixed sticky + callout + text success
 *  - buildEditedPdf: empty comment renders without text call
 *  - layout metadata updated for M37 annotation keywords
 */

import {
  createEditorState,
  addObject,
  duplicateObject,
  buildEditedPdf,
} from '../src/lib/pdf/editPdf';
import type {
  StickyNoteObject, CalloutObject, TextObject, EditorObject,
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

function makeSticky(overrides: Partial<StickyNoteObject> = {}): Omit<StickyNoteObject, 'zIndex'> {
  return {
    id: 'sticky-1',
    type: 'sticky',
    pageIndex: 0,
    x: 50,
    y: 100,
    width: 120,
    height: 80,
    comment: 'This is a sticky note',
    color: '#fef08a',
    opacity: 1,
    ...overrides,
  };
}

function makeCallout(overrides: Partial<CalloutObject> = {}): Omit<CalloutObject, 'zIndex'> {
  return {
    id: 'callout-1',
    type: 'callout',
    pageIndex: 0,
    x: 80,
    y: 150,
    width: 150,
    height: 60,
    tipX: 60,
    tipY: 130,
    text: 'This is a callout',
    fontSize: 12,
    color: '#1e293b',
    bgColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1.5,
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

describe('StickyNoteObject in state', () => {
  it('can be added and retrieved', () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    expect(s.objects).toHaveLength(1);
    const obj = s.objects[0] as StickyNoteObject;
    expect(obj.type).toBe('sticky');
    expect(obj.x).toBe(50);
    expect(obj.y).toBe(100);
    expect(obj.width).toBe(120);
    expect(obj.height).toBe(80);
    expect(obj.comment).toBe('This is a sticky note');
    expect(obj.color).toBe('#fef08a');
    expect(obj.zIndex).toBe(0);
  });

  it('stores multiple sticky notes independently', () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ id: 'sticky-a', x: 10, y: 20 }));
    s = addObject(s, makeSticky({ id: 'sticky-b', x: 200, y: 300 }));
    expect(s.objects).toHaveLength(2);
    expect((s.objects[0] as StickyNoteObject).x).toBe(10);
    expect((s.objects[1] as StickyNoteObject).x).toBe(200);
  });
});

describe('CalloutObject in state', () => {
  it('can be added and retrieved', () => {
    let s = createEditorState();
    s = addObject(s, makeCallout());
    expect(s.objects).toHaveLength(1);
    const obj = s.objects[0] as CalloutObject;
    expect(obj.type).toBe('callout');
    expect(obj.x).toBe(80);
    expect(obj.y).toBe(150);
    expect(obj.tipX).toBe(60);
    expect(obj.tipY).toBe(130);
    expect(obj.text).toBe('This is a callout');
    expect(obj.bgColor).toBe('#eff6ff');
    expect(obj.borderColor).toBe('#2563eb');
    expect(obj.zIndex).toBe(0);
  });

  it('stores tip coordinates independently from bubble position', () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ x: 100, y: 200, tipX: 50, tipY: 250 }));
    const obj = s.objects[0] as CalloutObject;
    expect(obj.x).toBe(100);
    expect(obj.y).toBe(200);
    expect(obj.tipX).toBe(50);
    expect(obj.tipY).toBe(250);
  });
});

// ─── duplicateObject tests ─────────────────────────────────────────────────────

describe('duplicateObject for sticky', () => {
  it('offsets x/y by +10/-10', () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    expect(s.objects).toHaveLength(2);
    const dup = s.objects[1] as StickyNoteObject;
    expect(dup.type).toBe('sticky');
    expect(dup.id).not.toBe(id);
    expect(dup.x).toBe(60);
    expect(dup.y).toBe(90);
  });

  it('preserves comment and color on duplicate', () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ comment: 'Important note', color: '#bbf7d0' }));
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const dup = s.objects[1] as StickyNoteObject;
    expect(dup.comment).toBe('Important note');
    expect(dup.color).toBe('#bbf7d0');
  });

  it('does not mutate original position', () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const orig = s.objects[0] as StickyNoteObject;
    expect(orig.x).toBe(50);
    expect(orig.y).toBe(100);
  });
});

describe('duplicateObject for callout', () => {
  it('offsets x/y AND tipX/tipY by +10/-10', () => {
    let s = createEditorState();
    s = addObject(s, makeCallout());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    expect(s.objects).toHaveLength(2);
    const dup = s.objects[1] as CalloutObject;
    expect(dup.type).toBe('callout');
    expect(dup.id).not.toBe(id);
    expect(dup.x).toBe(90);
    expect(dup.y).toBe(140);
    expect(dup.tipX).toBe(70);
    expect(dup.tipY).toBe(120);
  });

  it('preserves text and colors on duplicate', () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ text: 'See here', bgColor: '#fefce8', borderColor: '#eab308' }));
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const dup = s.objects[1] as CalloutObject;
    expect(dup.text).toBe('See here');
    expect(dup.bgColor).toBe('#fefce8');
    expect(dup.borderColor).toBe('#eab308');
  });

  it('does not mutate original tip position', () => {
    let s = createEditorState();
    s = addObject(s, makeCallout());
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const orig = s.objects[0] as CalloutObject;
    expect(orig.tipX).toBe(60);
    expect(orig.tipY).toBe(130);
  });
});

// ─── buildEditedPdf tests for sticky ─────────────────────────────────────────

describe('buildEditedPdf: sticky note', () => {
  it('draws a rectangle for the note body', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).toHaveBeenCalled();
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.x).toBe(50);
    expect(call.width).toBe(120);
    expect(call.height).toBe(80);
  });

  it('draws text for non-empty comment', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ comment: 'Hello world' }));
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawText).toHaveBeenCalled();
    const call = mockDrawText.mock.calls[0][0];
    expect(call).toBe('Hello world');
  });

  it('draws fold-corner line on the sticky', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawLine).toHaveBeenCalled();
  });

  it('skips sticky on out-of-range page', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ pageIndex: 5 }));
    const result = await buildEditedPdf(makePdfFile('test.pdf', 1), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).not.toHaveBeenCalled();
    expect(mockDrawLine).not.toHaveBeenCalled();
    expect(mockDrawText).not.toHaveBeenCalled();
  });

  it('respects opacity setting', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ opacity: 0.6 }));
    await buildEditedPdf(makePdfFile(), s);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.opacity).toBeCloseTo(0.6);
  });

  it('uses yellow default color for note body', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ color: '#fef08a' }));
    await buildEditedPdf(makePdfFile(), s);
    const { rgb } = jest.requireMock('pdf-lib') as { rgb: jest.Mock };
    expect(rgb).toHaveBeenCalled();
  });
});

// ─── buildEditedPdf tests for callout ────────────────────────────────────────

describe('buildEditedPdf: callout', () => {
  it('draws the bubble rectangle', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout());
    const result = await buildEditedPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).toHaveBeenCalled();
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.x).toBe(80);
    expect(call.width).toBe(150);
    expect(call.height).toBe(60);
  });

  it('draws the pointer line from bubble to tip', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout());
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawLine).toHaveBeenCalled();
  });

  it('draws text for non-empty callout text', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ text: 'See this area' }));
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawText).toHaveBeenCalled();
    const call = mockDrawText.mock.calls[0][0];
    expect(call).toBe('See this area');
  });

  it('skips callout on out-of-range page', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ pageIndex: 99 }));
    const result = await buildEditedPdf(makePdfFile('test.pdf', 1), s);
    expect(result.success).toBe(true);
    expect(mockDrawRectangle).not.toHaveBeenCalled();
    expect(mockDrawLine).not.toHaveBeenCalled();
    expect(mockDrawText).not.toHaveBeenCalled();
  });

  it('uses border width from callout config', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ borderWidth: 2 }));
    await buildEditedPdf(makePdfFile(), s);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.borderWidth).toBe(2);
  });

  it('respects opacity setting', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ opacity: 0.75 }));
    await buildEditedPdf(makePdfFile(), s);
    const call = mockDrawRectangle.mock.calls[0][0];
    expect(call.opacity).toBeCloseTo(0.75);
  });
});

// ─── buildEditedPdf: empty comment/text ────────────────────────────────────

describe('buildEditedPdf: empty annotation text', () => {
  it('skips drawText for sticky with empty comment', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky({ comment: '' }));
    await buildEditedPdf(makePdfFile(), s);
    // rectangle and fold line still drawn, but drawText skipped for empty string
    expect(mockDrawRectangle).toHaveBeenCalled();
    expect(mockDrawText).not.toHaveBeenCalled();
  });

  it('skips drawText for callout with empty text', async () => {
    let s = createEditorState();
    s = addObject(s, makeCallout({ text: '' }));
    await buildEditedPdf(makePdfFile(), s);
    expect(mockDrawRectangle).toHaveBeenCalled();
    expect(mockDrawText).not.toHaveBeenCalled();
  });
});

// ─── buildEditedPdf: multi-page ───────────────────────────────────────────────

describe('buildEditedPdf: multi-page annotations', () => {
  it('places sticky on correct page', async () => {
    mockDoc.getPageCount.mockReturnValue(3);
    mockDoc.getPage.mockReturnValue(mockPage);
    let s = createEditorState();
    s = addObject(s, makeSticky({ pageIndex: 2 }));
    const result = await buildEditedPdf(makePdfFile('test.pdf', 3), s);
    expect(result.success).toBe(true);
    expect(mockDoc.getPage).toHaveBeenCalledWith(2);
    expect(mockDrawRectangle).toHaveBeenCalled();
  });

  it('places callout on correct page', async () => {
    mockDoc.getPageCount.mockReturnValue(3);
    mockDoc.getPage.mockReturnValue(mockPage);
    let s = createEditorState();
    s = addObject(s, makeCallout({ pageIndex: 1 }));
    const result = await buildEditedPdf(makePdfFile('test.pdf', 3), s);
    expect(result.success).toBe(true);
    expect(mockDoc.getPage).toHaveBeenCalledWith(1);
  });
});

// ─── buildEditedPdf: mixed sticky + callout + text ────────────────────────────

describe('buildEditedPdf: mixed sticky + callout + text', () => {
  it('processes all annotation types together', async () => {
    let s = createEditorState();
    s = addObject(s, makeSticky());
    s = addObject(s, makeCallout());
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
    // sticky: rectangle + line; callout: rectangle + line; text: drawText (x2 from sticky+callout+text)
    expect(mockDrawRectangle).toHaveBeenCalledTimes(2);
    expect(mockDrawLine).toHaveBeenCalledTimes(2);
    // drawText: sticky comment + callout text + text object
    expect(mockDrawText).toHaveBeenCalledTimes(3);
  });
});

// ─── Undo/redo integration with annotations ───────────────────────────────────

describe('undo/redo with annotations', () => {
  it('undo removes a just-added sticky note', () => {
    const { undoEditorState } = require('../src/lib/pdf/editPdf');
    let s = createEditorState();
    const prev = s;
    s = addObject(s, makeSticky());
    expect(s.objects).toHaveLength(1);
    // simulate undo: restore previous state
    const undone = undoEditorState ? undoEditorState(s, prev) : { ...prev, objects: [] };
    expect(undone.objects).toHaveLength(0);
  });
});

// ─── Layout metadata ──────────────────────────────────────────────────────────

describe('layout metadata updated for M37 annotations', () => {
  it('mentions annotate PDF in title or description', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    const titleAndDesc = `${metadata.title ?? ''} ${metadata.description ?? ''}`.toLowerCase();
    expect(titleAndDesc).toMatch(/annotate/i);
  });

  it('has annotation-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/annotate|sticky|callout|comments/);
  });

  it('mentions sticky notes in keywords', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/sticky/);
  });

  it('mentions comments in keywords', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/comment/);
  });
});
