'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import {
  convertToHandwritten,
  DEFAULT_OPTIONS,
  HANDWRITING_FONTS,
  type HandwrittenOptions,
  type HandwritingFont,
  type PaperBackground,
} from '@/lib/pdf/handwrittenPdf';

type PageState = 'idle' | 'converting' | 'done' | 'error';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PAPER_OPTIONS: { value: PaperBackground; label: string }[] = [
  { value: 'ruled',  label: 'Ruled (lined)' },
  { value: 'plain',  label: 'Plain (blank)' },
  { value: 'grid',   label: 'Grid' },
];

const INK_PRESETS = [
  { label: 'Dark Navy',  value: '#1a1a2e' },
  { label: 'Black',      value: '#111111' },
  { label: 'Blue Ink',   value: '#1a3a6b' },
  { label: 'Dark Green', value: '#1a3a1a' },
  { label: 'Dark Red',   value: '#7a1a1a' },
];

export default function PdfToHandwrittenPage() {
  const [state, setState] = useState<PageState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string; pageCount: number; sizeBytes: number } | null>(null);
  const [opts, setOpts] = useState<HandwrittenOptions>(DEFAULT_OPTIONS);
  const [file, setFile] = useState<PdfFile | null>(null);

  const set = <K extends keyof HandwrittenOptions>(k: K, v: HandwrittenOptions[K]) =>
    setOpts(o => ({ ...o, [k]: v }));

  const handleFiles = useCallback((files: PdfFile[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setState('converting');
    setProgress(0);
    setError(null);
    setResult(null);
    const outcome = await convertToHandwritten(file, opts, setProgress);
    if (outcome.success) {
      setResult({ blob: outcome.blob, filename: outcome.filename, pageCount: outcome.pageCount, sizeBytes: outcome.sizeBytes });
      setState('done');
    } else {
      setError(outcome.error);
      setState('error');
    }
  }, [file, opts]);

  const handleReset = useCallback(() => {
    setFile(null);
    setState('idle');
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to Handwritten</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert your PDF text into a handwritten-style document. Runs entirely in your browser — nothing is uploaded.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-4 py-2.5 text-sm text-green-700 dark:text-green-400">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
        Your PDF is processed locally and is never uploaded to our servers.
      </div>

      {/* Drop zone */}
      {!file && <PdfDropzone onFilesSelected={handleFiles} maxFiles={1} />}

      {/* File loaded — options + convert */}
      {file && state !== 'done' && (
        <div className="space-y-5">
          {/* File badge */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.file.name}</span>
              <span className="text-xs text-gray-400">({formatSize(file.file.size)})</span>
            </div>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-4 shrink-0">Remove</button>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {/* Font */}
            <div className="grid grid-cols-3 gap-2 p-4">
              <label className="col-span-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Handwriting Font</label>
              {(Object.keys(HANDWRITING_FONTS) as HandwritingFont[]).map(f => (
                <button
                  key={f}
                  onClick={() => set('font', f)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${opts.font === f ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'}`}
                >
                  {HANDWRITING_FONTS[f].label}
                </button>
              ))}
            </div>

            {/* Paper */}
            <div className="grid grid-cols-3 gap-2 p-4">
              <label className="col-span-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Paper Style</label>
              {PAPER_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => set('paper', p.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${opts.paper === p.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Ink color */}
            <div className="p-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ink Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {INK_PRESETS.map(p => (
                  <button
                    key={p.value}
                    title={p.label}
                    onClick={() => set('inkColor', p.value)}
                    style={{ background: p.value }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${opts.inkColor === p.value ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                  />
                ))}
                <input
                  type="color"
                  value={opts.inkColor}
                  onChange={e => set('inkColor', e.target.value)}
                  className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer p-0"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Size & spacing */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Font size (pt)</label>
                <input
                  type="range" min={10} max={28} step={1} value={opts.fontSize}
                  onChange={e => set('fontSize', Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-xs text-gray-500">{opts.fontSize} pt</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Line spacing</label>
                <input
                  type="range" min={1.2} max={3.0} step={0.1} value={opts.lineSpacing}
                  onChange={e => set('lineSpacing', Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-xs text-gray-500">{opts.lineSpacing.toFixed(1)}×</span>
              </div>
            </div>
          </div>

          {/* Scanned PDF warning */}
          <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
            Note: scanned PDFs without selectable text will produce blank pages. Use OCR first to extract text.
          </p>

          {/* Convert button */}
          {state === 'converting' ? (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-center text-gray-500">Converting… {progress}%</p>
            </div>
          ) : (
            <button
              onClick={handleConvert}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm transition-colors"
            >
              Convert to Handwritten PDF
            </button>
          )}

          {state === 'error' && error && (
            <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {state === 'done' && result && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-4">
          <div className="text-green-600 dark:text-green-400 font-medium" role="status">✓ Handwritten PDF ready</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {result.pageCount} page{result.pageCount !== 1 ? 's' : ''} · {formatSize(result.sizeBytes)}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <PdfDownload blob={result.blob} filename={result.filename} />
            <button onClick={handleReset} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Convert another
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Frequently asked questions</h2>
        {[
          ['How does this work?', 'The tool extracts text from your PDF using PDF.js, then re-renders it using a real handwriting font embedded into a new PDF via pdf-lib. Everything runs in your browser.'],
          ['Will my formatting be preserved?', 'The tool preserves text content and line structure. Complex layouts like tables, columns, and images are not reproduced — only the text flow.'],
          ['Why are some pages blank?', 'Scanned PDFs don\'t contain selectable text. Run your PDF through the OCR tool first, then convert that result.'],
          ['Can I use this for large documents?', 'Yes — pages are processed one at a time so memory usage stays bounded. Very large documents may take a moment.'],
        ].map(([q, a]) => (
          <details key={q} className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 list-none flex items-center justify-between">
              {q}
              <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 pl-2">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
