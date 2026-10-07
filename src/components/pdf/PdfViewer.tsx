'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile, PdfProcessingState, PdfViewerState } from '@/types/pdf';

// pdf.js is loaded lazily — only when this component mounts
type PdfjsLib = typeof import('pdfjs-dist');
type PDFDocumentProxy = import('pdfjs-dist').PDFDocumentProxy;
type PDFPageProxy = import('pdfjs-dist').PDFPageProxy;
type PDFDocumentLoadingTask = import('pdfjs-dist').PDFDocumentLoadingTask;

let pdfjsCache: PdfjsLib | null = null;

async function loadPdfjs(): Promise<PdfjsLib> {
  if (pdfjsCache) return pdfjsCache;
  const pdfjs = await import('pdfjs-dist');
  // Worker served from /public — same origin, no CSP issues, no eval needed
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  pdfjsCache = pdfjs;
  return pdfjs;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1.0;

interface PdfViewerProps {
  pdfFile: PdfFile;
  onClose?: () => void;
  onPageCountLoaded?: (count: number) => void;
  className?: string;
}

export function PdfViewer({
  pdfFile,
  onClose,
  onPageCountLoaded,
  className,
}: PdfViewerProps) {
  const [state, setState] = useState<PdfViewerState>({
    currentPage: 1,
    totalPages: 0,
    zoom: DEFAULT_ZOOM,
    rotation: 0,
    fitMode: 'width',
  });
  const [processingState, setProcessingState] = useState<PdfProcessingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState('1');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (docRef.current) {
      docRef.current.cleanup();
      docRef.current = null;
    }
    if (loadingTaskRef.current && !loadingTaskRef.current.destroyed) {
      loadingTaskRef.current.destroy().catch(() => {});
      loadingTaskRef.current = null;
    }
  }, []);

  // Load document when file changes
  useEffect(() => {
    let cancelled = false;
    setProcessingState('loading');
    setError(null);

    async function loadDoc() {
      try {
        const pdfjs = await loadPdfjs();
        if (cancelled) return;

        const url = URL.createObjectURL(pdfFile.file);
        objectUrlRef.current = url;

        const loadingTask = pdfjs.getDocument({ url, disableAutoFetch: true, disableStream: false });
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) {
          doc.cleanup();
          URL.revokeObjectURL(url);
          return;
        }

        docRef.current = doc;
        const totalPages = doc.numPages;
        setState((s) => ({ ...s, totalPages, currentPage: 1, zoom: DEFAULT_ZOOM, rotation: 0, fitMode: 'width' }));
        setPageInput('1');
        onPageCountLoaded?.(totalPages);
        setProcessingState('ready');
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = String(err);
        if (msg.includes('PasswordException') || msg.includes('password')) {
          setProcessingState('password-required');
          setError('This PDF is password protected. Password-protected PDFs cannot be opened.');
        } else if (msg.includes('InvalidPDFException') || msg.includes('corrupt')) {
          setProcessingState('corrupted');
          setError('This PDF appears to be corrupted or is not a valid PDF file.');
        } else {
          setProcessingState('error');
          setError('Failed to load PDF. The file may be corrupted or unsupported.');
        }
      }
    }

    loadDoc();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pdfFile.id, cleanup, onPageCountLoaded]);

  // Render current page
  useLayoutEffect(() => {
    if (processingState !== 'ready' || !docRef.current || !canvasRef.current) return;
    if (state.totalPages === 0) return;

    let cancelled = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    async function renderPage() {
      setProcessingState('rendering');
      renderTaskRef.current?.cancel();

      try {
        const doc = docRef.current!;
        const page: PDFPageProxy = await doc.getPage(state.currentPage);
        if (cancelled) { page.cleanup(); return; }

        const containerWidth = containerRef.current?.clientWidth ?? 600;
        let scale = state.zoom;

        if (state.fitMode === 'width') {
          const unscaled = page.getViewport({ scale: 1, rotation: state.rotation });
          scale = containerWidth / unscaled.width;
        } else if (state.fitMode === 'page') {
          const containerHeight = containerRef.current?.clientHeight ?? 800;
          const unscaled = page.getViewport({ scale: 1, rotation: state.rotation });
          const scaleW = containerWidth / unscaled.width;
          const scaleH = containerHeight / unscaled.height;
          scale = Math.min(scaleW, scaleH);
        }

        const viewport = page.getViewport({ scale, rotation: state.rotation });

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = page.render({ canvas, canvasContext: context, viewport });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!cancelled) {
          setProcessingState('ready');
        }
        page.cleanup();
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = String(err);
        if (!msg.includes('RenderingCancelledException')) {
          setProcessingState('error');
          setError('Failed to render page.');
        }
      }
    }

    renderPage();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPage, state.zoom, state.rotation, state.fitMode, processingState === 'ready' ? 'ready' : 'other']);

  const goToPage = useCallback((page: number) => {
    setState((s) => {
      const clamped = Math.max(1, Math.min(page, s.totalPages));
      setPageInput(String(clamped));
      return { ...s, currentPage: clamped, fitMode: s.fitMode };
    });
  }, []);

  const zoomIn = useCallback(() =>
    setState((s) => ({ ...s, zoom: Math.min(ZOOM_MAX, s.zoom + ZOOM_STEP), fitMode: 'none' })), []);
  const zoomOut = useCallback(() =>
    setState((s) => ({ ...s, zoom: Math.max(ZOOM_MIN, s.zoom - ZOOM_STEP), fitMode: 'none' })), []);
  const fitWidth = useCallback(() =>
    setState((s) => ({ ...s, fitMode: 'width' })), []);
  const fitPage = useCallback(() =>
    setState((s) => ({ ...s, fitMode: 'page' })), []);
  const rotate = useCallback(() =>
    setState((s) => ({ ...s, rotation: (s.rotation + 90) % 360 })), []);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goToPage(n);
    else setPageInput(String(state.currentPage));
  };

  const handlePageInputBlur = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goToPage(n);
    else setPageInput(String(state.currentPage));
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(state.currentPage + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(state.currentPage - 1);
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    },
    [state.currentPage, goToPage, zoomIn, zoomOut]
  );

  const isLoading = processingState === 'loading' || processingState === 'rendering';

  return (
    <div
      className={['flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900', className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`PDF viewer — ${pdfFile.name}`}
      role="region"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
        {/* File info */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 4h5v7h7v9H6V4z" />
          </svg>
          <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300" title={pdfFile.name}>
            {pdfFile.name}
          </span>
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {formatFileSize(pdfFile.size)}
          </span>
          {state.totalPages > 0 && (
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
              · {state.totalPages} page{state.totalPages !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            aria-label="Close PDF viewer"
            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Page nav */}
        {state.totalPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(state.currentPage - 1)}
              disabled={state.currentPage <= 1 || isLoading}
              type="button"
              aria-label="Previous page"
              className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                aria-label={`Page number, ${state.currentPage} of ${state.totalPages}`}
                className="w-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 py-0.5 text-center text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">/ {state.totalPages}</span>
            </form>
            <button
              onClick={() => goToPage(state.currentPage + 1)}
              disabled={state.currentPage >= state.totalPages || isLoading}
              type="button"
              aria-label="Next page"
              className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Zoom & view controls */}
        {state.totalPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={state.zoom <= ZOOM_MIN || isLoading}
              type="button"
              aria-label="Zoom out"
              title="Zoom out"
              className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="min-w-[3rem] text-center text-xs text-gray-500 dark:text-gray-400 tabular-nums" aria-live="polite" aria-label={`Zoom level ${Math.round(state.zoom * 100)}%`}>
              {state.fitMode === 'width' ? 'Fit W' : state.fitMode === 'page' ? 'Fit P' : `${Math.round(state.zoom * 100)}%`}
            </span>
            <button
              onClick={zoomIn}
              disabled={state.zoom >= ZOOM_MAX || isLoading}
              type="button"
              aria-label="Zoom in"
              title="Zoom in"
              className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={fitWidth}
              type="button"
              aria-label="Fit to width"
              title="Fit to width"
              aria-pressed={state.fitMode === 'width'}
              className={['rounded-md p-1.5 transition-colors text-xs font-medium', state.fitMode === 'width' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'].join(' ')}
            >
              W
            </button>
            <button
              onClick={fitPage}
              type="button"
              aria-label="Fit to page"
              title="Fit to page"
              aria-pressed={state.fitMode === 'page'}
              className={['rounded-md p-1.5 transition-colors text-xs font-medium', state.fitMode === 'page' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'].join(' ')}
            >
              P
            </button>
            <button
              onClick={rotate}
              type="button"
              aria-label="Rotate 90 degrees"
              title="Rotate"
              className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 min-h-[300px]"
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-950/80 z-10" aria-live="polite" aria-label="Loading PDF">
            <div className="flex flex-col items-center gap-2">
              <svg className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {processingState === 'loading' ? 'Loading PDF…' : 'Rendering page…'}
              </span>
            </div>
          </div>
        )}

        {/* Error states */}
        {(processingState === 'error' || processingState === 'corrupted' || processingState === 'password-required') && error && (
          <div className="flex h-full min-h-[300px] items-center justify-center p-8" role="alert">
            <div className="flex flex-col items-center gap-3 text-center max-w-sm">
              <div className={['flex h-12 w-12 items-center justify-center rounded-full', processingState === 'password-required' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'].join(' ')}>
                {processingState === 'password-required' ? (
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {processingState === 'password-required' ? 'Password Protected' : 'Cannot Open PDF'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* Canvas */}
        {processingState !== 'error' && processingState !== 'corrupted' && processingState !== 'password-required' && (
          <div className="flex min-h-[300px] items-start justify-center p-4">
            <canvas
              ref={canvasRef}
              className="shadow-lg"
              aria-label={`Page ${state.currentPage} of ${state.totalPages}`}
            />
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {state.totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-1.5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Use arrow keys to navigate · + / − to zoom
          </p>
        </div>
      )}
    </div>
  );
}
