'use client';

import { useCallback, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { SplitOutcome, SplitPartResult } from '@/lib/pdf/split';

// ─── Types ────────────────────────────────────────────────────────────────────

type SplitMode = 'range' | 'every-page' | 'multi-range' | 'visual';
type SplitState = 'idle' | 'processing' | 'done' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PageThumbnailGrid({
  totalPages,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  totalPages: number;
  selected: Set<number>;
  onToggle: (page: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {selected.size > 0
            ? `${selected.size} page${selected.size !== 1 ? 's' : ''} selected`
            : 'No pages selected'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select all
          </button>
          <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
          >
            Deselect all
          </button>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}
        role="group"
        aria-label="Page selection grid"
      >
        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          const isSelected = selected.has(page);
          return (
            <button
              key={page}
              type="button"
              onClick={() => onToggle(page)}
              aria-label={`Page ${page}${isSelected ? ', selected' : ''}`}
              aria-pressed={isSelected}
              className={[
                'flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500',
              ].join(' ')}
            >
              <svg
                className={`h-5 w-4 ${isSelected ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 16 20"
                aria-hidden="true"
              >
                <path d="M10 0H2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V6l-6-6zm-1 1.5L14.5 7H9V1.5z" />
              </svg>
              <span>{page}</span>
              {isSelected && (
                <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiRangeInputs({
  ranges,
  onChange,
  onAdd,
  onRemove,
  totalPages,
}: {
  ranges: string[];
  onChange: (i: number, val: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  totalPages: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Each range creates a separate PDF file. Example: <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">1-3</code>
      </p>
      {ranges.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-xs font-medium text-blue-600 dark:text-blue-400">
            {i + 1}
          </span>
          <input
            type="text"
            value={r}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={`e.g. ${i === 0 ? '1-3' : i === 1 ? '4-7' : '8-' + totalPages}`}
            aria-label={`Page range ${i + 1}`}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {ranges.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove range ${i + 1}`}
              className="rounded p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add another range
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SplitPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mode, setMode] = useState<SplitMode>('range');
  const [splitState, setSplitState] = useState<SplitState>('idle');
  const [splitResult, setSplitResult] = useState<SplitOutcome | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Range mode state
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState('');

  // Multi-range mode state
  const [multiRanges, setMultiRanges] = useState<string[]>(['', '']);

  // Visual selection mode state
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Download URLs for cleanup
  const blobUrlsRef = useRef<string[]>([]);

  const cleanupBlobUrls = useCallback(() => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
  }, []);

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setPdfFile(file);
    setTotalPages(0);
    setSplitState('idle');
    setSplitResult(null);
    setRangeInput('');
    setRangeError('');
    setMultiRanges(['', '']);
    setSelectedPages(new Set());
    cleanupBlobUrls();

    // Read page count
    import('pdf-lib').then(async ({ PDFDocument }) => {
      try {
        const buf = await new Promise<ArrayBuffer>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as ArrayBuffer);
          r.onerror = () => rej(new Error('read failed'));
          r.readAsArrayBuffer(file.file);
        });
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setTotalPages(count);
      } catch {
        setTotalPages(0);
      }
    });
  }, [cleanupBlobUrls]);

  const handleStartOver = useCallback(() => {
    setPdfFile(null);
    setTotalPages(0);
    setSplitState('idle');
    setSplitResult(null);
    setRangeInput('');
    setRangeError('');
    setMultiRanges(['', '']);
    setSelectedPages(new Set());
    cleanupBlobUrls();
  }, [cleanupBlobUrls]);

  const handleSplit = useCallback(async () => {
    if (!pdfFile || splitState === 'processing') return;
    setRangeError('');
    setSplitState('processing');
    setSplitResult(null);
    cleanupBlobUrls();

    const { extractPageRange, splitEveryPage, splitByRanges, extractSelectedPages } =
      await import('@/lib/pdf/split');

    let result: SplitOutcome;

    if (mode === 'range') {
      setProgress('Extracting pages…');
      result = await extractPageRange(pdfFile, rangeInput, totalPages);
    } else if (mode === 'every-page') {
      setProgress(`Splitting ${totalPages} pages…`);
      result = await splitEveryPage(pdfFile, totalPages);
    } else if (mode === 'multi-range') {
      const nonEmpty = multiRanges.filter((r) => r.trim());
      setProgress(`Creating ${nonEmpty.length} part${nonEmpty.length !== 1 ? 's' : ''}…`);
      result = await splitByRanges(pdfFile, nonEmpty, totalPages);
    } else {
      // visual
      const sorted = Array.from(selectedPages).sort((a, b) => a - b);
      setProgress(`Extracting ${sorted.length} selected page${sorted.length !== 1 ? 's' : ''}…`);
      result = await extractSelectedPages(pdfFile, sorted);
    }

    setProgress('');
    setSplitResult(result);
    setSplitState(result.success ? 'done' : 'error');
  }, [pdfFile, splitState, mode, rangeInput, totalPages, multiRanges, selectedPages, cleanupBlobUrls]);

  const handleDownloadAll = useCallback(async () => {
    if (!splitResult?.success) return;
    const parts = splitResult.parts;

    if (parts.length === 1) {
      // single file — direct download
      const url = URL.createObjectURL(parts[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = parts[0].filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    // Multiple files — generate ZIP client-side
    setProgress('Creating ZIP…');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const part of parts) {
        const arrayBuffer = await new Promise<ArrayBuffer>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as ArrayBuffer);
          reader.onerror = () => rej(new Error('read failed'));
          reader.readAsArrayBuffer(part.blob);
        });
        zip.file(part.filename, arrayBuffer);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 3 } });
      const baseName = pdfFile?.name.replace(/\.pdf$/i, '') ?? 'split';
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_split.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      // fallback: download individually
      for (const part of parts) {
        const url = URL.createObjectURL(part.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = part.filename;
        a.click();
        await new Promise((r) => setTimeout(r, 200));
        URL.revokeObjectURL(url);
      }
    } finally {
      setProgress('');
    }
  }, [splitResult, pdfFile]);

  // Visual selection helpers
  const togglePage = useCallback((page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)));
  }, [totalPages]);

  const deselectAll = useCallback(() => setSelectedPages(new Set()), []);

  // Multi-range helpers
  const updateMultiRange = useCallback((i: number, val: string) => {
    setMultiRanges((prev) => { const next = [...prev]; next[i] = val; return next; });
  }, []);
  const addMultiRange = useCallback(() => setMultiRanges((prev) => [...prev, '']), []);
  const removeMultiRange = useCallback((i: number) => {
    setMultiRanges((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const canSplit =
    pdfFile !== null &&
    totalPages > 0 &&
    splitState !== 'processing' &&
    (mode !== 'range' || rangeInput.trim() !== '') &&
    (mode !== 'multi-range' || multiRanges.some((r) => r.trim())) &&
    (mode !== 'visual' || selectedPages.size > 0);

  const MODE_TABS: { id: SplitMode; label: string; desc: string }[] = [
    { id: 'range', label: 'Extract Range', desc: 'Get specific pages into one PDF' },
    { id: 'every-page', label: 'Split All Pages', desc: 'One PDF file per page' },
    { id: 'multi-range', label: 'Multiple Parts', desc: 'Define custom part boundaries' },
    { id: 'visual', label: 'Visual Select', desc: 'Click pages to include' },
  ];

  return (
    <PdfToolLayout
      title="Split PDF"
      description="Extract pages, split by range, or separate every page — all in your browser. No upload required."
    >
      {/* Success */}
      {splitState === 'done' && splitResult?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">
              PDF split successfully — {splitResult.parts.length} file{splitResult.parts.length !== 1 ? 's' : ''} created
            </p>
          </div>

          {/* Download all */}
          {splitResult.parts.length > 1 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={!!progress}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-busy={!!progress}
            >
              {progress ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {progress}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All ({splitResult.parts.length} files as ZIP)
                </>
              )}
            </button>
          )}

          {/* Individual parts */}
          <div className="space-y-2">
            {splitResult.parts.map((part, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
              >
                <svg className="h-4 w-4 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{part.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {part.pageCount} page{part.pageCount !== 1 ? 's' : ''} · {formatFileSize(part.sizeBytes)}
                  </p>
                </div>
                <PdfDownload blob={part.blob} filename={part.filename} label="Download" />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Split another PDF
          </button>
        </div>
      )}

      {/* Error */}
      {splitState === 'error' && splitResult && !splitResult.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3"
        >
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Split failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{splitResult.error}</p>
            <button
              type="button"
              onClick={() => { setSplitState('idle'); setSplitResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* File loaded UI */}
      {pdfFile && splitState !== 'done' && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={pdfFile.name}>{pdfFile.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(pdfFile.size)}
                {totalPages > 0 && ` · ${totalPages} page${totalPages !== 1 ? 's' : ''}`}
                {totalPages === 0 && ' · Reading…'}
              </p>
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

          {/* Mode tabs */}
          {totalPages > 0 && (
            <div>
              <div
                className="flex flex-wrap gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1"
                role="tablist"
                aria-label="Split mode"
              >
                {MODE_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={mode === id}
                    onClick={() => { setMode(id); setSplitResult(null); setSplitState('idle'); }}
                    className={[
                      'flex-1 min-w-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                      mode === id
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Mode description */}
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {MODE_TABS.find((m) => m.id === mode)?.desc}
              </p>
            </div>
          )}

          {/* Mode-specific controls */}
          {totalPages > 0 && (
            <div className="space-y-3">
              {mode === 'range' && (
                <div>
                  <label htmlFor="range-input" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Page range
                  </label>
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => { setRangeInput(e.target.value); setRangeError(''); }}
                    placeholder={`e.g. 1-5, 8, 10-12 (max ${totalPages})`}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    aria-describedby={rangeError ? 'range-error' : undefined}
                  />
                  {rangeError && (
                    <p id="range-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{rangeError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Use commas to separate pages/ranges. e.g. <code className="font-mono">1-5, 8, 10-12</code>
                  </p>
                </div>
              )}

              {mode === 'every-page' && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This will create <strong>{totalPages}</strong> individual PDF files, one per page.
                  </p>
                  {totalPages > 20 && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Large split ({totalPages} files) — processing may take a moment.
                    </p>
                  )}
                </div>
              )}

              {mode === 'multi-range' && (
                <MultiRangeInputs
                  ranges={multiRanges}
                  onChange={updateMultiRange}
                  onAdd={addMultiRange}
                  onRemove={removeMultiRange}
                  totalPages={totalPages}
                />
              )}

              {mode === 'visual' && (
                <PageThumbnailGrid
                  totalPages={totalPages}
                  selected={selectedPages}
                  onToggle={togglePage}
                  onSelectAll={selectAll}
                  onDeselectAll={deselectAll}
                />
              )}
            </div>
          )}

          {/* Split button */}
          {totalPages > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSplit}
                disabled={!canSplit}
                aria-busy={splitState === 'processing'}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {splitState === 'processing' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {progress || 'Processing…'}
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Split PDF
                  </>
                )}
              </button>
              {splitState === 'processing' && (
                <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">{progress}</p>
              )}
            </div>
          )}

          {totalPages === 0 && pdfFile && (
            <p className="text-xs text-gray-400 dark:text-gray-500" aria-live="polite">Reading PDF…</p>
          )}
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
