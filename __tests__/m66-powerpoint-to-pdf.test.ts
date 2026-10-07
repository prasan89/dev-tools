/**
 * M66 — PowerPoint to PDF tests
 */

import {
  defaultPptxToPdfOptions,
  extractSlideTexts,
  convertPptxToPdf,
} from '../src/lib/pdf/powerpointToPdf';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFile(name = 'presentation.pptx'): File {
  const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // ZIP magic
  return new File([bytes.buffer as ArrayBuffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}

const SLIDE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:spPr>
          <a:xfrm><a:off x="457200" y="274638"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:r><a:t>Hello Slide</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr bold="true"/><a:t>Bold Text</a:t></a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

const EMPTY_SLIDE_XML = `<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree></p:spTree></p:cSld></p:sld>`;

// ─── JSZip mock ───────────────────────────────────────────────────────────────

const mockLoadAsync = jest.fn().mockResolvedValue({
  files: {
    'ppt/slides/slide1.xml': { async: jest.fn().mockResolvedValue(SLIDE_XML) },
    'ppt/slides/slide2.xml': { async: jest.fn().mockResolvedValue(EMPTY_SLIDE_XML) },
  },
});

jest.mock('jszip', () => {
  const JSZip = jest.fn().mockImplementation(() => ({ loadAsync: mockLoadAsync }));
  // jszip exports the constructor directly in CJS
  return JSZip;
});

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockDrawRectangle = jest.fn();
const mockAddPage = jest.fn().mockReturnValue({
  drawText: mockDrawText,
  drawRectangle: mockDrawRectangle,
});
const mockEmbedFont = jest.fn().mockResolvedValue({
  widthOfTextAtSize: jest.fn().mockReturnValue(80),
});
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockDoc = {
  addPage: mockAddPage,
  embedFont: mockEmbedFont,
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    create: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
    load: jest.fn().mockResolvedValue(mockDoc),
  };
  return {
    PDFDocument,
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'Helvetica-Bold' },
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    degrees: jest.fn((n: number) => n),
    __throwOnCreate: (msg: string) => {
      _throw = msg;
      PDFDocument.create = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetCreate: () => {
      _throw = null;
      PDFDocument.create = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

// ─── FileReader mock ──────────────────────────────────────────────────────────

const fakeArrayBuffer = new ArrayBuffer(4);

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockAddPage.mockReturnValue({ drawText: mockDrawText, drawRectangle: mockDrawRectangle });
  mockEmbedFont.mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(80) });
  mockLoadAsync.mockResolvedValue({
    files: {
      'ppt/slides/slide1.xml': { async: jest.fn().mockResolvedValue(SLIDE_XML) },
      'ppt/slides/slide2.xml': { async: jest.fn().mockResolvedValue(EMPTY_SLIDE_XML) },
    },
  });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetCreate: () => void };
  pdfLib.__resetCreate();

  const MockFileReader = jest.fn().mockImplementation(() => {
    const inst: Record<string, unknown> = {
      result: fakeArrayBuffer,
      onload: null,
      onerror: null,
      readAsArrayBuffer: jest.fn().mockImplementation(function (this: typeof inst) {
        if (typeof this.onload === 'function') (this.onload as () => void)();
      }),
    };
    return inst;
  });
  global.FileReader = MockFileReader as unknown as typeof FileReader;
});

// ─── defaultPptxToPdfOptions ──────────────────────────────────────────────────

describe('defaultPptxToPdfOptions', () => {
  it('has widescreen as default page size', () => {
    expect(defaultPptxToPdfOptions().pageSize).toBe('widescreen');
  });

  it('has fontSize 14 by default', () => {
    expect(defaultPptxToPdfOptions().fontSize).toBe(14);
  });
});

// ─── extractSlideTexts ────────────────────────────────────────────────────────

