'use client';

import { useState, useCallback } from 'react';
import { buildNewPdf, defaultCreatePdfConfig, getPageDimensions } from '@/lib/pdf/createPdf';
import type { CreatePdfConfig, PageSize, PageOrientation } from '@/lib/pdf/createPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

const PAGE_SIZES: PageSize[] = ['A4', 'Letter', 'Legal', 'A3', 'A5'];

export default function CreatePdfPage() {
  const [config, setConfig] = useState<CreatePdfConfig>(defaultCreatePdfConfig());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>('document_new.pdf');

  const update = useCallback(<K extends keyof CreatePdfConfig>(key: K, value: CreatePdfConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setOutputBlob(null);
    setError(null);
  }, []);

  const { width, height } = getPageDimensions(config.pageSize, config.orientation);

  const handleCreate = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setOutputBlob(null);
    const result = await buildNewPdf(config);
    setProcessing(false);
    if (result.success && result.outputFile) {
      setOutputBlob(result.outputFile.blob);
      setOutputFilename(result.outputFile.filename);
    } else {
      setError(result.error ?? 'Failed to create PDF');
    }
  }, [config]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Blank PDF</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate a new blank PDF document with your chosen page size and settings. Runs entirely in your browser.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
        {/* Page size + orientation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Size</label>
            <select
              value={config.pageSize}
              onChange={(e) => update('pageSize', e.target.value as PageSize)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orientation</label>
            <div className="flex gap-2 mt-1">
              {(['portrait', 'landscape'] as PageOrientation[]).map(o => (
                <button
                  key={o}
                  onClick={() => update('orientation', o)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors capitalize ${
                    config.orientation === o
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Page size: {width} × {height} pt
        </p>

        {/* Page count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Pages <span className="text-gray-400">(1–100)</span>
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={config.pageCount}
            onChange={(e) => update('pageCount', Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Title and Author */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (optional)</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Document title"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author (optional)</label>
            <input
              type="text"
              value={config.author}
              onChange={(e) => update('author', e.target.value)}
              placeholder="Author name"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Background color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => update('backgroundColor', e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{config.backgroundColor}</span>
            <button
              onClick={() => update('backgroundColor', '#ffffff')}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Reset to white
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={processing}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        {processing ? 'Creating PDF…' : 'Create PDF'}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      {outputBlob && (
        <PdfDownload blob={outputBlob} filename={outputFilename} label="Download PDF" />
      )}
    </div>
  );
}
