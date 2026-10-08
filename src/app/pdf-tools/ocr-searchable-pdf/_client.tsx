'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import { buildOcrSearchablePdf } from '@/lib/pdf/ocrToPdf';

type State = 'idle' | 'processing' | 'done' | 'error';

const LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'spa', label: 'Spanish' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'nld', label: 'Dutch' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'kor', label: 'Korean' },
  { value: 'ara', label: 'Arabic' },
  { value: 'rus', label: 'Russian' },
];

export default function OcrSearchablePdfPage() {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('eng');

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setState('processing');
    setError(null);
    setFilename(f.name);
    setProgress('Starting OCR…');

    const result = await buildOcrSearchablePdf(f, {
      language,
      pageSelection: 'all',
      pageRange: '',
      onProgress: (page, total) => {
        setProgress(`OCR: page ${page + 1} of ${total}…`);
      },
    });

    if (!result.success || !result.outputFile) {
      setError(result.error ?? 'OCR failed');
      setState('error');
      return;
    }

    setDownloadBlob(result.outputFile.blob);
    setState('done');
  }, [language]);

  return (
    <PdfToolLayout title="OCR to Searchable PDF" description="Add a searchable text layer to scanned PDFs.">
      <aside className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        OCR accuracy depends on scan quality. Tesseract.js (~20MB) downloads on first use.
      </aside>

      {state === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />
        </div>
      )}

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

      {state === 'done' && downloadBlob && (
        <div className="space-y-4">
          <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">Searchable PDF ready!</p>
          <PdfDownload blob={downloadBlob} filename={filename.replace(/\.pdf$/i, '') + '_searchable.pdf'} />
          <button onClick={() => { setState('idle'); setDownloadBlob(null); }} className="text-sm text-gray-500 hover:text-gray-700 underline block mx-auto">Load a different PDF</button>
        </div>
      )}
    </PdfToolLayout>
  );
}
