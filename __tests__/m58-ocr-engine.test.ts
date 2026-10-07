/**
 * M58 — Client-Side OCR Engine tests
 */

import { recognizeImage } from '../src/lib/pdf/ocrEngine';
import type { OcrLanguage } from '../src/lib/pdf/ocrEngine';

// ─── Tesseract.js mock ────────────────────────────────────────────────────────

jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: {
      text: 'Hello World',
      confidence: 95.5,
      words: [
        { text: 'Hello', confidence: 96, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'World', confidence: 95, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
      ],
    },
  }),
}), { virtual: true });

function makeImageFile(name = 'scan.png'): File {
  return new File([new Uint8Array([0, 1, 2])], name, { type: 'image/png' });
}

beforeEach(() => {
  jest.clearAllMocks();
  const tessModule = jest.requireMock('tesseract.js') as { recognize: jest.Mock };
  tessModule.recognize.mockResolvedValue({
    data: {
      text: 'Hello World',
      confidence: 95.5,
      words: [
        { text: 'Hello', confidence: 96, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'World', confidence: 95, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
      ],
    },
  });
});

// ─── recognizeImage ───────────────────────────────────────────────────────────

describe('recognizeImage: success', () => {
  it('returns success with text', async () => {
    const result = await recognizeImage(makeImageFile(), 'eng');
    expect(result.success).toBe(true);
    expect(result.result?.text).toBe('Hello World');
  });

  it('returns confidence score', async () => {
    const result = await recognizeImage(makeImageFile(), 'eng');
    expect(result.result?.confidence).toBeCloseTo(95.5);
  });

  it('returns word array', async () => {
    const result = await recognizeImage(makeImageFile(), 'eng');
    expect(result.result?.words).toHaveLength(2);
    expect(result.result?.words[0].text).toBe('Hello');
  });

  it('word has bbox', async () => {
    const result = await recognizeImage(makeImageFile(), 'eng');
    const w = result.result!.words[0];
    expect(w.bbox).toEqual({ x0: 0, y0: 0, x1: 50, y1: 20 });
  });

  it('passes language to Tesseract', async () => {
    const tess = jest.requireMock('tesseract.js') as { recognize: jest.Mock };
    await recognizeImage(makeImageFile(), 'fra');
    expect(tess.recognize).toHaveBeenCalledWith(
      expect.anything(),
      'fra',
      expect.anything(),
    );
  });

  it('works with various languages', async () => {
    const langs: OcrLanguage[] = ['eng', 'deu', 'spa', 'ita'];
    for (const lang of langs) {
      const result = await recognizeImage(makeImageFile(), lang);
      expect(result.success).toBe(true);
    }
  });
});

describe('recognizeImage: error handling', () => {
  it('returns error when tesseract throws', async () => {
    const tess = jest.requireMock('tesseract.js') as { recognize: jest.Mock };
    tess.recognize.mockRejectedValueOnce(new Error('Worker crashed'));
    const result = await recognizeImage(makeImageFile(), 'eng');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Worker crashed/i);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('ocr layout metadata', () => {
  it('title contains OCR or image to text', async () => {
    const mod = await import('../src/app/pdf-tools/ocr/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/ocr|image to text/i);
  });

  it('canonical url contains /ocr', async () => {
    const mod = await import('../src/app/pdf-tools/ocr/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toMatch(/\/ocr/);
  });

  it('has OCR-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/ocr/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/ocr|optical character|image to text/);
  });
});
