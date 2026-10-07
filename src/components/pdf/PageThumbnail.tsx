'use client';

import { useEffect, useRef, useState } from 'react';

type PdfjsLib = typeof import('pdfjs-dist');
type PdfDocProxy = import('pdfjs-dist').PDFDocumentProxy;

let pdfjsCache: PdfjsLib | null = null;

async function loadPdfjs(): Promise<PdfjsLib> {
  if (pdfjsCache) return pdfjsCache;
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  pdfjsCache = pdfjs;
  return pdfjs;
}

/** Render a single PDF page to a small canvas thumbnail. */
async function renderPageThumb(
  doc: PdfDocProxy,
  pageNumber: number, // 1-based
  scale: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation: 0 });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) { page.cleanup(); return; }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
  await renderTask.promise;
  page.cleanup();
}

// ─── Shared document cache per blob URL ───────────────────────────────────────

type DocCacheEntry = { doc: PdfDocProxy; refCount: number };
const docCache = new Map<string, DocCacheEntry | Promise<DocCacheEntry>>();

async function acquireDoc(dataUrl: string): Promise<PdfDocProxy> {
  const existing = docCache.get(dataUrl);
  if (existing instanceof Promise) {
    return (await existing).doc;
  }
  if (existing) {
    existing.refCount++;
    return existing.doc;
  }
  const promise = (async () => {
    const pdfjs = await loadPdfjs();
    const task = pdfjs.getDocument({ url: dataUrl, disableAutoFetch: true, wasmUrl: '/wasm/' });
    const doc = await task.promise;
    const entry: DocCacheEntry = { doc, refCount: 1 };
    docCache.set(dataUrl, entry);
    return entry;
  })();
  docCache.set(dataUrl, promise);
  return (await promise).doc;
}

function releaseDoc(dataUrl: string) {
  const entry = docCache.get(dataUrl);
  if (!entry || entry instanceof Promise) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    entry.doc.cleanup();
    docCache.delete(dataUrl);
  }
}

// ─── PageThumbnail component ──────────────────────────────────────────────────

export interface PageThumbnailProps {
  /** object URL of the source PDF */
  pdfUrl: string;
  /** 1-based page number to render */
  pageNumber: number;
  /** Additional visual rotation (0, 90, 180, 270) — CSS transform only */
  rotation: number;
  /** Is this page selected? */
  selected: boolean;
  /** Display index shown to the user (1-based position in current order) */
  displayIndex: number;
  /** Rendered thumbnail width in px */
  thumbWidth?: number;
  onSelect: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

export function PageThumbnail({
  pdfUrl,
  pageNumber,
  rotation,
  selected,
  displayIndex,
  thumbWidth = 120,
  onSelect,
  onRotateCW,
  onRotateCCW,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver = false,
}: PageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState(false);

  // Lazy render via IntersectionObserver
  useEffect(() => {
    setRendered(false);
    setError(false);
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let acquired = false;

    const render = async () => {
      try {
        const doc = await acquireDoc(pdfUrl);
        acquired = true;
        if (cancelled) { releaseDoc(pdfUrl); return; }
        const canvas = canvasRef.current;
        if (!canvas) { releaseDoc(pdfUrl); return; }
        const scale = thumbWidth / 595; // approximate: assume A4 width
        await renderPageThumb(doc, pageNumber, scale, canvas);
        if (!cancelled) setRendered(true);
        releaseDoc(pdfUrl);
      } catch {
        if (!cancelled) setError(true);
        if (acquired) releaseDoc(pdfUrl);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          render();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pdfUrl, pageNumber, thumbWidth]);

  // CSS rotation (visual only — actual rotation is applied at PDF build time)
  const swapped = rotation === 90 || rotation === 270;
  const thumbH = swapped ? thumbWidth : Math.round(thumbWidth * 1.414); // approx A4 aspect

  return (
    <div
      ref={containerRef}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        'group relative flex flex-col items-center gap-1.5 rounded-xl p-2 cursor-grab active:cursor-grabbing transition-all select-none',
        selected
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        isDragOver ? 'ring-2 ring-blue-400 bg-blue-50/50' : '',
      ].filter(Boolean).join(' ')}
      role="option"
      aria-selected={selected}
      aria-label={`Page ${displayIndex}${rotation !== 0 ? `, rotated ${rotation}°` : ''}`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(e); }
      }}
    >
      {/* Thumbnail canvas */}
      <div
        className="relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white shadow-sm"
        style={{
          width: thumbWidth,
          height: thumbH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            maxWidth: swapped ? thumbH : thumbWidth,
            maxHeight: swapped ? thumbWidth : thumbH,
            transition: 'transform 0.15s ease',
          }}
          aria-hidden="true"
        />
        {!rendered && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <svg className="h-5 w-5 animate-spin text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-600">
            ?
          </div>
        )}

        {/* Selection overlay */}
        {selected && (
          <div className="absolute inset-0 rounded-md ring-2 ring-inset ring-blue-500 pointer-events-none" aria-hidden="true" />
        )}

        {/* Hover controls */}
        <div className="absolute top-1 right-1 hidden group-hover:flex flex-col gap-0.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRotateCW(); }}
            title="Rotate 90° clockwise"
            aria-label={`Rotate page ${displayIndex} clockwise`}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors shadow-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete page"
            aria-label={`Delete page ${displayIndex}`}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors shadow-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Page number */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
          {displayIndex}
        </span>
        {rotation !== 0 && (
          <span className="text-xs text-blue-500 dark:text-blue-400" title={`Rotated ${rotation}°`} aria-hidden="true">
            ↻
          </span>
        )}
      </div>
    </div>
  );
}
