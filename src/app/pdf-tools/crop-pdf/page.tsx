'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { CropOverlay, pxCropToPdfCrop, pdfCropToPxCrop } from '@/components/pdf/CropOverlay';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { CropOutcome } from '@/lib/pdf/crop';
import {
  getAspectRatio,
  presetToCrop,
  validateCrop,
} from '@/lib/pdf/crop';
import type { CropModeType, AspectRatioMode, PresetMode } from '@/lib/pdf/crop';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'done' | 'error';

interface PageInfo {
  number: number; // 1-based
  width: number;  // points
  height: number; // points
  rotation: number;
}

interface PxCrop { x: number; y: number; w: number; h: number; }

// ─── Page rendering ────────────────────────────────────────────────────────────

const PREVIEW_MAX_W = 700;
const PREVIEW_MAX_H = 800;

async function renderPageToCanvas(
  pdfUrl: string,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<{ width: number; height: number; rotation: number; scale: number }> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const task = pdfjs.getDocument({ url: pdfUrl, disableAutoFetch: true, wasmUrl: '/wasm/' });
  const doc = await task.promise;
  const page = await doc.getPage(pageNumber);
  const rotation = page.rotate;
  const viewportNatural = page.getViewport({ scale: 1, rotation: 0 });
  const naturalW = viewportNatural.width;
  const naturalH = viewportNatural.height;

  const scale = Math.min(
    PREVIEW_MAX_W / naturalW,
    PREVIEW_MAX_H / naturalH,
    1.5,
  );

  // Render at display rotation for visual correctness
  const viewport = page.getViewport({ scale, rotation });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
    await renderTask.promise;
  }
  page.cleanup();
  doc.cleanup();

  return { width: naturalW, height: naturalH, rotation, scale };
}

// ─── Helper — default full-page crop in px ────────────────────────────────────

