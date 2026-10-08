'use client';

import { useCallback, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type {
  ConvertOutcome,
  ImageFormat,
  ResolutionPreset,
  ImagePartResult,
} from '@/lib/pdf/toImage';
import { RESOLUTION_SCALES } from '@/lib/pdf/toImage';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageSelectionMode = 'all' | 'range' | 'visual';
type ConvertState = 'idle' | 'loading-doc' | 'converting' | 'zipping' | 'done' | 'error';

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageGrid({
  totalPages,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  totalPages: number;
  selected: Set<number>;
  onToggle: (p: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selected.size > 0
            ? `${selected.size} page${selected.size !== 1 ? 's' : ''} selected`
            : 'Click pages to select'}
        </span>
        <div className="flex gap-3">
          <button type="button" onClick={onSelectAll} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Select all</button>
          <button type="button" onClick={onDeselectAll} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">Deselect all</button>
        </div>
      </div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}
        role="group"
        aria-label="Page selection"
      >
        {Array.from({ length: totalPages }, (_, i) => {
          const p = i + 1;
          const sel = selected.has(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => onToggle(p)}
              aria-label={`Page ${p}${sel ? ', selected' : ''}`}
              aria-pressed={sel}
              className={[
                'flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 py-2 px-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                sel
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500',
              ].join(' ')}
            >
              <svg className={`h-4 w-3 ${sel ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 12 16" aria-hidden="true">
                <path d="M8 0H1a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V4L8 0zm-.5 1.5L10.5 5H7.5V1.5z" />
              </svg>
              <span>{p}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PdfToJpgPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // Format/quality/resolution
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(0.85);
  const [resolution, setResolution] = useState<ResolutionPreset>('medium');
  const [customScale, setCustomScale] = useState(2.0);

  // Page selection
  const [selectionMode, setSelectionMode] = useState<PageSelectionMode>('all');
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [visualSelected, setVisualSelected] = useState<Set<number>>(new Set());

  // Conversion state
  const [convertState, setConvertState] = useState<ConvertState>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<ConvertOutcome | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getScale = useCallback((): number => {
    if (resolution === 'custom') return Math.max(0.5, Math.min(4, customScale));
    return RESOLUTION_SCALES[resolution];
  }, [resolution, customScale]);

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setPdfFile(file);
    setTotalPages(0);
    setConvertState('loading-doc');
    setResult(null);
    setRangeInput('');
    setRangeError('');
    setVisualSelected(new Set());

    // Determine page count via pdf-lib (lighter than pdfjs for metadata)
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
        setConvertState('idle');
      } catch {
        setTotalPages(0);
        setConvertState('idle');
      }
    });
  }, []);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPdfFile(null);
    setTotalPages(0);
    setConvertState('idle');
    setResult(null);
    setRangeInput('');
    setRangeError('');
    setVisualSelected(new Set());
    setProgress({ done: 0, total: 0 });
    setProgressMsg('');
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const resolvePages = useCallback((): number[] | null => {
    if (selectionMode === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (selectionMode === 'visual') {
      if (visualSelected.size === 0) return null;
      return [...visualSelected].sort((a, b) => a - b);
    }
    // range
    return null; // resolved inside handleConvert after parsePageRanges
  }, [selectionMode, totalPages, visualSelected]);

  const handleConvert = useCallback(async () => {
    if (!pdfFile || totalPages === 0 || convertState === 'converting') return;
    setRangeError('');

    // Resolve page list
    let pages: number[];
    if (selectionMode === 'all') {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (selectionMode === 'visual') {
      pages = [...visualSelected].sort((a, b) => a - b);
      if (pages.length === 0) {
        setRangeError('Select at least one page.');
        return;
      }
    } else {
      const { parsePageRanges, rangesToIndices } = await import('@/lib/pdf/split');
      const parsed = parsePageRanges(rangeInput, totalPages);
      if (!parsed.ok) { setRangeError(parsed.error); return; }
      pages = rangesToIndices(parsed.ranges).map((i) => i + 1);
    }

    setConvertState('converting');
    setResult(null);
    setProgress({ done: 0, total: pages.length });
    setProgressMsg('Preparing PDF…');

    const ac = new AbortController();
    abortRef.current = ac;

    const { convertPdfToImages } = await import('@/lib/pdf/toImage');
    const outcome = await convertPdfToImages(
      pdfFile,
      { format, quality, scale: getScale(), pages },
      (done, total) => {
        setProgress({ done, total });
        setProgressMsg(`Rendering page ${done} of ${total}…`);
      },
      ac.signal,
    );

    abortRef.current = null;
    setProgressMsg('');
    setResult(outcome);
    setConvertState(outcome.success ? 'done' : 'error');
  }, [
    pdfFile, totalPages, convertState, selectionMode, visualSelected,
    rangeInput, format, quality, getScale,
  ]);

  const handleDownloadAll = useCallback(async (parts: ImagePartResult[]) => {
    if (parts.length === 1) {
      const url = URL.createObjectURL(parts[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = parts[0].filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    setConvertState('zipping');
    setProgressMsg('Creating ZIP…');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const part of parts) {
        const ab = await new Promise<ArrayBuffer>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as ArrayBuffer);
          reader.onerror = () => rej(new Error('read failed'));
          reader.readAsArrayBuffer(part.blob);
        });
        zip.file(part.filename, ab);
      }
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const base = pdfFile?.name.replace(/\.pdf$/i, '') ?? 'pages';
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-images.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      void ext;
    } finally {
      setConvertState('done');
      setProgressMsg('');
    }
  }, [format, pdfFile]);

  const canConvert =
    pdfFile !== null &&
    totalPages > 0 &&
    convertState !== 'converting' &&
    convertState !== 'loading-doc' &&
    (selectionMode !== 'range' || rangeInput.trim() !== '') &&
    (selectionMode !== 'visual' || visualSelected.size > 0);

  const isProcessing = convertState === 'converting' || convertState === 'loading-doc' || convertState === 'zipping';

  const toggleVisual = useCallback((p: number) => {
    setVisualSelected((prev) => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }, []);
  const selectAll = useCallback(() => setVisualSelected(new Set(Array.from({ length: totalPages }, (_, i) => i + 1))), [totalPages]);
  const deselectAll = useCallback(() => setVisualSelected(new Set()), []);

  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const mimeLabel = format === 'jpeg' ? 'JPG' : 'PNG';

  return (
    <PdfToolLayout
      title="PDF to JPG / PNG"
      description="Convert PDF pages to JPG or PNG images entirely in your browser. No upload, no server — your PDF stays on your device."
    >
      {/* Success */}
      {convertState === 'done' && result?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">
              {result.parts.length} {mimeLabel} image{result.parts.length !== 1 ? 's' : ''} created
            </p>
          </div>

          {result.parts.length > 1 && (
            <button
              type="button"
              onClick={() => handleDownloadAll(result.parts)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All ({result.parts.length} files as ZIP)
            </button>
          )}

          <div className="space-y-2">
            {result.parts.map((part) => (
              <div
                key={part.pageNumber}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
              >
                <svg className="h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{part.filename}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {part.width}×{part.height}px · {formatFileSize(part.sizeBytes)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const url = URL.createObjectURL(part.blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = part.filename; a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Convert another PDF
          </button>
        </div>
      )}

      {/* Error */}
      {convertState === 'error' && result && !result.success && (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Conversion failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{result.error}</p>
            <button type="button" onClick={() => { setConvertState('idle'); setResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* File loaded */}
      {pdfFile && convertState !== 'done' && (
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
                {convertState === 'loading-doc' && ' · Reading…'}
              </p>
            </div>
            <button type="button" onClick={handleStartOver} aria-label="Remove file"
              className="rounded p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {totalPages > 0 && (
            <>
              {/* Format */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Output format</legend>
                <div className="flex gap-2">
                  {(['jpeg', 'png'] as const).map((f) => (
                    <label key={f} className={[
                      'flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 cursor-pointer transition-colors',
                      format === f
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600',
                    ].join(' ')}>
                      <input type="radio" name="format" value={f} checked={format === f}
                        onChange={() => setFormat(f)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{f === 'jpeg' ? 'JPG' : 'PNG'}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{f === 'jpeg' ? 'Smaller files, lossy' : 'Lossless, transparent support'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Quality (JPG only) */}
              {format === 'jpeg' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    JPEG quality — {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range" min={10} max={100} step={5}
                    value={Math.round(quality * 100)}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                    aria-label={`JPEG quality ${Math.round(quality * 100)}%`}
                    className="w-full max-w-sm accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 max-w-sm mt-0.5">
                    <span>Smaller file</span><span>Better quality</span>
                  </div>
                </div>
              )}

              {/* Resolution */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resolution</legend>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high', 'custom'] as const).map((r) => (
                    <label key={r} className={[
                      'flex items-center gap-2 rounded-lg border-2 px-3 py-2 cursor-pointer text-sm transition-colors',
                      resolution === r
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-gray-900 dark:text-gray-100'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    ].join(' ')}>
                      <input type="radio" name="resolution" value={r} checked={resolution === r}
                        onChange={() => setResolution(r)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium capitalize">{r}</span>
                      {r !== 'custom' && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({Math.round(RESOLUTION_SCALES[r] * 72)} dpi)
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                {resolution === 'custom' && (
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="custom-scale" className="text-xs text-gray-600 dark:text-gray-400 shrink-0">Scale:</label>
                    <input
                      id="custom-scale"
                      type="number" min={0.5} max={4} step={0.5}
                      value={customScale}
                      onChange={(e) => setCustomScale(parseFloat(e.target.value) || 1)}
                      className="w-20 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">× (max 4)</span>
                  </div>
                )}
              </fieldset>

              {/* Page selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pages to convert</p>
                <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-3" role="tablist" aria-label="Page selection mode">
                  {([
                    { id: 'all' as const, label: 'All pages' },
                    { id: 'range' as const, label: 'Range' },
                    { id: 'visual' as const, label: 'Visual select' },
                  ]).map(({ id, label }) => (
                    <button key={id} type="button" role="tab" aria-selected={selectionMode === id}
                      onClick={() => { setSelectionMode(id); setRangeError(''); }}
                      className={[
                        'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                        selectionMode === id
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                      ].join(' ')}>
                      {label}
                    </button>
                  ))}
                </div>

                {selectionMode === 'all' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">All {totalPages} pages will be converted.</p>
                )}

                {selectionMode === 'range' && (
                  <div>
                    <label htmlFor="page-range" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Page range
                    </label>
                    <input
                      id="page-range"
                      type="text" value={rangeInput}
                      onChange={(e) => { setRangeInput(e.target.value); setRangeError(''); }}
                      placeholder={`e.g. 1-3, 5, 8-10 (max ${totalPages})`}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      aria-describedby={rangeError ? 'range-err' : undefined}
                    />
                    {rangeError && <p id="range-err" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{rangeError}</p>}
                  </div>
                )}

                {selectionMode === 'visual' && (
                  <PageGrid
                    totalPages={totalPages}
                    selected={visualSelected}
                    onToggle={toggleVisual}
                    onSelectAll={selectAll}
                    onDeselectAll={deselectAll}
                  />
                )}
              </div>

              {/* Convert button */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!canConvert}
                  aria-busy={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {progressMsg || 'Processing…'}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Convert to {mimeLabel.toUpperCase()}
                    </>
                  )}
                </button>

                {convertState === 'converting' && (
                  <>
                    {progress.total > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                        {progress.done}/{progress.total} pages
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
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
