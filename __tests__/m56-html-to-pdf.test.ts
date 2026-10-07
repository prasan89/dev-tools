/**
 * M56 — HTML to PDF tests
 */

import { stripHtmlTags, parseHtmlToBlocks, convertHtmlToPdf } from '../src/lib/pdf/htmlToPdf';

// ─── pdf-lib mock ──────────────────────────────────────────────────────────────

const mockDrawText = jest.fn();
const mockPage = { drawText: mockDrawText };
const mockAddPage = jest.fn().mockReturnValue(mockPage);
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockSetTitle = jest.fn();
const mockDoc = {
  addPage: mockAddPage,
  setTitle: mockSetTitle,
  setProducer: jest.fn(),
  setCreator: jest.fn(),
  embedFont: jest.fn().mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(60) }),
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
    rgb: jest.fn().mockReturnValue({}),
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

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
  mockAddPage.mockReturnValue(mockPage);
  mockDoc.embedFont.mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(60) });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetCreate: () => void };
  pdfLib.__resetCreate();
});

// ─── stripHtmlTags ─────────────────────────────────────────────────────────────

describe('stripHtmlTags', () => {
  it('removes simple tags', () => {
    expect(stripHtmlTags('<b>hello</b>')).toBe('hello');
  });

  it('removes nested tags', () => {
    expect(stripHtmlTags('<p><strong>test</strong></p>')).toBe('test');
  });

  it('decodes &amp;', () => {
    expect(stripHtmlTags('a &amp; b')).toBe('a & b');
  });

  it('decodes &lt; and &gt;', () => {
    expect(stripHtmlTags('&lt;tag&gt;')).toBe('<tag>');
  });

  it('decodes &nbsp;', () => {
    expect(stripHtmlTags('hello&nbsp;world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtmlTags('hello world')).toBe('hello world');
  });
});

// ─── parseHtmlToBlocks ─────────────────────────────────────────────────────────

describe('parseHtmlToBlocks', () => {
  it('detects h1 as heading with level 1', () => {
    const blocks = parseHtmlToBlocks('<h1>Title</h1>');
    expect(blocks.some((b) => b.type === 'heading' && b.level === 1 && b.text === 'Title')).toBe(true);
  });

  it('detects h2 as heading with level 2', () => {
    const blocks = parseHtmlToBlocks('<h2>Subtitle</h2>');
    expect(blocks.some((b) => b.type === 'heading' && b.level === 2)).toBe(true);
  });

  it('detects h3 as heading with level 3', () => {
    const blocks = parseHtmlToBlocks('<h3>Section</h3>');
    expect(blocks.some((b) => b.type === 'heading' && b.level === 3)).toBe(true);
  });

  it('detects p as paragraph', () => {
    const blocks = parseHtmlToBlocks('<p>Some text</p>');
    expect(blocks.some((b) => b.type === 'paragraph' && b.text === 'Some text')).toBe(true);
  });

  it('detects li as list', () => {
    const blocks = parseHtmlToBlocks('<ul><li>Item one</li></ul>');
    expect(blocks.some((b) => b.type === 'list' && b.text === 'Item one')).toBe(true);
  });

  it('falls back to paragraph for plain text', () => {
    const blocks = parseHtmlToBlocks('just plain text');
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0].type).toBe('paragraph');
  });

  it('handles mixed content', () => {
    const html = '<h1>Title</h1><p>Para</p><li>Item</li>';
    const blocks = parseHtmlToBlocks(html);
    expect(blocks.length).toBe(3);
  });
});

// ─── convertHtmlToPdf ─────────────────────────────────────────────────────────

describe('convertHtmlToPdf: success', () => {
  it('returns success=true', async () => {
    const result = await convertHtmlToPdf('<p>Hello world</p>', 'test');
    expect(result.success).toBe(true);
  });

  it('returns blob with pdf type', async () => {
    const result = await convertHtmlToPdf('<p>Hello</p>', 'doc');
    expect(result.outputFile!.blob.type).toBe('application/pdf');
  });

  it('output filename uses title', async () => {
    const result = await convertHtmlToPdf('<p>Hello</p>', 'My Report');
    expect(result.outputFile!.filename).toContain('My_Report');
  });

  it('fallback filename when title is empty', async () => {
    const result = await convertHtmlToPdf('<p>Hello</p>', '');
    expect(result.outputFile!.filename).toBe('converted.pdf');
  });

  it('calls PDFDocument.create', async () => {
    await convertHtmlToPdf('<p>Hello</p>', 'test');
    const pdfLib = jest.requireMock('pdf-lib') as { PDFDocument: { create: jest.Mock } };
    expect(pdfLib.PDFDocument.create).toHaveBeenCalled();
  });
});

describe('convertHtmlToPdf: validation', () => {
  it('returns error for empty html', async () => {
    const result = await convertHtmlToPdf('', 'test');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('returns error for whitespace-only html', async () => {
    const result = await convertHtmlToPdf('   ', 'test');
    expect(result.success).toBe(false);
  });
});

describe('convertHtmlToPdf: error handling', () => {
  it('returns failure when pdf-lib create throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnCreate: (m: string) => void };
    pdfLib.__throwOnCreate('out of memory');
    const result = await convertHtmlToPdf('<p>Hello</p>', 'test');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/out of memory/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('html-to-pdf layout metadata', () => {
  it('title contains HTML to PDF', async () => {
    const mod = await import('../src/app/pdf-tools/html-to-pdf/layout');
    expect(String(mod.metadata.title)).toMatch(/html.+pdf/i);
  });

  it('has html-to-pdf-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/html-to-pdf/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/html.+pdf|convert html/i);
  });

  it('canonical url contains html-to-pdf', async () => {
    const mod = await import('../src/app/pdf-tools/html-to-pdf/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('html-to-pdf');
  });
});
