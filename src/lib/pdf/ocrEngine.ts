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

export type OcrProgressStage =
  | 'loading-engine'
  | 'loading-language'
  | 'initializing'
  | 'recognizing'
  | 'finalizing'
  | 'complete';

export interface OcrProgressEvent {
  stage: OcrProgressStage;
  progress: number; // 0–100
  message: string;
}

export type OcrProgressCallback = (event: OcrProgressEvent) => void;

const STAGE_MESSAGES: Record<OcrProgressStage, string> = {
  'loading-engine': 'Loading OCR engine…',
  'loading-language': 'Loading language data…',
  'initializing': 'Initializing recognizer…',
  'recognizing': 'Recognizing text…',
  'finalizing': 'Finalizing result…',
  'complete': 'Complete',
};

function mapTesseractStatus(status: string): OcrProgressStage {
  if (status.includes('load tesseract core') || status.includes('loading tesseract core')) return 'loading-engine';
  if (status.includes('load language') || status.includes('loading language')) return 'loading-language';
  if (status.includes('initializing') || status.includes('initialize')) return 'initializing';
  if (status.includes('recognizing') || status.includes('recognize')) return 'recognizing';
  return 'recognizing';
}

export async function recognizeImage(
  imageFile: File,
  language: OcrLanguage,
  onProgress?: OcrProgressCallback,
): Promise<{ success: boolean; result?: OcrResult; error?: string }> {
  try {
    onProgress?.({ stage: 'loading-engine', progress: 5, message: STAGE_MESSAGES['loading-engine'] });

    const Tesseract = await import('tesseract.js');

    onProgress?.({ stage: 'loading-language', progress: 15, message: STAGE_MESSAGES['loading-language'] });

    const { data } = await Tesseract.recognize(imageFile, language, {
      logger: (m: { status: string; progress: number }) => {
        if (!onProgress) return;
        const stage = mapTesseractStatus(m.status);
        // Tesseract progress goes 0–1; map to 15–90 range to leave room for start/end
        const pct = Math.round(15 + m.progress * 75);
        onProgress({ stage, progress: pct, message: STAGE_MESSAGES[stage] });
      },
    });

    onProgress?.({ stage: 'finalizing', progress: 95, message: STAGE_MESSAGES['finalizing'] });

    const words: OcrWord[] = (
      (data as unknown as { words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> }).words ?? []
    ).map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
    }));

    onProgress?.({ stage: 'complete', progress: 100, message: STAGE_MESSAGES['complete'] });

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
