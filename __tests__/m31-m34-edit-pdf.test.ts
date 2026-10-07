/**
 * M31–M34 — PDF Editor tests
 *
 * Tests cover:
 *  - createEditorState: empty state
 *  - addObject: adds to state, assigns zIndex
 *  - updateObject: modifies properties
 *  - removeObject: removes by id
 *  - bringForward: swaps with next z
 *  - sendBackward: swaps with prev z
 *  - bringToFront: raises above all
 *  - sendToBack: lowers below all
 *  - duplicateObject: clones with offset
 *  - duplicateObject for line/arrow (x1/y1/x2/y2 offset)
 *  - duplicateObject for ellipse (cx/cy offset)
 *  - screenToPdfPoint: coordinate conversion
 *  - pdfToScreenPoint: coordinate conversion
 *  - hexToRgb: color parsing
 *  - hexToRgb shorthand (#abc)
 *  - hexToRgb fallback on invalid
 *  - TextObject in state
 *  - ImageObject in state
 *  - RectObject in state
 *  - EllipseObject in state
 *  - LineObject in state
 *  - ArrowObject in state
 *  - AnnotationObject highlight
 *  - AnnotationObject underline
 *  - AnnotationObject strikethrough
 *  - buildEditedPdf: success case (text)
 *  - buildEditedPdf: success case (image)
 *  - buildEditedPdf: success case (rect)
 *  - buildEditedPdf: success case (ellipse)
 *  - buildEditedPdf: success case (line)
 *  - buildEditedPdf: success case (arrow)
 *  - buildEditedPdf: success case (highlight annotation)
 *  - buildEditedPdf: success case (underline annotation)
 *  - buildEditedPdf: success case (strikethrough annotation)
 *  - buildEditedPdf: AbortSignal cancelled
 *  - buildEditedPdf: encrypted PDF
 *  - buildEditedPdf: out-of-page objects are skipped
 *  - buildEditedPdf: empty state returns blob
 *  - buildEditedPdf: filename is basename-edited.pdf
 *  - buildEditedPdf: pageCount matches
 *  - Page exports default function
 *  - Layout exports metadata with correct title
 *  - Sitemap includes /pdf-tools/edit-pdf
 *  - Hub page lists Edit PDF as available
 */

import {
  createEditorState,
  addObject,
  updateObject,
  removeObject,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  duplicateObject,
  screenToPdfPoint,
  pdfToScreenPoint,
  hexToRgb,
  buildEditedPdf,
} from '../src/lib/pdf/editPdf';
import type {
  TextObject, ImageObject, RectObject, EllipseObject,
  LineObject, ArrowObject, AnnotationObject, EditorObject,
} from '../src/lib/pdf/editPdf';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'test.pdf', pageCount = 3): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

function makeText(pageIndex = 0): Omit<TextObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    pageIndex,
    x: 50, y: 700, width: 200, height: 30,
    text: 'Hello World',
    fontFamily: 'Helvetica',
    fontSize: 14,
    bold: false, italic: false, underline: false,
    color: '#000000', opacity: 1, align: 'left',
  };
}

function makeImage(pageIndex = 0): Omit<ImageObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    pageIndex,
    x: 100, y: 500, width: 200, height: 150,
    naturalWidth: 400, naturalHeight: 300,
    rotation: 0,
    objectUrl: 'blob:test',
    mimeType: 'image/png',
    embedBytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    opacity: 1,
  };
}

function makeRect(pageIndex = 0): Omit<RectObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'rect',
    pageIndex,
    x: 50, y: 600, width: 150, height: 100,
    rotation: 0,
    borderColor: '#ff0000', fillColor: '#ffff00',
    fillOpacity: 0.5, borderWidth: 2, borderOpacity: 1, opacity: 1,
  };
}

function makeEllipse(pageIndex = 0): Omit<EllipseObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'ellipse',
    pageIndex,
    cx: 200, cy: 400, rx: 80, ry: 60,
    borderColor: '#0000ff', fillColor: '#aaffaa',
    fillOpacity: 0, borderWidth: 2, borderOpacity: 1, opacity: 1,
  };
}

