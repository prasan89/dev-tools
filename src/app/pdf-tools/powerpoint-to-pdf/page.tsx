'use client';

import { useState, useCallback } from 'react';
import { convertPptxToPdf, defaultPptxToPdfOptions } from '@/lib/pdf/powerpointToPdf';
import type { PptxToPdfOptions } from '@/lib/pdf/powerpointToPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

export default function PowerpointToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<PptxToPdfOptions>(defaultPptxToPdfOptions());
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && /\.pptx?$/i.test(f.name)) { setFile(f); setBlob(null); setStatus('idle'); }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setBlob(null); setStatus('idle'); }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus('processing');
    setError('');
    const result = await convertPptxToPdf(file, options);
    if (result.success && result.outputFile) {
      setBlob(result.outputFile.blob);
      setFilename(result.outputFile.filename);
      setStatus('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setStatus('error');
    }
  }, [file, options]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PowerPoint to PDF</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Convert PPTX presentations to PDF locally in your browser. No upload required.
      </p>

      <aside
        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400"
        role="note"
      >
        <strong>Text-based conversion.</strong> Images, animations, transitions, SmartArt, charts
        and advanced effects are not supported. Text layout is approximated from slide XML.
      </aside>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-10 text-center cursor-pointer hover:border-blue-400 transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Drop PPTX file or click to browse"
        onClick={() => document.getElementById('pptx-input')?.click()}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('pptx-input')?.click()}
      >
        <input
          id="pptx-input"
          type="file"
          accept=".ppt,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={handleFileInput}
          aria-label="Select PPTX file"
        />
        {file ? (
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{file.name}</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop a <strong>.pptx</strong> file here, or click to browse
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Slide size
          <select
            className="ml-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            value={options.pageSize}
            onChange={(e) => setOptions((o) => ({ ...o, pageSize: e.target.value as 'widescreen' | 'standard' }))}
            aria-label="Slide page size"
          >
            <option value="widescreen">Widescreen (16:9)</option>
            <option value="standard">Standard (4:3)</option>
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Font size
          <input
            type="number"
            min={8}
            max={48}
            value={options.fontSize}
            onChange={(e) => setOptions((o) => ({ ...o, fontSize: Math.max(8, Math.min(48, Number(e.target.value))) }))}
            className="ml-2 w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            aria-label="Font size"
          />
        </label>
      </div>

      <button
        onClick={handleConvert}
        disabled={!file || status === 'processing'}
        className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        aria-busy={status === 'processing'}
      >
        {status === 'processing' ? 'Converting…' : 'Convert to PDF'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      {status === 'done' && blob && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 space-y-3">
          <p className="text-sm text-green-800 dark:text-green-400 font-medium">Conversion complete!</p>
          <PdfDownload blob={blob} filename={filename} />
        </div>
      )}

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-sm space-y-2">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">About this tool</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Parses your PPTX file locally and generates a PDF with text content extracted from each slide.
          One PDF page is created per slide.
        </p>
        <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 text-xs space-y-1">
          <li>Text, headings, and basic formatting preserved</li>
          <li>Images, shapes, charts and animations not supported</li>
          <li>Your file never leaves your device</li>
        </ul>
      </section>
    </div>
  );
}
