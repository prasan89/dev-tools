'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';

export default function PdfToPowerpointPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pageSelection, setPageSelection] = useState<'all' | 'range'>('all');
  const [pageRange, setPageRange] = useState('');
  const [scale, setScale] = useState(1.5);
  const [isConverting, setIsConverting] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: PdfFile[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setOutputBlob(null);
      setError(null);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfFile) return;
    setIsConverting(true);
    setError(null);
    setOutputBlob(null);
    try {
      const { convertPdfToPowerpoint } = await import('@/lib/pdf/pdfToPowerpoint');
      const result = await convertPdfToPowerpoint(pdfFile, { scale, pageSelection, pageRange });
      if (result.success && result.outputFile) {
        setOutputBlob(result.outputFile.blob);
        setOutputFilename(result.outputFile.filename);
      } else {
        setError(result.error ?? 'Conversion failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  }, [pdfFile, scale, pageSelection, pageRange]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to PowerPoint</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Convert each PDF page into a PowerPoint slide (PPTX). Slides are image-based — text may
        not be directly editable in PowerPoint after conversion.
      </p>

      <PdfDropzone onFilesSelected={handleFilesSelected} maxFiles={1} />

      {pdfFile && (
        <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{pdfFile.name}</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Render scale
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value={1}>1× (faster)</option>
              <option value={1.5}>1.5× (default)</option>
              <option value={2}>2× (sharper)</option>
            </select>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="ps" checked={pageSelection === 'all'} onChange={() => setPageSelection('all')} />
              All pages
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="ps" checked={pageSelection === 'range'} onChange={() => setPageSelection('range')} />
              Page range
            </label>
          </div>

          {pageSelection === 'range' && (
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g. 1-3, 5"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          )}

          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {isConverting ? 'Converting…' : 'Convert to PowerPoint'}
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {outputBlob && (
        <PdfDownload blob={outputBlob} filename={outputFilename} label="Download PowerPoint (.pptx)" />
      )}

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        Slides are image-based representations of PDF pages. Text, animations, transitions and
        editable shapes from the original document are not preserved.
      </aside>
    </div>
  );
}
