'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { CompressOutcome, CompressionLevel } from '@/lib/pdf/compress';

// ─── Types ────────────────────────────────────────────────────────────────────

type CompressState = 'idle' | 'processing' | 'done' | 'error';

// ─── Compression level config ─────────────────────────────────────────────────

const LEVELS: {
  id: CompressionLevel;
  label: string;
  quality: string;
  reduction: string;
  desc: string;
}[] = [
  {
    id: 'low',
    label: 'Low Compression',
    quality: 'High',
    reduction: 'Low',
    desc: 'Re-saves with minimal changes. Preserves maximum quality.',
  },
  {
    id: 'recommended',
    label: 'Recommended',
    quality: 'Good',
    reduction: 'Medium',
    desc: 'Packs PDF objects into compressed streams. Best balance of size and quality.',
  },
  {
    id: 'maximum',
    label: 'Maximum Compression',
    quality: 'Good',
    reduction: 'High',
    desc: 'Compressed streams + removes metadata. Best possible size with pdf-lib.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompressPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [compressState, setCompressState] = useState<CompressState>('idle');
  const [result, setResult] = useState<CompressOutcome | null>(null);
  const [progress, setProgress] = useState('');

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setPdfFile(file);
    setCompressState('idle');
    setResult(null);
    setProgress('');
  }, []);

  const handleStartOver = useCallback(() => {
    setPdfFile(null);
    setCompressState('idle');
    setResult(null);
    setProgress('');
  }, []);

  const handleCompress = useCallback(async () => {
    if (!pdfFile || compressState === 'processing') return;
    setCompressState('processing');
    setResult(null);

    const { compressPdf } = await import('@/lib/pdf/compress');
    const outcome = await compressPdf(
      pdfFile,
      { level, removeMetadata, optimizeObjectStreams: true },
      (msg) => setProgress(msg),
    );

    setProgress('');
    setResult(outcome);
    setCompressState(outcome.success ? 'done' : 'error');
  }, [pdfFile, compressState, level, removeMetadata]);

  const canCompress = pdfFile !== null && compressState !== 'processing';

  return (
    <PdfToolLayout
      title="Compress PDF"
      description="Reduce your PDF file size using browser-based structural optimization. Your PDF is never uploaded — it stays on your device."
    >
      {/* Success */}
      {compressState === 'done' && result?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">
              {result.reductionPercent >= 1
                ? `PDF compressed — ${result.reductionPercent.toFixed(1)}% smaller`
                : 'PDF processed successfully'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Original</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(result.originalSize)}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Compressed</p>
              <p className={[
                'font-semibold',
                result.compressedSize < result.originalSize
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-900 dark:text-gray-100',
              ].join(' ')}>
                {formatFileSize(result.compressedSize)}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Reduced by</p>
              <p className={[
                'font-semibold',
                result.reductionPercent >= 1 ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
              ].join(' ')}>
                {result.compressedSize < result.originalSize
                  ? `${result.reductionPercent.toFixed(1)}%`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Note for minimal/no reduction */}
          {result.note && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-400">
              <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {result.note}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <PdfDownload
              blob={result.blob}
              filename={result.filename}
              label="Download Compressed PDF"
            />
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Compress another PDF
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {compressState === 'error' && result && !result.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3"
        >
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Compression failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{result.error}</p>
            <button
              type="button"
              onClick={() => { setCompressState('idle'); setResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* File loaded — settings */}
      {pdfFile && compressState !== 'done' && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={pdfFile.name}>{pdfFile.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{formatFileSize(pdfFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleStartOver}
              aria-label="Remove file"
              className="rounded p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Compression level */}
          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Compression level</legend>
            <div className="space-y-2">
              {LEVELS.map(({ id, label, quality, reduction, desc }) => (
                <label
                  key={id}
                  className={[
                    'flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                    level === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="compression-level"
                    value={id}
                    checked={level === id}
                    onChange={() => setLevel(id)}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                      {id === 'recommended' && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">Recommended</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    <div className="mt-1.5 flex gap-4 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Quality: <strong className="text-gray-700 dark:text-gray-300">{quality}</strong></span>
                      <span className="text-gray-500 dark:text-gray-400">Reduction: <strong className="text-gray-700 dark:text-gray-300">{reduction}</strong></span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Advanced options */}
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 list-none focus:outline-none">
              <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced options
            </summary>
            <div className="mt-3 space-y-3 pl-5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Remove document metadata</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Strips Producer, Creator, Author, Keywords fields. Saves a small amount of space.
                  </p>
                </div>
              </label>
            </div>
          </details>

          {/* What this tool does */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-medium text-gray-600 dark:text-gray-400">What this tool does</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Re-saves the PDF, removing any unreferenced/garbage objects</li>
              <li>Packs small objects into compressed cross-reference streams (PDF 1.5+)</li>
              <li>Optionally removes document metadata</li>
            </ul>
            <p className="pt-1 text-gray-400 dark:text-gray-500">
              Image-heavy PDFs with already-compressed images may see minimal reduction. Text-heavy and form-heavy PDFs typically compress most effectively.
            </p>
          </div>

          {/* Compress button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCompress}
              disabled={!canCompress}
              aria-busy={compressState === 'processing'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {compressState === 'processing' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {progress || 'Compressing…'}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Compress PDF
                </>
              )}
            </button>
            {compressState === 'processing' && (
              <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">{progress}</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!pdfFile && (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          multiple={false}
          maxFiles={1}
        />
      )}
    </PdfToolLayout>
  );
}