function fullPagePxCrop(canvasW: number, canvasH: number): PxCrop {
  return { x: 0, y: 0, w: canvasW, h: canvasH };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CropPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);

  // Page info
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfoMap, setPageInfoMap] = useState<Map<number, PageInfo>>(new Map());
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null);
  const [pageScale, setPageScale] = useState(1);
  const [renderLoading, setRenderLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Crop state
  const [cropPx, setCropPx] = useState<PxCrop | null>(null);
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('free');
  const [preset, setPreset] = useState<PresetMode>('custom');
  const [cropMode, setCropMode] = useState<CropModeType>('all');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  // Per-page crop store (0-based index → PxCrop in that page's px space)
  const [perPageCrops, setPerPageCrops] = useState<Map<number, PxCrop>>(new Map());

  // Save state
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveResult, setSaveResult] = useState<CropOutcome | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Margin inputs (in points)
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [showMargins, setShowMargins] = useState(false);

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
    setCurrentPage(1);
    setPageInfoMap(new Map());
    setPerPageCrops(new Map());
    setCropPx(null);
    setCanvasSize(null);

    const url = URL.createObjectURL(file.file);
    pdfUrlRef.current = url;
    setPdfFile(file);
    setPdfUrl(url);

    // Get page count
    import('pdf-lib').then(async ({ PDFDocument }) => {
      try {
        const buf = await new Promise<ArrayBuffer>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as ArrayBuffer);
          r.onerror = () => rej(new Error('read failed'));
          r.readAsArrayBuffer(file.file);
        });
        const doc = await PDFDocument.load(buf, { ignoreEncryption: false });
        setPageCount(doc.getPageCount());
      } catch (err: unknown) {
        const msg = String(err);
        if (msg.includes('encrypted') || msg.includes('password')) {
          setLoadError('This PDF is password protected and cannot be cropped.');
        } else {
          setLoadError('This PDF appears to be corrupted or is not a valid PDF.');
        }
      }
    });
  }, [revokePdfUrl]);

  // ─── Page render ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfUrl || !pageCount) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRenderLoading(true);
    let cancelled = false;

    renderPageToCanvas(pdfUrl, currentPage, canvas).then(({ width, height, rotation, scale }) => {
      if (cancelled) return;
      setPageInfoMap((prev) => {
        const next = new Map(prev);
        next.set(currentPage, { number: currentPage, width, height, rotation });
        return next;
      });
      const cw = canvas.width;
      const ch = canvas.height;
      setCanvasSize({ w: cw, h: ch });
      setPageScale(scale);

      // Initialize crop: use per-page crop if available, else full page
      const existingPx = perPageCrops.get(currentPage - 1);
      if (existingPx) {
        setCropPx(existingPx);
      } else {
        setCropPx(fullPagePxCrop(cw, ch));
      }
      setRenderLoading(false);
    }).catch((err: unknown) => {
      if (cancelled) return;
      setLoadError(`Could not render page ${currentPage}: ${String(err).slice(0, 80)}`);
      setRenderLoading(false);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentPage, pageCount]);

  // ─── Aspect / preset changes ────────────────────────────────────────────────

  const applyPreset = useCallback((p: PresetMode) => {
    setPreset(p);
    if (!canvasSize) return;
    const info = pageInfoMap.get(currentPage);
    if (!info) return;

    if (p === 'original') {
      setCropPx(fullPagePxCrop(canvasSize.w, canvasSize.h));
      return;
    }
    if (p === 'custom') return;

    const pdfCrop = presetToCrop(p, info.width, info.height);
    if (!pdfCrop) {
      setCropPx(fullPagePxCrop(canvasSize.w, canvasSize.h));
      return;
    }
    const px = pdfCropToPxCrop(pdfCrop, pageScale, info.height);
    setCropPx({ x: Math.max(0, px.x), y: Math.max(0, px.y), w: Math.min(canvasSize.w, px.w), h: Math.min(canvasSize.h, px.h) });
  }, [canvasSize, pageInfoMap, currentPage, pageScale]);

  const applyMargins = useCallback(() => {
    if (!canvasSize) return;
    const info = pageInfoMap.get(currentPage);
    if (!info) return;
    const mTop = margins.top * pageScale;
    const mBottom = margins.bottom * pageScale;
    const mLeft = margins.left * pageScale;
    const mRight = margins.right * pageScale;
    setCropPx({
      x: mLeft,
      y: mTop,
      w: Math.max(10, canvasSize.w - mLeft - mRight),
      h: Math.max(10, canvasSize.h - mTop - mBottom),
    });
  }, [canvasSize, pageInfoMap, currentPage, pageScale, margins]);

  const handleReset = useCallback(() => {
    if (!canvasSize) return;
    setCropPx(fullPagePxCrop(canvasSize.w, canvasSize.h));
    setPreset('custom');
  }, [canvasSize]);

  // ─── Crop commit ─────────────────────────────────────────────────────────────

  const handleCropCommit = useCallback((px: PxCrop) => {
    setCropPx(px);
    setPreset('custom');
    if (cropMode === 'per-page') {
      setPerPageCrops((prev) => {
        const next = new Map(prev);
        next.set(currentPage - 1, px);
        return next;
      });
    }
  }, [cropMode, currentPage]);

  // ─── Page navigation ─────────────────────────────────────────────────────────

  const goToPage = useCallback((n: number) => {
    if (n < 1 || n > pageCount) return;
    // Save current crop if per-page
    if (cropMode === 'per-page' && cropPx) {
      setPerPageCrops((prev) => {
        const next = new Map(prev);
        next.set(currentPage - 1, cropPx);
        return next;
      });
    }
    setCurrentPage(n);
    setCropPx(null);
  }, [pageCount, cropMode, cropPx, currentPage]);

  // ─── Page selection (for 'selected' mode) ────────────────────────────────────

  const togglePageSelection = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(pageNum) ? next.delete(pageNum) : next.add(pageNum);
      return next;
    });
  }, []);

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!pdfFile || !cropPx || saveState === 'saving') return;
    const info = pageInfoMap.get(currentPage);
    if (!info) return;

    setSaveState('saving');
    setSaveResult(null);
    const ac = new AbortController();
    abortRef.current = ac;

    const { buildCroppedPdf } = await import('@/lib/pdf/crop');

    // Build cropConfigs map
    const pdfCrop = pxCropToPdfCrop(cropPx, pageScale, info.height);
    const validErr = validateCrop(pdfCrop, info.width, info.height);
    if (validErr) {
      setSaveState('error');
      setSaveResult({ success: false, error: validErr });
      return;
    }

    const cropConfigs = new Map<number, typeof pdfCrop>();

    if (cropMode === 'all') {
      // Apply same crop (scaled) to all pages
      for (let i = 0; i < pageCount; i++) {
        const pi = pageInfoMap.get(i + 1);
        if (pi) {
          // Re-compute the pdfCrop proportionally for each page size
          const scaleX = pi.width / info.width;
          const scaleY = pi.height / info.height;
          cropConfigs.set(i, {
            x: pdfCrop.x * scaleX,
            y: pdfCrop.y * scaleY,
            w: pdfCrop.w * scaleX,
            h: pdfCrop.h * scaleY,
          });
        } else {
          // Fallback: use same crop (may be slightly off for different-sized pages)
          cropConfigs.set(i, pdfCrop);
        }
      }
    } else if (cropMode === 'current') {
      cropConfigs.set(currentPage - 1, pdfCrop);
    } else if (cropMode === 'selected') {
      for (const p of selectedPages) {
        const pi = pageInfoMap.get(p);
        if (pi) {
          const sx = pi.width / info.width;
          const sy = pi.height / info.height;
          cropConfigs.set(p - 1, {
            x: pdfCrop.x * sx,
            y: pdfCrop.y * sy,
            w: pdfCrop.w * sx,
            h: pdfCrop.h * sy,
          });
        } else {
          cropConfigs.set(p - 1, pdfCrop);
        }
      }
    } else {
      // per-page: use stored per-page crops
      for (const [idx, pxC] of perPageCrops.entries()) {
        const pi = pageInfoMap.get(idx + 1);
        if (pi) {
          cropConfigs.set(idx, pxCropToPdfCrop(pxC, pageScale, pi.height));
        }
      }
      // Include current page crop
      cropConfigs.set(currentPage - 1, pdfCrop);
    }

    const outcome = await buildCroppedPdf(pdfFile, cropConfigs, ac.signal);
    abortRef.current = null;
    setSaveResult(outcome);
    setSaveState(outcome.success ? 'done' : 'error');
  }, [pdfFile, cropPx, saveState, pageInfoMap, currentPage, pageScale, cropMode, pageCount, selectedPages, perPageCrops]);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    revokePdfUrl();
    setPdfFile(null);
    setPdfUrl(null);
    setPageCount(0);
    setCurrentPage(1);
    setLoadError(null);
    setCropPx(null);
    setCanvasSize(null);
    setPerPageCrops(new Map());
    setPageInfoMap(new Map());
    setSaveState('idle');
    setSaveResult(null);
  }, [revokePdfUrl]);

  // ─── Computed ────────────────────────────────────────────────────────────────

  const aspectRatio = getAspectRatio(aspectMode);
  const pageInfo = pageInfoMap.get(currentPage);
  const pdfCropForDisplay = (cropPx && pageInfo)
    ? pxCropToPdfCrop(cropPx, pageScale, pageInfo.height)
    : null;
  const cropValidError = pdfCropForDisplay && pageInfo
    ? validateCrop(pdfCropForDisplay, pageInfo.width, pageInfo.height)
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PdfToolLayout
      title="Crop PDF"
      description="Visually crop PDF pages in your browser. Adjust the crop area, apply to single or all pages, and download. Your PDF is never uploaded to our servers."
      breadcrumbs={[
        { label: 'PDF Tools', href: '/pdf-tools' },
        { label: 'Crop PDF' },
      ]}
    >
      {/* Success */}
      {saveState === 'done' && saveResult?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">PDF cropped successfully</p>
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
            <PdfDownload blob={saveResult.blob} filename={saveResult.filename} label="Download cropped PDF" />
            <button type="button" onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Crop another PDF
            </button>
            <button type="button" onClick={() => { setSaveState('idle'); setSaveResult(null); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Continue editing
            </button>
          </div>
        </div>
      )}

      {/* Save error */}
      {saveState === 'error' && saveResult && !saveResult.success && (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Failed to crop PDF</p>
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

      {/* Main workspace */}
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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              {/* Left: preview + crop overlay */}
              <div className="space-y-3">
                {/* Page navigation */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                    aria-label="Previous page"
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    ←
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> of {pageCount}
                  </span>
                  <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= pageCount}
                    aria-label="Next page"
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    →
                  </button>
                  {pageInfo && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {Math.round(pageInfo.width)} × {Math.round(pageInfo.height)} pt
                      {pageInfo.rotation !== 0 ? ` · ${pageInfo.rotation}° rotation` : ''}
                    </span>
                  )}
                </div>

                {/* Canvas + overlay */}
                <div
                  className="relative inline-block rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white"
                  style={canvasSize ? { width: canvasSize.w, height: canvasSize.h } : {}}
                >
                  {renderLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-20 rounded-lg">
                      <svg className="h-6 w-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  <canvas ref={canvasRef} aria-label={`Page ${currentPage} preview`} />
                  {canvasSize && cropPx && (
                    <CropOverlay
                      containerW={canvasSize.w}
                      containerH={canvasSize.h}
                      cropPx={cropPx}
                      aspectRatio={aspectRatio}
                      onCropChange={setCropPx}
                      onCropCommit={handleCropCommit}
                    />
                  )}
                </div>

                {/* Crop dimensions in points */}
                {pdfCropForDisplay && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Crop: {Math.round(pdfCropForDisplay.w)} × {Math.round(pdfCropForDisplay.h)} pt
                    </span>
                    <span>·</span>
                    <span>
                      Offset: ({Math.round(pdfCropForDisplay.x)}, {Math.round(pdfCropForDisplay.y)}) pt
                    </span>
                    {cropValidError && (
                      <span className="text-red-500 dark:text-red-400 font-medium">{cropValidError}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: controls */}
              <div className="space-y-4">
                {/* Preset */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preset</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['original', 'a4', 'a5', 'letter', 'square', 'custom'] as PresetMode[]).map((p) => (
                      <button type="button" key={p}
                        onClick={() => applyPreset(p)}
                        className={[
                          'rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors',
                          preset === p
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                        ].join(' ')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect ratio */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Aspect Ratio</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['free', '1:1', '4:3', '16:9', 'a4', 'letter'] as AspectRatioMode[]).map((ar) => (
                      <button type="button" key={ar}
                        onClick={() => setAspectMode(ar)}
                        className={[
                          'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                          aspectMode === ar
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                        ].join(' ')}>
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margins */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <button type="button"
                    onClick={() => setShowMargins((v) => !v)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>Margins (pt)</span>
                    <svg className={`h-4 w-4 transition-transform ${showMargins ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMargins && (
                    <div className="grid grid-cols-2 gap-2">
                      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                        <label key={side} className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{side}</span>
                          <input type="number" min={0} max={500} step={1}
                            value={margins[side]}
                            onChange={(e) => setMargins((m) => ({ ...m, [side]: Number(e.target.value) }))}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`${side} margin in points`}
                          />
                        </label>
                      ))}
                      <button type="button" onClick={applyMargins}
                        className="col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Apply margins
                      </button>
                    </div>
                  )}
                </div>

                {/* Crop mode */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Apply Crop To</h3>
                  {([
                    { value: 'all', label: 'All pages' },
                    { value: 'current', label: 'Current page only' },
                    { value: 'selected', label: 'Selected pages' },
                    { value: 'per-page', label: 'Per page (different crop each)' },
                  ] as { value: CropModeType; label: string }[]).map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cropMode" value={opt.value}
                        checked={cropMode === opt.value}
                        onChange={() => setCropMode(opt.value)}
                        className="accent-blue-600" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}

                  {cropMode === 'selected' && pageCount > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Select pages to crop:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                          <button type="button" key={p}
                            onClick={() => togglePageSelection(p)}
                            className={[
                              'rounded px-2 py-0.5 text-xs border transition-colors',
                              selectedPages.has(p)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                            ].join(' ')}
                            aria-pressed={selectedPages.has(p)}
                            aria-label={`Page ${p}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {cropMode === 'per-page' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Navigate to each page and adjust the crop. Crops are saved per page.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button type="button" onClick={handleReset}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Reset crop
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!cropPx || !!cropValidError || saveState === 'saving'}
                    aria-busy={saveState === 'saving'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {saveState === 'saving' ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Cropping…
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-2M12 4v12m0 0l-3-3m3 3l3-3" />
                        </svg>
                        Apply Crop & Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state (page count not loaded yet) */}
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