function makeLine(pageIndex = 0): Omit<LineObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'line',
    pageIndex,
    x1: 50, y1: 300, x2: 250, y2: 300,
    color: '#333333', width: 2, opacity: 1,
  };
}

function makeArrow(pageIndex = 0): Omit<ArrowObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type: 'arrow',
    pageIndex,
    x1: 50, y1: 200, x2: 300, y2: 200,
    color: '#0000ff', width: 2, opacity: 1, arrowhead: 'filled',
  };
}

function makeAnnotation(type: 'highlight' | 'underline' | 'strikethrough', pageIndex = 0): Omit<AnnotationObject, 'zIndex'> {
  return {
    id: crypto.randomUUID(),
    type,
    pageIndex,
    x: 50, y: 500, width: 200, height: 20,
    color: type === 'highlight' ? '#ffff00' : '#ff0000',
    opacity: type === 'highlight' ? 0.4 : 1,
    lineWidth: 2,
  };
}

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────

const mockPage = {
  getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
  drawText: jest.fn(),
  drawImage: jest.fn(),
  drawRectangle: jest.fn(),
  drawEllipse: jest.fn(),
  drawLine: jest.fn(),
};

const mockDoc = {
  getPageCount: jest.fn().mockReturnValue(3),
  getPage: jest.fn().mockReturnValue(mockPage),
  embedFont: jest.fn().mockResolvedValue({
    widthOfTextAtSize: jest.fn().mockReturnValue(50),
  }),
  embedJpg: jest.fn().mockResolvedValue({}),
  embedPng: jest.fn().mockResolvedValue({}),
  save: jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])),
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
    create: jest.fn().mockResolvedValue(mockDoc),
  };
  const rgb = jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 });
  const degrees = jest.fn().mockReturnValue({ angle: 0 });
  const StandardFonts = {
    Helvetica: 'Helvetica', HelveticaBold: 'Helvetica-Bold', HelveticaOblique: 'Helvetica-Oblique', HelveticaBoldOblique: 'Helvetica-BoldOblique',
    Courier: 'Courier', CourierBold: 'Courier-Bold', CourierOblique: 'Courier-Oblique', CourierBoldOblique: 'Courier-BoldOblique',
    TimesRoman: 'Times-Roman', TimesRomanBold: 'Times-Bold', TimesRomanItalic: 'Times-Italic', TimesRomanBoldItalic: 'Times-BoldItalic',
  };
  return {
    PDFDocument,
    rgb,
    degrees,
    grayscale: jest.fn(),
    StandardFonts,
    __throwOnLoad: (msg: string) => { _throw = msg; PDFDocument.load = jest.fn().mockRejectedValue(new Error(msg)); },
    __resetLoad: () => { _throw = null; PDFDocument.load = jest.fn().mockImplementation(async () => { if (_throw) throw new Error(_throw); return mockDoc; }); },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  const m = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  m.__resetLoad();
  mockDoc.getPageCount.mockReturnValue(3);
  mockPage.getSize.mockReturnValue({ width: 595, height: 842 });
});

// ─── createEditorState ────────────────────────────────────────────────────────

describe('createEditorState', () => {
  it('creates empty state', () => {
    const s = createEditorState();
    expect(s.objects).toHaveLength(0);
    expect(s.nextZIndex).toBe(0);
  });
});

// ─── addObject ────────────────────────────────────────────────────────────────

describe('addObject', () => {
  it('adds object with zIndex', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    expect(s.objects).toHaveLength(1);
    expect(s.objects[0].zIndex).toBe(0);
    expect(s.nextZIndex).toBe(1);
  });

  it('increments zIndex for each object', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    s = addObject(s, makeRect());
    expect(s.objects[0].zIndex).toBe(0);
    expect(s.objects[1].zIndex).toBe(1);
  });
});

// ─── updateObject ─────────────────────────────────────────────────────────────

describe('updateObject', () => {
  it('updates matching object', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    const id = s.objects[0].id;
    s = updateObject(s, id, { x: 99 });
    expect((s.objects[0] as TextObject).x).toBe(99);
  });

  it('leaves other objects untouched', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    s = addObject(s, makeRect());
    const id0 = s.objects[0].id;
    s = updateObject(s, id0, { x: 999 });
    expect((s.objects[1] as RectObject).x).toBe(50);
  });
});

