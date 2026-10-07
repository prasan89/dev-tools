/**
 * M42 — PDF Metadata Editor tests
 *
 * Tests cover:
 *  - emptyMetadata: returns all empty strings
 *  - readMetadata: reads all fields from pdf-lib
 *  - buildMetadataEditedPdf: sets all fields, clearAll, skips empty dates, error handling
 *  - layout SEO keywords
 */

import {
  emptyMetadata,
  readMetadata,
  buildMetadataEditedPdf,
} from '../src/lib/pdf/pdfMetadata';
import type { PdfMetadata } from '../src/lib/pdf/pdfMetadata';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'doc.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 1,
    objectUrl: 'blob:test',
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: 0,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockGetTitle = jest.fn().mockReturnValue('Test Title');
const mockGetAuthor = jest.fn().mockReturnValue('Test Author');
const mockGetSubject = jest.fn().mockReturnValue('Test Subject');
const mockGetKeywords = jest.fn().mockReturnValue('test,pdf');
const mockGetCreator = jest.fn().mockReturnValue('CreatorApp');
const mockGetProducer = jest.fn().mockReturnValue('ProducerApp');
const mockGetCreationDate = jest.fn().mockReturnValue(new Date('2024-01-15T10:00:00Z'));
const mockGetModificationDate = jest.fn().mockReturnValue(new Date('2024-06-20T12:00:00Z'));

const mockSetTitle = jest.fn();
const mockSetAuthor = jest.fn();
const mockSetSubject = jest.fn();
const mockSetKeywords = jest.fn();
const mockSetCreator = jest.fn();
const mockSetProducer = jest.fn();
const mockSetCreationDate = jest.fn();
const mockSetModificationDate = jest.fn();
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));

const mockDoc = {
  getTitle: mockGetTitle,
  getAuthor: mockGetAuthor,
  getSubject: mockGetSubject,
  getKeywords: mockGetKeywords,
  getCreator: mockGetCreator,
  getProducer: mockGetProducer,
  getCreationDate: mockGetCreationDate,
  getModificationDate: mockGetModificationDate,
  setTitle: mockSetTitle,
  setAuthor: mockSetAuthor,
  setSubject: mockSetSubject,
  setKeywords: mockSetKeywords,
  setCreator: mockSetCreator,
  setProducer: mockSetProducer,
  setCreationDate: mockSetCreationDate,
  setModificationDate: mockSetModificationDate,
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
  mockGetTitle.mockReturnValue('Test Title');
  mockGetAuthor.mockReturnValue('Test Author');
  mockGetSubject.mockReturnValue('Test Subject');
  mockGetKeywords.mockReturnValue('test,pdf');
  mockGetCreator.mockReturnValue('CreatorApp');
  mockGetProducer.mockReturnValue('ProducerApp');
  mockGetCreationDate.mockReturnValue(new Date('2024-01-15T10:00:00Z'));
  mockGetModificationDate.mockReturnValue(new Date('2024-06-20T12:00:00Z'));
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── emptyMetadata ────────────────────────────────────────────────────────────

describe('emptyMetadata', () => {
  it('returns object with all empty strings', () => {
    const m = emptyMetadata();
    expect(m.title).toBe('');
    expect(m.author).toBe('');
    expect(m.subject).toBe('');
    expect(m.keywords).toBe('');
    expect(m.creator).toBe('');
    expect(m.producer).toBe('');
    expect(m.creationDate).toBe('');
    expect(m.modificationDate).toBe('');
  });

  it('has exactly the 8 expected keys', () => {
    const keys = Object.keys(emptyMetadata());
    expect(keys).toEqual(['title', 'author', 'subject', 'keywords', 'creator', 'producer', 'creationDate', 'modificationDate']);
  });
});

// ─── readMetadata ─────────────────────────────────────────────────────────────

describe('readMetadata', () => {
  it('reads title from pdf-lib', async () => {
    const meta = await readMetadata(makePdfFile());
    expect(meta.title).toBe('Test Title');
  });

  it('reads author from pdf-lib', async () => {
    const meta = await readMetadata(makePdfFile());
    expect(meta.author).toBe('Test Author');
  });

  it('reads subject, keywords, creator, producer', async () => {
    const meta = await readMetadata(makePdfFile());
    expect(meta.subject).toBe('Test Subject');
    expect(meta.keywords).toBe('test,pdf');
    expect(meta.creator).toBe('CreatorApp');
    expect(meta.producer).toBe('ProducerApp');
  });

  it('reads creation and modification dates as ISO strings', async () => {
    const meta = await readMetadata(makePdfFile());
    expect(meta.creationDate).toBe('2024-01-15T10:00:00.000Z');
    expect(meta.modificationDate).toBe('2024-06-20T12:00:00.000Z');
  });

  it('returns empty string when field returns undefined', async () => {
    mockGetTitle.mockReturnValue(undefined);
    const meta = await readMetadata(makePdfFile());
    expect(meta.title).toBe('');
  });

  it('returns empty string when field throws', async () => {
    mockGetAuthor.mockImplementation(() => { throw new Error('bad'); });
    const meta = await readMetadata(makePdfFile());
    expect(meta.author).toBe('');
  });

  it('returns empty string when date is invalid', async () => {
    mockGetCreationDate.mockReturnValue(new Date('invalid'));
    const meta = await readMetadata(makePdfFile());
    expect(meta.creationDate).toBe('');
  });
});

// ─── buildMetadataEditedPdf: set fields ───────────────────────────────────────

describe('buildMetadataEditedPdf: set fields', () => {
  const testMeta: PdfMetadata = {
    title: 'New Title',
    author: 'New Author',
    subject: 'New Subject',
    keywords: 'new,keywords',
    creator: 'NewCreator',
    producer: 'NewProducer',
    creationDate: '2025-03-01T08:00:00.000Z',
    modificationDate: '2025-06-15T12:00:00.000Z',
  };

  it('returns success', async () => {
    const result = await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
  });

  it('output filename contains _metadata', async () => {
    const result = await buildMetadataEditedPdf(makePdfFile('report.pdf'), testMeta, false);
    expect(result.outputFile!.filename).toBe('report_metadata.pdf');
  });

  it('calls setTitle with new title', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetTitle).toHaveBeenCalledWith('New Title');
  });

  it('calls setAuthor with new author', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetAuthor).toHaveBeenCalledWith('New Author');
  });

  it('calls setSubject with new subject', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetSubject).toHaveBeenCalledWith('New Subject');
  });

  it('calls setKeywords with array', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetKeywords).toHaveBeenCalledWith(['new,keywords']);
  });

  it('calls setCreator and setProducer', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetCreator).toHaveBeenCalledWith('NewCreator');
    expect(mockSetProducer).toHaveBeenCalledWith('NewProducer');
  });

  it('calls setCreationDate with Date object when valid ISO provided', async () => {
    await buildMetadataEditedPdf(makePdfFile(), testMeta, false);
    expect(mockSetCreationDate).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does not call setCreationDate when date is empty', async () => {
    const meta: PdfMetadata = { ...testMeta, creationDate: '' };
    await buildMetadataEditedPdf(makePdfFile(), meta, false);
    expect(mockSetCreationDate).not.toHaveBeenCalled();
  });

  it('does not call setModificationDate when date is empty', async () => {
    const meta: PdfMetadata = { ...testMeta, modificationDate: '' };
    await buildMetadataEditedPdf(makePdfFile(), meta, false);
    expect(mockSetModificationDate).not.toHaveBeenCalled();
  });

  it('calls setKeywords with empty array when keywords is empty', async () => {
    const meta: PdfMetadata = { ...testMeta, keywords: '' };
    await buildMetadataEditedPdf(makePdfFile(), meta, false);
    expect(mockSetKeywords).toHaveBeenCalledWith([]);
  });
});

