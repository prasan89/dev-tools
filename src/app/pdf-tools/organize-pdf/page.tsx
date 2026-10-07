'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { PageThumbnail } from '@/components/pdf/PageThumbnail';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { OrganizerState, OrganizeOutcome } from '@/lib/pdf/organize';
import {
  buildInitialState,
  hasChanges,
  summarizeChanges,
  rotatePage,
  rotatePages,
  deletePage,
  deletePages,
  movePage,
} from '@/lib/pdf/organize';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'done' | 'error';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrganizePdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [orgState, setOrgState] = useState<OrganizerState | null>(null);
  const [history, setHistory] = useState<OrganizerState[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set()); // indices into orgState.pages
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveResult, setSaveResult] = useState<OrganizeOutcome | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragSrcRef = useRef<number | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const revokePdfUrl = useCallback(() => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokePdfUrl(), [revokePdfUrl]);

  // Push undo snapshot
  const pushHistory = useCallback((current: OrganizerState) => {
    setHistory((prev) => [...prev.slice(-19), current]); // keep up to 20
  }, []);

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    revokePdfUrl();
    setLoadError(null);
    setSaveState('idle');
    setSaveResult(null);
    setSelected(new Set());
    setHistory([]);

    const url = URL.createObjectURL(file.file);
    pdfUrlRef.current = url;
    setPdfFile(file);
    setPdfUrl(url);
    setOrgState(null);
    setPageCount(0);

    // Load page count via pdf-lib (lightweight)
    import('pdf-lib').then(async ({ PDFDocument }) => {
      try {
        const buf = await new Promise<ArrayBuffer>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as ArrayBuffer);
          r.onerror = () => rej(new Error('read failed'));
          r.readAsArrayBuffer(file.file);
        });
        const doc = await PDFDocument.load(buf, { ignoreEncryption: false });
        const count = doc.getPageCount();
        setPageCount(count);
        setOrgState(buildInitialState(count));
      } catch (err: unknown) {
        const msg = String(err);
        if (msg.includes('encrypted') || msg.includes('password')) {
          setLoadError('This PDF is password protected and cannot be organized.');
        } else {
          setLoadError('This PDF appears to be corrupted or is not a valid PDF.');
        }
      }
    });
  }, [revokePdfUrl]);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    revokePdfUrl();
    setPdfFile(null);
    setPdfUrl(null);
    setPageCount(0);
    setLoadError(null);
    setOrgState(null);
    setHistory([]);
    setSelected(new Set());
    setSaveState('idle');
    setSaveResult(null);
  }, [revokePdfUrl]);

  const handleReset = useCallback(() => {
    if (!pageCount) return;
    pushHistory(orgState!);
    setOrgState(buildInitialState(pageCount));
    setSelected(new Set());
  }, [pageCount, orgState, pushHistory]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setOrgState(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
    setSelected(new Set());
  }, [history]);

  // ─── Selection helpers ────────────────────────────────────────────────────

  const selectAll = useCallback(() => {
    if (!orgState) return;
    setSelected(new Set(orgState.pages.map((_, i) => i)));
  }, [orgState]);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const toggleSelect = useCallback((index: number, e: React.MouseEvent | React.KeyboardEvent) => {
    const isMulti = 'ctrlKey' in e && (e.ctrlKey || e.metaKey);
    setSelected((prev) => {
      if (isMulti) {
        const next = new Set(prev);
        next.has(index) ? next.delete(index) : next.add(index);
        return next;
      }
      if (prev.size === 1 && prev.has(index)) return new Set();
      return new Set([index]);
    });
  }, []);

  // ─── Rotate helpers ───────────────────────────────────────────────────────

  const rotateSingle = useCallback((index: number, delta: number) => {
    if (!orgState) return;
    pushHistory(orgState);
    setOrgState(rotatePage(orgState, index, delta));
  }, [orgState, pushHistory]);

  const rotateSelected = useCallback((delta: number) => {
    if (!orgState || selected.size === 0) return;
    pushHistory(orgState);
    setOrgState(rotatePages(orgState, [...selected], delta));
  }, [orgState, selected, pushHistory]);

  const rotateAll = useCallback((delta: number) => {
    if (!orgState) return;
    pushHistory(orgState);
    setOrgState(rotatePages(orgState, orgState.pages.map((_, i) => i), delta));
  }, [orgState, pushHistory]);

  // ─── Delete helpers ───────────────────────────────────────────────────────

  const deleteSingle = useCallback((index: number) => {
    if (!orgState) return;
    if (orgState.pages.length <= 1) return;
    pushHistory(orgState);
    setOrgState(deletePage(orgState, index));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(index);
      // adjust indices above deleted
      const adjusted = new Set<number>();
      for (const i of next) adjusted.add(i > index ? i - 1 : i);
      return adjusted;
    });
  }, [orgState, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!orgState || selected.size === 0) return;
    if (orgState.pages.length - selected.size < 1) return; // protect against emptying
    pushHistory(orgState);
    const sorted = [...selected].sort((a, b) => b - a); // delete high→low
    let st = orgState;
    for (const i of sorted) st = deletePage(st, i);
    setOrgState(st);
    setSelected(new Set());
  }, [orgState, selected, pushHistory]);

  // ─── Reorder helpers ──────────────────────────────────────────────────────

  const moveUp = useCallback((index: number) => {
    if (!orgState || index === 0) return;
    pushHistory(orgState);
    setOrgState(movePage(orgState, index, index - 1));
    setSelected((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i === index) next.add(i - 1);
        else if (i === index - 1) next.add(i + 1);
        else next.add(i);
      }
      return next;
    });
  }, [orgState, pushHistory]);

  const moveDown = useCallback((index: number) => {
    if (!orgState || index >= orgState.pages.length - 1) return;
    pushHistory(orgState);
    setOrgState(movePage(orgState, index, index + 1));
    setSelected((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i === index) next.add(i + 1);
        else if (i === index + 1) next.add(i - 1);
        else next.add(i);
      }
      return next;
    });
  }, [orgState, pushHistory]);

  // ─── Drag-and-drop ────────────────────────────────────────────────────────

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragSrcRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(index);
  };
  const onDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const src = dragSrcRef.current;
    if (src === null || src === targetIndex || !orgState) return;
    pushHistory(orgState);
    setOrgState(movePage(orgState, src, targetIndex));
    dragSrcRef.current = null;
  };
  const onDragEnd = () => { dragSrcRef.current = null; setDragOver(null); };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!pdfFile || !orgState || saveState === 'saving') return;
    setSaveState('saving');
    setSaveResult(null);

    const ac = new AbortController();
    abortRef.current = ac;

    const { buildOrganizedPdf } = await import('@/lib/pdf/organize');
    const outcome = await buildOrganizedPdf(pdfFile, orgState, ac.signal);

    abortRef.current = null;
    setSaveResult(outcome);
    setSaveState(outcome.success ? 'done' : 'error');
  }, [pdfFile, orgState, saveState]);

  // ─── Computed values ──────────────────────────────────────────────────────

  const changed = orgState ? hasChanges(orgState, pageCount) : false;
  const changeSummary = orgState ? summarizeChanges(orgState, pageCount) : '';
  const canDeleteSelected = orgState
    ? selected.size > 0 && orgState.pages.length - selected.size >= 1
    : false;
  const canSave = orgState && orgState.pages.length > 0 && saveState !== 'saving';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PdfToolLayout
      title="Organize PDF"
      description="Rotate, delete, and reorder PDF pages entirely in your browser. Your PDF is never uploaded to our servers."
      breadcrumbs={[
        { label: 'PDF Tools', href: '/pdf-tools' },
        { label: 'Organize PDF' },
      ]}
    >
      {/* Success */}
      {saveState === 'done' && saveResult?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">PDF updated successfully</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pages</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{saveResult.pageCount}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">File size</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(saveResult.sizeBytes)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PdfDownload blob={saveResult.blob} filename={saveResult.filename} label="Download PDF" />
            <button type="button" onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Organize another PDF
            </button>
            <button type="button" onClick={() => { setSaveState('idle'); setSaveResult(null); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Continue editing
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
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Failed to save PDF</p>
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
      {pdfFile && orgState && !loadError && (
        <div className="space-y-4">
          {/* File info + change summary */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 flex-wrap">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={pdfFile.name}>{pdfFile.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(pdfFile.size)} · {changed ? (
                  <span className="text-amber-600 dark:text-amber-400">{changeSummary}</span>
                ) : (
                  <span>{pageCount} pages · No changes</span>
                )}
              </p>
            </div>
            <button type="button" onClick={handleStartOver} aria-label="Remove file"
              className="rounded p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Selection */}
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

            {/* Rotate selection / all */}
            {selected.size > 0 ? (
              <div className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 px-2 py-1">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300 pr-1">
                  {selected.size} selected
                </span>
                <button type="button" onClick={() => rotateSelected(90)} title="Rotate selection 90° CW"
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  Rotate ↻
                </button>
                <button type="button" onClick={() => rotateSelected(-90)} title="Rotate selection 90° CCW"
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  ↺
                </button>
                <button type="button" onClick={deleteSelected} disabled={!canDeleteSelected}
                  title={canDeleteSelected ? 'Delete selected pages' : 'Cannot delete all pages'}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition-colors">
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1">
                <button type="button" onClick={() => rotateAll(90)} title="Rotate all pages 90° CW"
                  className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Rotate all ↻
                </button>
                <button type="button" onClick={() => rotateAll(-90)} title="Rotate all pages 90° CCW"
                  className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  ↺
                </button>
              </div>
            )}

            {/* Undo / Reset */}
            <button type="button" onClick={handleUndo} disabled={history.length === 0}
              title="Undo last action"
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
              ← Undo
            </button>
            {changed && (
              <button type="button" onClick={handleReset}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Reset all
              </button>
            )}
          </div>

          {/* Page grid */}
          <div
            role="listbox"
            aria-label="PDF pages"
            aria-multiselectable="true"
            className="flex flex-wrap gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 min-h-[200px]"
          >
            {orgState.pages.map((page, listIndex) => (
              <div key={`${page.originalIndex}-${listIndex}`} className="relative">
                {/* Move arrows — shown on keyboard focus for accessibility */}
                <div className="absolute -top-2 left-0 right-0 hidden focus-within:flex justify-center gap-1 z-10">
                  <button type="button" onClick={() => moveUp(listIndex)} disabled={listIndex === 0}
                    aria-label={`Move page ${listIndex + 1} left`}
                    className="rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-xs disabled:opacity-30 shadow-sm">
                    ←
                  </button>
                  <button type="button" onClick={() => moveDown(listIndex)} disabled={listIndex === orgState.pages.length - 1}
                    aria-label={`Move page ${listIndex + 1} right`}
                    className="rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-xs disabled:opacity-30 shadow-sm">
                    →
                  </button>
                  <button type="button" onClick={() => rotateSingle(listIndex, 90)}
                    aria-label={`Rotate page ${listIndex + 1} clockwise`}
                    className="rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-xs shadow-sm">
                    ↻
                  </button>
                </div>

                <PageThumbnail
                  pdfUrl={pdfUrl!}
                  pageNumber={page.originalIndex + 1}
                  rotation={page.rotation}
                  selected={selected.has(listIndex)}
                  displayIndex={listIndex + 1}
                  thumbWidth={110}
                  onSelect={(e) => toggleSelect(listIndex, e)}
                  onRotateCW={() => rotateSingle(listIndex, 90)}
                  onRotateCCW={() => rotateSingle(listIndex, -90)}
                  onDelete={() => deleteSingle(listIndex)}
                  onDragStart={onDragStart(listIndex)}
                  onDragOver={onDragOver(listIndex)}
                  onDrop={onDrop(listIndex)}
                  onDragEnd={onDragEnd}
                  isDragOver={dragOver === listIndex}
                />
              </div>
            ))}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              {orgState.pages.length} page{orgState.pages.length !== 1 ? 's' : ''}
              {selected.size > 0 && ` · ${selected.size} selected`}
              {' · '}Drag to reorder · Click to select · Ctrl+click for multi-select
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                aria-busy={saveState === 'saving'}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {saveState === 'saving' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building PDF…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {changed ? 'Save & Download' : 'Download PDF'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {pdfFile && !orgState && !loadError && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 justify-center">
          <svg className="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF…</p>
        </div>
      )}

      {/* Empty state */}
      {!pdfFile && (
        <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} maxFiles={1} />
      )}
    </PdfToolLayout>
  );
}