// ─── removeObject ─────────────────────────────────────────────────────────────

describe('removeObject', () => {
  it('removes by id', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    const id = s.objects[0].id;
    s = removeObject(s, id);
    expect(s.objects).toHaveLength(0);
  });

  it('noop for unknown id', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    s = removeObject(s, 'nonexistent');
    expect(s.objects).toHaveLength(1);
  });
});

// ─── bringForward / sendBackward ──────────────────────────────────────────────

describe('bringForward', () => {
  it('swaps z with next object on same page', () => {
    let s = createEditorState();
    s = addObject(s, makeText()); // z=0
    s = addObject(s, makeText()); // z=1
    const id0 = s.objects[0].id;
    s = bringForward(s, id0);
    expect(s.objects.find((o) => o.id === id0)?.zIndex).toBe(1);
  });
});

describe('sendBackward', () => {
  it('swaps z with prev object on same page', () => {
    let s = createEditorState();
    s = addObject(s, makeText()); // z=0
    s = addObject(s, makeText()); // z=1
    const id1 = s.objects[1].id;
    s = sendBackward(s, id1);
    expect(s.objects.find((o) => o.id === id1)?.zIndex).toBe(0);
  });
});

describe('bringToFront', () => {
  it('raises z above all on page', () => {
    let s = createEditorState();
    s = addObject(s, makeText()); // z=0
    s = addObject(s, makeText()); // z=1
    s = addObject(s, makeText()); // z=2
    const id0 = s.objects[0].id;
    s = bringToFront(s, id0);
    expect(s.objects.find((o) => o.id === id0)?.zIndex).toBe(3); // nextZIndex at time of call
  });
});

describe('sendToBack', () => {
  it('lowers z below all on page', () => {
    let s = createEditorState();
    s = addObject(s, makeText()); // z=0
    s = addObject(s, makeText()); // z=1
    const id1 = s.objects[1].id;
    s = sendToBack(s, id1);
    expect(s.objects.find((o) => o.id === id1)?.zIndex).toBe(-1);
  });
});

// ─── duplicateObject ──────────────────────────────────────────────────────────

describe('duplicateObject', () => {
  it('clones text with offset', () => {
    let s = createEditorState();
    const orig = makeText();
    s = addObject(s, orig);
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    expect(s.objects).toHaveLength(2);
    const dup = s.objects[1] as TextObject;
    expect(dup.x).toBe(orig.x + 10);
    expect(dup.y).toBe(orig.y - 10);
    expect(dup.id).not.toBe(id);
  });

  it('clones line with x1/y1/x2/y2 offset', () => {
    let s = createEditorState();
    const orig = makeLine();
    s = addObject(s, orig);
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const dup = s.objects[1] as LineObject;
    expect(dup.x1).toBe(orig.x1 + 10);
    expect(dup.y2).toBe(orig.y2 - 10);
  });

  it('clones ellipse with cx/cy offset', () => {
    let s = createEditorState();
    const orig = makeEllipse();
    s = addObject(s, orig);
    const id = s.objects[0].id;
    s = duplicateObject(s, id);
    const dup = s.objects[1] as EllipseObject;
    expect(dup.cx).toBe(orig.cx + 10);
    expect(dup.cy).toBe(orig.cy - 10);
  });
});

// ─── Coordinate conversions ────────────────────────────────────────────────────

describe('screenToPdfPoint', () => {
  it('converts correctly', () => {
    const result = screenToPdfPoint(100, 200, 1, 842);
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(642);
  });

  it('accounts for scale', () => {
    const result = screenToPdfPoint(100, 200, 2, 842);
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(742);
  });
});

describe('pdfToScreenPoint', () => {
  it('converts correctly', () => {
    const result = pdfToScreenPoint(100, 642, 1, 842);
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(200);
  });
});

// ─── hexToRgb ─────────────────────────────────────────────────────────────────