// ─── buildMetadataEditedPdf: clearAll ─────────────────────────────────────────

describe('buildMetadataEditedPdf: clearAll', () => {
  const anyMeta: PdfMetadata = {
    title: 'ShouldBeIgnored',
    author: 'Ignored',
    subject: 'Ignored',
    keywords: 'ignored',
    creator: 'Ignored',
    producer: 'Ignored',
    creationDate: '',
    modificationDate: '',
  };

  it('sets title to empty string when clearAll', async () => {
    await buildMetadataEditedPdf(makePdfFile(), anyMeta, true);
    expect(mockSetTitle).toHaveBeenCalledWith('');
  });

  it('sets author to empty string when clearAll', async () => {
    await buildMetadataEditedPdf(makePdfFile(), anyMeta, true);
    expect(mockSetAuthor).toHaveBeenCalledWith('');
  });

  it('sets subject and keywords to empty when clearAll', async () => {
    await buildMetadataEditedPdf(makePdfFile(), anyMeta, true);
    expect(mockSetSubject).toHaveBeenCalledWith('');
    expect(mockSetKeywords).toHaveBeenCalledWith([]);
  });

  it('sets creator and producer to empty when clearAll', async () => {
    await buildMetadataEditedPdf(makePdfFile(), anyMeta, true);
    expect(mockSetCreator).toHaveBeenCalledWith('');
    expect(mockSetProducer).toHaveBeenCalledWith('');
  });

  it('returns success when clearAll', async () => {
    const result = await buildMetadataEditedPdf(makePdfFile(), anyMeta, true);
    expect(result.success).toBe(true);
  });
});

// ─── buildMetadataEditedPdf: error handling ───────────────────────────────────

describe('buildMetadataEditedPdf: error handling', () => {
  it('returns failure when pdf-lib load throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupted pdf');
    const result = await buildMetadataEditedPdf(makePdfFile(), emptyMetadata(), false);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupted pdf/i);
  });

  it('returns failure when save throws', async () => {
    mockSave.mockRejectedValue(new Error('save failed'));
    const result = await buildMetadataEditedPdf(makePdfFile(), emptyMetadata(), false);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/save failed/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('pdf-metadata layout metadata', () => {
  it('title contains edit PDF metadata', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-metadata/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/pdf.+metadata/i);
  });

  it('has metadata-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-metadata/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/edit pdf metadata|remove pdf metadata|pdf metadata/);
  });

  it('has canonical URL containing pdf-metadata', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-metadata/layout');
    const { metadata } = mod;
    expect(String(metadata.alternates?.canonical)).toMatch(/pdf-metadata/);
  });
});
