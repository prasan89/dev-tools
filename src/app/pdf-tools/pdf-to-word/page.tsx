'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import { convertPdfToWord, defaultWordOptions } from '@/lib/pdf/pdfToWord';

type State = 'idle' | 'converting' | 'done' | 'error';

export default function PdfToWordPage() {
  const [state, setState] = useState<State>('idle');
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputName, setOutputName] = useState('');
  const [error, setError] = useState('');

  const handleFilesSelected = useCallback((files: PdfFile[]) => {
    if (files[0]) {
      setPdfFile(files[0]);
      setState('idle');
      setOutputBlob(null);
      setError('');
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfFile) return;
    setState('converting');
    setError('');
    const result = await convertPdfToWord(pdfFile, defaultWordOptions());
    if (result.success && result.outputFile) {
      setOutputBlob(result.outputFile.blob);
      setOutputName(result.outputFile.filename);
      setState('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setState('error');
    }
  }, [pdfFile]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to Word</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert a PDF to a DOCX file in your browser. No upload required.
        </p>
      </div>

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        Best-effort conversion. Complex layouts, columns, forms and advanced typography may not convert perfectly.
        For scanned PDFs, use the <a href="/pdf-tools/ocr-text" className="underline">OCR tool</a> first.
      </aside>

      <PdfDropzone onFilesSelected={handleFilesSelected} maxFiles={1} multiple={false} />

      {pdfFile && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{pdfFile.name}</span>
          <button
            onClick={handleConvert}
            disabled={state === 'converting'}
            className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === 'converting' ? 'Converting…' : 'Convert to Word'}
          </button>
        </div>
      )}

      {state === 'error' && (
        <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {state === 'done' && outputBlob && (
        <PdfDownload
          blob={outputBlob}
          filename={outputName}
          label="Download DOCX"
        />
      )}

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p className="font-medium text-gray-800 dark:text-gray-200">Conversion limitations</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Complex multi-column layouts may not be preserved</li>
          <li>Images are not included in this version</li>
          <li>Forms, vectors, and complex typography may differ</li>
          <li>Scanned PDFs require OCR — text will be empty without it</li>
        </ul>
      </section>
    </div>
  );
}
