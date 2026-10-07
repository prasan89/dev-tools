'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { ocrPdf } from '@/lib/pdf/ocrPdf';

type State = 'idle' | 'processing' | 'done' | 'error';

export default function OcrTextPage() {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState('');
  const [fullText, setFullText] = useState('');
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setState('processing');
    setError(null);
    setFilename(f.name);
    setProgress('Starting OCR…');

    const result = await ocrPdf(f.file, f.pageCount ?? 1, ({ pageIndex, total }) => {
      setProgress(`OCR: page ${pageIndex + 1} of ${total}…`);
    });

    if (result.success && result.fullText !== undefined && result.pages) {
      setFullText(result.fullText);
      const avg = result.pages.reduce((s, p) => s + p.confidence, 0) / result.pages.length;
      setAvgConfidence(Math.round(avg));
      setState('done');
    } else {
      setError(result.error ?? 'OCR failed');
      setState('error');
    }
  }, []);

  const handleDownload = () => {
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.pdf$/i, '') + '_ocr_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PdfToolLayout title="OCR to Text" description="Extract text from scanned PDFs using Tesseract.js OCR.">
      <aside className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        OCR accuracy depends on scan quality. Tesseract.js (~20MB) downloads on first use.
      </aside>

      {state === 'idle' && <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />}

      {state === 'processing' && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{progress}</p>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 text-center">{error}</p>
          <button onClick={() => setState('idle')} className="text-sm underline text-gray-500 block mx-auto">Try again</button>
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-4">
          <div className="flex gap-3 justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {fullText.length.toLocaleString()} chars · avg confidence {avgConfidence}%
            </span>
            <button onClick={handleDownload} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 transition-colors">Download .txt</button>
          </div>
          <textarea readOnly value={fullText} className="w-full h-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-mono resize-y" />
          <button onClick={() => { setState('idle'); setFullText(''); }} className="text-sm text-gray-500 hover:text-gray-700 underline block">Load a different PDF</button>
        </div>
      )}
    </PdfToolLayout>
  );
}