describe('hexToRgb', () => {
  it('converts 6-digit hex', () => {
    const { r, g, b } = hexToRgb('#ff8000');
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(0.502, 1);
    expect(b).toBeCloseTo(0);
  });

  it('converts 3-digit hex', () => {
    const { r, g, b } = hexToRgb('#f80');
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(0.533, 1);
    expect(b).toBe(0);
  });

  it('falls back for invalid input', () => {
    const { r, g, b } = hexToRgb('invalid');
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('handles black', () => {
    const { r, g, b } = hexToRgb('#000000');
    expect(r).toBe(0); expect(g).toBe(0); expect(b).toBe(0);
  });

  it('handles white', () => {
    const { r, g, b } = hexToRgb('#ffffff');
    expect(r).toBe(1); expect(g).toBe(1); expect(b).toBe(1);
  });
});

// ─── Object types in state ────────────────────────────────────────────────────

describe('editor object types', () => {
  it('stores TextObject', () => {
    let s = createEditorState();
    s = addObject(s, makeText());
    expect(s.objects[0].type).toBe('text');
  });
  it('stores ImageObject', () => {
    let s = createEditorState();
    s = addObject(s, makeImage());
    expect(s.objects[0].type).toBe('image');
  });
  it('stores RectObject', () => {
    let s = createEditorState();
    s = addObject(s, makeRect());
    expect(s.objects[0].type).toBe('rect');
  });
  it('stores EllipseObject', () => {
    let s = createEditorState();
    s = addObject(s, makeEllipse());
    expect(s.objects[0].type).toBe('ellipse');
  });
  it('stores LineObject', () => {
    let s = createEditorState();
    s = addObject(s, makeLine());
    expect(s.objects[0].type).toBe('line');
  });
  it('stores ArrowObject', () => {
    let s = createEditorState();
    s = addObject(s, makeArrow());
    expect(s.objects[0].type).toBe('arrow');
  });
  it('stores highlight AnnotationObject', () => {
    let s = createEditorState();
    s = addObject(s, makeAnnotation('highlight'));
    expect(s.objects[0].type).toBe('highlight');
  });
  it('stores underline AnnotationObject', () => {
    let s = createEditorState();
    s = addObject(s, makeAnnotation('underline'));
    expect(s.objects[0].type).toBe('underline');
  });
  it('stores strikethrough AnnotationObject', () => {
    let s = createEditorState();
    s = addObject(s, makeAnnotation('strikethrough'));
    expect(s.objects[0].type).toBe('strikethrough');
  });
});

// ─── buildEditedPdf ───────────────────────────────────────────────────────────

describe('buildEditedPdf', () => {
  it('returns success with empty state', async () => {
    const state = createEditorState();
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('test-edited.pdf');
    }
  });

  it('filename is basename-edited.pdf', async () => {
    const state = createEditorState();
    const result = await buildEditedPdf(makePdfFile('report.pdf'), state);
    if (result.success) expect(result.filename).toBe('report-edited.pdf');
  });

  it('pageCount matches document', async () => {
    const state = createEditorState();
    const result = await buildEditedPdf(makePdfFile(), state);
    if (result.success) expect(result.pageCount).toBe(3);
  });

  it('draws text object', async () => {
    let state = createEditorState();
    state = addObject(state, makeText(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawText).toHaveBeenCalled();
  });

  it('embeds and draws image', async () => {
    let state = createEditorState();
    state = addObject(state, makeImage(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockDoc.embedPng).toHaveBeenCalled();
    expect(mockPage.drawImage).toHaveBeenCalled();
  });

  it('draws rectangle', async () => {
    let state = createEditorState();
    state = addObject(state, makeRect(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawRectangle).toHaveBeenCalled();
  });

  it('draws ellipse', async () => {
    let state = createEditorState();
    state = addObject(state, makeEllipse(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawEllipse).toHaveBeenCalled();
  });

  it('draws line', async () => {
    let state = createEditorState();
    state = addObject(state, makeLine(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawLine).toHaveBeenCalled();
  });

  it('draws arrow', async () => {
    let state = createEditorState();
    state = addObject(state, makeArrow(0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawLine).toHaveBeenCalled();
  });

  it('draws highlight', async () => {
    let state = createEditorState();
    state = addObject(state, makeAnnotation('highlight', 0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawRectangle).toHaveBeenCalled();
  });

  it('draws underline', async () => {
    let state = createEditorState();
    state = addObject(state, makeAnnotation('underline', 0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawLine).toHaveBeenCalled();
  });

  it('draws strikethrough', async () => {
    let state = createEditorState();
    state = addObject(state, makeAnnotation('strikethrough', 0));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawLine).toHaveBeenCalled();
  });

  it('cancels when already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const result = await buildEditedPdf(makePdfFile(), createEditorState(), ac.signal);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/cancel/i);
  });

  it('reports error for encrypted PDF', async () => {
    const m = jest.requireMock('pdf-lib') as { __throwOnLoad: (msg: string) => void };
    m.__throwOnLoad('encrypted PDF');
    const result = await buildEditedPdf(makePdfFile(), createEditorState());
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/password|encrypt/i);
  });

  it('skips objects on out-of-range pages', async () => {
    let state = createEditorState();
    state = addObject(state, makeText(99)); // page 99 does not exist
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawText).not.toHaveBeenCalled();
  });

  it('skips empty text objects', async () => {
    let state = createEditorState();
    const emptyText = { ...makeText(0), text: '   ' };
    state = addObject(state, emptyText);
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawText).not.toHaveBeenCalled();
  });

  it('skips images without embedBytes', async () => {
    let state = createEditorState();
    const noBytes = { ...makeImage(0), embedBytes: undefined };
    state = addObject(state, noBytes);
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockPage.drawImage).not.toHaveBeenCalled();
  });

  it('sorts objects by zIndex before drawing', async () => {
    const drawOrder: string[] = [];
    mockPage.drawRectangle.mockImplementation(() => drawOrder.push('rect'));
    mockPage.drawText.mockImplementation(() => drawOrder.push('text'));

    let state = createEditorState();
    state = addObject(state, makeRect(0)); // zIndex 0
    state = addObject(state, makeText(0)); // zIndex 1
    await buildEditedPdf(makePdfFile(), state);
    expect(drawOrder).toEqual(['rect', 'text']);
  });

  it('handles multiple pages', async () => {
    let state = createEditorState();
    state = addObject(state, makeText(0));
    state = addObject(state, makeRect(2));
    const result = await buildEditedPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(mockDoc.getPage).toHaveBeenCalledWith(0);
    expect(mockDoc.getPage).toHaveBeenCalledWith(2);
  });

  it('uses jpeg embedJpg for jpeg images', async () => {
    let state = createEditorState();
    const img: Omit<ImageObject, 'zIndex'> = { ...makeImage(0), mimeType: 'image/jpeg', embedBytes: new Uint8Array([0xff, 0xd8]) };
    state = addObject(state, img);
    await buildEditedPdf(makePdfFile(), state);
    expect(mockDoc.embedJpg).toHaveBeenCalled();
  });
});

// ─── Module smoke tests ───────────────────────────────────────────────────────

describe('edit-pdf page module', () => {
  it('exports a default function', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/page');
    expect(typeof mod.default).toBe('function');
  });
});

describe('edit-pdf layout module', () => {
  it('exports metadata with correct title', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    expect(mod.metadata).toBeDefined();
    expect((mod.metadata.title as string).toLowerCase()).toContain('pdf editor');
  });

  it('metadata canonical URL contains /pdf-tools/edit-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/edit-pdf/layout');
    const canonical = mod.metadata.alternates?.canonical as string;
    expect(canonical).toContain('/pdf-tools/edit-pdf');
  });
});

describe('sitemap', () => {
  it('includes /pdf-tools/edit-pdf', async () => {
    const mod = await import('../src/app/sitemap');
    const urls = mod.default().map((e) => e.url);
    expect(urls.some((u) => u.includes('/pdf-tools/edit-pdf'))).toBe(true);
  });
});

describe('pdf-tools hub', () => {
  it('lists Edit PDF as available', () => {
    const fs = require('fs');
    const src = fs.readFileSync('src/app/pdf-tools/page.tsx', 'utf-8');
    expect(src).toContain('edit-pdf');
    expect(src).toContain('available: true');
  });
});
