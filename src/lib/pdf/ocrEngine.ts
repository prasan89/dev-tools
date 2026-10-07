export type OcrLanguage = 'eng' | 'fra' | 'deu' | 'spa' | 'ita' | 'por' | 'chi_sim';

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrResult {
  text: string;
  confidence: number;
  words: OcrWord[];
}

export async function recognizeImage(
  imageFile: File,
  language: OcrLanguage,
): Promise<{ success: boolean; result?: OcrResult; error?: string }> {
  try {
    const Tesseract = await import('tesseract.js');
    const { data } = await Tesseract.recognize(imageFile, language, {});
    const words: OcrWord[] = ((data as unknown as { words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> }).words ?? []).map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
    }));
    return {
      success: true,
      result: {
        text: data.text,
        confidence: data.confidence,
        words,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OCR failed';
    if (msg.includes('Cannot find module') || msg.includes('not available')) {
      return { success: false, error: 'OCR library not available' };
    }
    return { success: false, error: msg };
  }
}
