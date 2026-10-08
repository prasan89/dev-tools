'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { convertPdfToWebp, defaultWebpOptions, type WebpPage, type WebpConversionOptions } from '@/lib/pdf/pdfToWebp';

type State = 'idle' | 'converting' | 'done' | 'error';

export default function PdfToWebpPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [options, setOptions] = useState<WebpConversionOptions>(defaultWebpOptions());
  const [state, setState] = useState<State>('idle');
  const [pages, setPages] = useState<WebpPage[]>([]);
  const [error, setError] = useState('');

  const handleFiles = useCallback((files: PdfFile[]) => {
    if (files[0]) { setPdfFile(files[0]); setState('idle'); setPages([]); }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfFile) return;
    setState('converting');
    const result = await convertPdfToWebp(pdfFile, options);
    if (result.success && result.pages) {
      setPages(result.pages);
      setState('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setState('error');
    }
  }, [pdfFile, options]);

  const handleDownload = useCallback((page: WebpPage) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = `page_${page.pageIndex + 1}.webp`;
    a.click();
  }, []);

  const handleDownloadAll = useCallback(async () => {
    for (const page of pages) {
      await new Promise<void>((resolve) => {
        const a = document.createElement('a');
        a.href = page.dataUrl;
        a.download = `page_${page.pageIndex + 1}.webp`;
        a.click();
        setTimeout(resolve, 150);
      });
    }
  }, [pages]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to WebP</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Convert PDF pages to WebP images in your browser. No uploads — files stay on your device.
        </p>
      </div>

      <PdfDropzone onFilesSelected={handleFiles} maxFiles={1} />

      {pdfFile && (
        <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{pdfFile.name}</p>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quality ({Math.round(options.quality * 100)}%)</label>
              <input
                type="range" min={0.1} max={1} step={0.05}
                value={options.quality}
                onChange={(e) => setOptions((o) => ({ ...o, quality: parseFloat(e.target.value) }))}
                className="w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Scale</label>
              <select
                value={options.scale}
                onChange={(e) => setOptions((o) => ({ ...o, scale: parseFloat(e.target.value) }))}
                className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-800"
              >
                <option value={1}>1× (72 dpi)</option>
                <option value={2}>2× (144 dpi)</option>
                <option value={3}>3× (216 dpi)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pages</label>
              <select
                value={options.pageSelection}
                onChange={(e) => setOptions((o) => ({ ...o, pageSelection: e.target.value as 'all' | 'range' }))}
                className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All pages</option>
                <option value="range">Range</option>
              </select>
            </div>
            {options.pageSelection === 'range' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Range (e.g. 1-3,5)</label>
                <input
                  type="text" value={options.pageRange}
                  onChange={(e) => setOptions((o) => ({ ...o, pageRange: e.target.value }))}
                  className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm w-28 bg-white dark:bg-gray-800"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={state === 'converting'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {state === 'converting' ? 'Converting…' : 'Convert to WebP'}
          </button>
        </div>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {state === 'done' && pages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{pages.length} page{pages.length !== 1 ? 's' : ''} converted</p>
            {pages.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                Download all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pages.map((page) => (
              <div key={page.pageIndex} className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={page.dataUrl}
                  alt={`Page ${page.pageIndex + 1}`}
                  className="w-full object-contain bg-gray-50 dark:bg-gray-800"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <button
                    onClick={() => handleDownload(page)}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900"
                  >
                    Download
                  </button>
                </div>
                <p className="px-2 py-1 text-xs text-center text-gray-500 dark:text-gray-400">Page {page.pageIndex + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
