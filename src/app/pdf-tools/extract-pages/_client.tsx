'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { PageThumbnail } from '@/components/pdf/PageThumbnail';
import { formatFileSize } from '@/lib/pdf/validation';
import { parsePageRanges, extractPages } from '@/lib/pdf/extract';
import type { PdfFile } from '@/types/pdf';
import type { ExtractOutcome } from '@/lib/pdf/extract';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'done' | 'error';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExtractPagesPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set()); // 1-based
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Save
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveResult, setSaveResult] = useState<ExtractOutcome | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const revokePdfUrl = useCallback(() => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokePdfUrl(), [revokePdfUrl]);

  // ─── File load ──────────────────────────────────────────────────────────────

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    revokePdfUrl();
    setLoadError(null);
    setSaveState('idle');
    setSaveResult(null);
    setSelected(new Set());
    setRangeInput('');
    setRangeError(null);
    setPdfFile(file);
    setPageCount(0);

    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      pdfBytesRef.current = buf;
      setPdfUrl('loaded');

      import('pdf-lib').then(async ({ PDFDocument }) => {
        try {
          const doc = await PDFDocument.load(buf.slice(0), { ignoreEncryption: false });
          setPageCount(doc.getPageCount());
        } catch (err: unknown) {
          const msg = String(err);
          if (msg.includes('encrypted') || msg.includes('password')) {
            setLoadError('This PDF is password protected and cannot be processed.');
          } else {
            setLoadError('This PDF appears to be corrupted or is not a valid PDF.');
          }
        }
      });
    };
    reader.onerror = () => setLoadError('Failed to read PDF file.');
    reader.readAsArrayBuffer(file.file);
  }, [revokePdfUrl]);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    revokePdfUrl();
    pdfBytesRef.current = null;
    setPdfFile(null);
    setPdfUrl(null);
    setPageCount(0);
    setLoadError(null);
    setSelected(new Set());
    setRangeInput('');
    setRangeError(null);
    setSaveState('idle');
    setSaveResult(null);
  }, [revokePdfUrl]);

  // ─── Selection helpers ───────────────────────────────────────────────────────

  const selectAll = useCallback(() => {
    setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  }, [pageCount]);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const togglePage = useCallback((pageNum: number, e: React.MouseEvent | React.KeyboardEvent) => {
    const isMulti = 'ctrlKey' in e && (e.ctrlKey || e.metaKey);
    setSelected((prev) => {
      if (isMulti) {
        const next = new Set(prev);
        next.has(pageNum) ? next.delete(pageNum) : next.add(pageNum);
        return next;
      }
      if (prev.size === 1 && prev.has(pageNum)) return new Set();
      return new Set([pageNum]);
    });
  }, []);

  // ─── Range input ─────────────────────────────────────────────────────────────

  const applyRangeInput = useCallback(() => {
    if (!rangeInput.trim()) {
      setRangeError(null);
      return;
    }
    const result = parsePageRanges(rangeInput, pageCount);
    if ('error' in result) {
      setRangeError(result.error);
    } else {
      setRangeError(null);
      setSelected(new Set(result.pages));
    }
  }, [rangeInput, pageCount]);

  const handleRangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applyRangeInput();
  };

  // ─── Extract ─────────────────────────────────────────────────────────────────

  const handleExtract = useCallback(async () => {
    if (!pdfFile || selected.size === 0 || saveState === 'saving') return;

    setSaveState('saving');
    setSaveResult(null);
    const ac = new AbortController();
    abortRef.current = ac;

    // Sort pages in document order
    const sortedPages = [...selected].sort((a, b) => a - b);
    const outcome = await extractPages(pdfFile, sortedPages, ac.signal);
    abortRef.current = null;
    setSaveResult(outcome);
    setSaveState(outcome.success ? 'done' : 'error');
  }, [pdfFile, selected, saveState]);

  // ─── Computed ────────────────────────────────────────────────────────────────

  const sortedSelected = [...selected].sort((a, b) => a - b);
  const canExtract = selected.size > 0 && saveState !== 'saving' && pdfFile !== null;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PdfToolLayout
      title="Extract PDF Pages"
      description="Select specific pages or page ranges and extract them into a new PDF. Your file is processed entirely in your browser — never uploaded."
      breadcrumbs={[
        { label: 'PDF Tools', href: '/pdf-tools' },
        { label: 'Extract Pages' },
      ]}
    >
      {/* Success */}
      {saveState === 'done' && saveResult?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">Pages extracted successfully</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Selected</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{sortedSelected.length}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Output pages</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{saveResult.pageCount}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Size</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(saveResult.sizeBytes)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PdfDownload blob={saveResult.blob} filename={saveResult.filename} label="Download PDF" />
            <button type="button" onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Extract from another PDF
            </button>
            <button type="button" onClick={() => { setSaveState('idle'); setSaveResult(null); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Extract more pages
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {saveState === 'error' && saveResult && !saveResult.success && (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Extraction failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{saveResult.error}</p>
            <button type="button" onClick={() => { setSaveState('idle'); setSaveResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline">Try again</button>
          </div>
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Could not load PDF</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{loadError}</p>
            <button type="button" onClick={handleStartOver}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline">Try another file</button>
          </div>
        </div>
      )}

      {/* Workspace */}
      {pdfFile && !loadError && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 flex-wrap">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={pdfFile.name}>{pdfFile.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(pdfFile.size)}{pageCount > 0 ? ` · ${pageCount} pages` : ''}
              </p>
            </div>
            <button type="button" onClick={handleStartOver} aria-label="Remove file"
              className="rounded p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {pageCount > 0 && (
            <>
              {/* Range input */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-2">
                <label htmlFor="range-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page range (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => { setRangeInput(e.target.value); setRangeError(null); }}
                    onKeyDown={handleRangeKeyDown}
                    placeholder="e.g. 1-5, 8, 10-12"
                    aria-describedby={rangeError ? 'range-error' : undefined}
                    aria-invalid={!!rangeError}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={applyRangeInput}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Apply
                  </button>
                </div>
                {rangeError && (
                  <p id="range-error" role="alert" className="text-xs text-red-600 dark:text-red-400">{rangeError}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">Enter ranges like "1-5,8,10-12" or press Enter to apply</p>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1">
                  <button type="button" onClick={selectAll}
                    className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Select all
                  </button>
                  <span className="text-gray-200 dark:text-gray-700" aria-hidden="true">|</span>
                  <button type="button" onClick={deselectAll} disabled={selected.size === 0}
                    className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
                    Deselect all
                  </button>
                </div>

                {selected.size > 0 && (
                  <div className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {selected.size} page{selected.size !== 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xs text-blue-400 dark:text-blue-600 ml-1 tabular-nums">
                      ({sortedSelected.join(', ')})
                    </span>
                  </div>
                )}
              </div>

              {/* Page grid */}
              <div
                role="listbox"
                aria-label="PDF pages"
                aria-multiselectable="true"
                className="flex flex-wrap gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 min-h-[200px]"
              >
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                  <PageThumbnail
                    key={pageNum}
                    pdfData={pdfBytesRef.current!}
                    cacheKey={pdfFile!.id}
                    pageNumber={pageNum}
                    rotation={0}
                    selected={selected.has(pageNum)}
                    displayIndex={pageNum}
                    thumbWidth={100}
                    onSelect={(e) => togglePage(pageNum, e)}
                    onRotateCW={() => {}}
                    onRotateCCW={() => {}}
                    onDelete={() => {}}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                    onDragEnd={() => {}}
                  />
                ))}
              </div>

              {/* Bottom action bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Click to select · Ctrl+click for multi-select · Pages extracted in document order
                </p>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={!canExtract}
                  aria-busy={saveState === 'saving'}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {saveState === 'saving' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Extracting…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Extract {selected.size > 0 ? `${selected.size} page${selected.size !== 1 ? 's' : ''}` : 'Pages'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Loading */}
          {!pageCount && !loadError && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 justify-center">
              <svg className="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF…</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!pdfFile && (
        <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} maxFiles={1} />
      )}
    </PdfToolLayout>
  );
}