describe('extractSlideTexts', () => {
  it('returns success with slides', async () => {
    const result = await extractSlideTexts(makeFile());
    expect(result.success).toBe(true);
    expect(result.slides).toBeDefined();
  });

  it('returns two slides', async () => {
    const result = await extractSlideTexts(makeFile());
    expect(result.slides).toHaveLength(2);
  });

  it('first slide contains text items', async () => {
    const result = await extractSlideTexts(makeFile());
    expect(result.slides![0].texts.length).toBeGreaterThan(0);
  });

  it('first slide has Hello Slide text', async () => {
    const result = await extractSlideTexts(makeFile());
    const texts = result.slides![0].texts.map((t) => t.text);
    expect(texts).toContain('Hello Slide');
  });

  it('detects bold text', async () => {
    const result = await extractSlideTexts(makeFile());
    const boldItem = result.slides![0].texts.find((t) => t.bold);
    expect(boldItem).toBeDefined();
    expect(boldItem!.text).toBe('Bold Text');
  });

  it('returns error when JSZip throws', async () => {
    mockLoadAsync.mockRejectedValueOnce(new Error('bad zip'));
    const result = await extractSlideTexts(makeFile());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad zip/i);
  });

  it('returns error when no slides found', async () => {
    mockLoadAsync.mockResolvedValueOnce({ files: { 'word/document.xml': { async: jest.fn() } } });
    const result = await extractSlideTexts(makeFile());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no slides/i);
  });
});

// ─── convertPptxToPdf ─────────────────────────────────────────────────────────

describe('convertPptxToPdf', () => {
  it('returns success blob', async () => {
    const result = await convertPptxToPdf(makeFile(), defaultPptxToPdfOptions());
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename ends with .pdf', async () => {
    const result = await convertPptxToPdf(makeFile('deck.pptx'), defaultPptxToPdfOptions());
    expect(result.outputFile!.filename).toBe('deck.pdf');
  });

  it('output filename strips .pptx extension', async () => {
    const result = await convertPptxToPdf(makeFile('My Presentation.pptx'), defaultPptxToPdfOptions());
    expect(result.outputFile!.filename).toBe('My Presentation.pdf');
  });

  it('output blob type is application/pdf', async () => {
    const result = await convertPptxToPdf(makeFile(), defaultPptxToPdfOptions());
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('adds one page per slide', async () => {
    await convertPptxToPdf(makeFile(), defaultPptxToPdfOptions());
    expect(mockAddPage).toHaveBeenCalledTimes(2);
  });

  it('uses widescreen dimensions 960x540', async () => {
    await convertPptxToPdf(makeFile(), { ...defaultPptxToPdfOptions(), pageSize: 'widescreen' });
    expect(mockAddPage).toHaveBeenCalledWith([960, 540]);
  });

  it('uses standard dimensions 720x540', async () => {
    await convertPptxToPdf(makeFile(), { ...defaultPptxToPdfOptions(), pageSize: 'standard' });
    expect(mockAddPage).toHaveBeenCalledWith([720, 540]);
  });

  it('returns error when pdf-lib throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnCreate: (m: string) => void };
    pdfLib.__throwOnCreate('create failed');
    const result = await convertPptxToPdf(makeFile(), defaultPptxToPdfOptions());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/create failed/i);
  });

  it('returns error when JSZip fails', async () => {
    mockLoadAsync.mockRejectedValueOnce(new Error('corrupted zip'));
    const result = await convertPptxToPdf(makeFile(), defaultPptxToPdfOptions());
    expect(result.success).toBe(false);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('powerpoint-to-pdf layout metadata', () => {
  it('title contains PowerPoint and PDF', async () => {
    const mod = await import('../src/app/pdf-tools/powerpoint-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/powerpoint.+pdf/i);
  });

  it('has PPTX-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/powerpoint-to-pdf/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pptx|powerpoint/);
  });

  it('canonical url contains powerpoint-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/powerpoint-to-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('powerpoint-to-pdf');
  });
});
