/**
 * M52 — PDF to Markdown tests
 */

import { textToMarkdown, extractMarkdownFromPdf } from '../src/lib/pdf/pdfToMarkdown';
import type { PdfFile } from '../src/types/pdf';

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test', name, size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 2, objectUrl: 'blob:test',
    isPasswordProtected: false, isCorrupted: false, loadedAt: 0,
  };
}

const mockGetTextContent = jest.fn();
const mockGetPage = jest.fn();
const mockPdf = { numPages: 2, getPage: mockGetPage };

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerPort: 'mock-worker' },
  getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdf) }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTextContent.mockResolvedValue({ items: [{ str: 'Hello World' }, { str: 'INTRODUCTION' }] });
  mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent });
  mockPdf.numPages = 2;
});

describe('textToMarkdown', () => {
  it('converts ALL CAPS short lines to ## headings', () => {
    const md = textToMarkdown(['INTRODUCTION\nSome body text.']);
    expect(md).toContain('## INTRODUCTION');
  });

  it('does not convert long ALL CAPS lines to headings', () => {
    const longLine = 'A'.repeat(61);
    const md = textToMarkdown([longLine]);
    expect(md).not.toContain('##');
  });

  it('converts bullet lines (•) to markdown list items', () => {
    const md = textToMarkdown(['• First item\n• Second item']);
    expect(md).toContain('- First item');
    expect(md).toContain('- Second item');
  });

  it('converts bullet lines (-) to markdown list items', () => {
    const md = textToMarkdown(['- Item one\n- Item two']);
    expect(md).toContain('- Item one');
  });

  it('adds page separator between pages', () => {
    const md = textToMarkdown(['Page one text', 'Page two text']);
    expect(md).toContain('---');
  });

  it('preserves plain body text', () => {
    const md = textToMarkdown(['This is a normal sentence.']);
    expect(md).toContain('This is a normal sentence.');
  });

  it('handles empty page texts', () => {
    const md = textToMarkdown(['', 'Second page']);
    expect(md).toContain('Second page');
  });
});

describe('extractMarkdownFromPdf', () => {
  it('returns success with markdown string', async () => {
    const res = await extractMarkdownFromPdf(makePdfFile());
    expect(res.success).toBe(true);
    expect(typeof res.result!.markdown).toBe('string');
  });

  it('result contains pageCount', async () => {
    const res = await extractMarkdownFromPdf(makePdfFile());
    expect(res.result!.pageCount).toBe(2);
  });

  it('markdown contains extracted text', async () => {
    const res = await extractMarkdownFromPdf(makePdfFile());
    expect(res.result!.markdown).toContain('Hello World');
  });

  it('returns error when pdfjs throws', async () => {
    const pdfLib = jest.requireMock('pdfjs-dist') as { getDocument: jest.Mock };
    pdfLib.getDocument.mockImplementationOnce(() => { throw new Error('load failed'); });
    const res = await extractMarkdownFromPdf(makePdfFile());
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/load failed/i);
  });
});

describe('pdf-to-markdown layout metadata', () => {
  it('title contains PDF to Markdown', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-markdown/layout');
    expect(String(mod.metadata.title)).toMatch(/pdf.+markdown/i);
  });

  it('has markdown-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-markdown/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/pdf to markdown|convert pdf/);
  });

  it('canonical contains pdf-to-markdown', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-markdown/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('pdf-to-markdown');
  });
});
