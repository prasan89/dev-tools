'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import type { RedactionRect } from '@/lib/pdf/redactPdf';
import { addRedactionRect, removeRedactionRect, buildRedactedPdf } from '@/lib/pdf/redactPdf';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'done' | 'error';

interface PageInfo {
  widthPt: number;
  heightPt: number;
  canvasW: number;
  canvasH: number;
  scale: number;
}

const PREVIEW_MAX_W = 800;
const PREVIEW_MAX_H = 960;

async function renderPage(
  data: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<PageInfo> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const doc = await pdfjs.getDocument({ data: data.slice(0), disableAutoFetch: true }).promise;
  const page = await doc.getPage(pageNumber);
  const vp0 = page.getViewport({ scale: 1, rotation: 0 });
  const scale = Math.min(PREVIEW_MAX_W / vp0.width, PREVIEW_MAX_H / vp0.height, 2);
  const vp = page.getViewport({ scale, rotation: 0 });
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise;
  }
  return { widthPt: vp0.width, heightPt: vp0.height, canvasW: canvas.width, canvasH: canvas.height, scale };
}

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

export default function RedactPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [rects, setRects] = useState<RedactionRect[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setPdfFile(f);
    setLoadState('loading');
    setRects([]);
    setDownloadBlob(null);
    setSaveState('idle');
    setSaveError(null);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfData(e.target?.result as ArrayBuffer);
      setLoadState('ready');
    };
    reader.onerror = () => setLoadState('error');
    reader.readAsArrayBuffer(f.file);
  }, []);

  useEffect(() => {
    if (loadState !== 'ready' || !pdfData || !canvasRef.current) return;
    renderPage(pdfData, currentPage, canvasRef.current)
      .then((info) => setPageInfo(info))
      .catch(() => setLoadState('error'));
  }, [loadState, pdfData, currentPage]);

  const totalPages = pdfFile?.pageCount ?? 1;
  const pageIndex = currentPage - 1;
  const currentRects = rects.filter((r) => r.pageIndex === pageIndex);

  const getOverlayOffset = () => {
    if (!overlayRef.current) return { left: 0, top: 0 };
    const rect = overlayRef.current.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!overlayRef.current) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const { left, top } = getOverlayOffset();
    setDrag({ startX: e.clientX - left, startY: e.clientY - top, currentX: e.clientX - left, currentY: e.clientY - top, active: true });
    setSaveState('idle');
    setDownloadBlob(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag?.active) return;
    const { left, top } = getOverlayOffset();
    setDrag((d) => d ? { ...d, currentX: e.clientX - left, currentY: e.clientY - top } : d);
  };

  const handlePointerUp = () => {
    if (!drag?.active || !pageInfo) return;
    const cx = Math.min(drag.startX, drag.currentX);
    const cy = Math.min(drag.startY, drag.currentY);
    const cw = Math.abs(drag.currentX - drag.startX);
    const ch = Math.abs(drag.currentY - drag.startY);
    if (cw > 5 && ch > 5) {
      const pdfX = (cx / pageInfo.canvasW) * pageInfo.widthPt;
      const pdfW = (cw / pageInfo.canvasW) * pageInfo.widthPt;
      const pdfH = (ch / pageInfo.canvasH) * pageInfo.heightPt;
      const pdfY = pageInfo.heightPt - ((cy + ch) / pageInfo.canvasH) * pageInfo.heightPt;
      const newRect: RedactionRect = {
        id: crypto.randomUUID(),
        pageIndex,
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      };
      setRects((prev) => addRedactionRect(prev, newRect));
    }
    setDrag(null);
  };

  const handleExport = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError(null);
    const result = await buildRedactedPdf(pdfFile, rects);
    if (result.success && result.outputFile) {
      setDownloadBlob(result.outputFile.blob);
      setSaveState('done');
    } else {
      setSaveError(result.error ?? 'Failed to redact PDF');
      setSaveState('error');
    }
  }, [pdfFile, rects]);

  const dragRect = drag
    ? {
        x: Math.min(drag.startX, drag.currentX),
        y: Math.min(drag.startY, drag.currentY),
        w: Math.abs(drag.currentX - drag.startX),
        h: Math.abs(drag.currentY - drag.startY),
      }
    : null;

  return (
    <PdfToolLayout title="Redact PDF" description="Draw black boxes over sensitive content in any PDF.">
      {/* Disclaimer */}
      <aside className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        <strong>Visual redaction only</strong> — underlying text may still be extractable by PDF tools. For sensitive documents requiring certified redaction, use dedicated redaction software.
      </aside>

      {loadState === 'idle' && (
        <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center h-48 text-sm text-gray-500">Loading PDF…</div>
      )}

      {loadState === 'error' && (
        <div className="flex items-center justify-center h-48 text-sm text-red-500">Failed to load PDF.</div>
      )}

      {loadState === 'ready' && pdfFile && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Drag on the page to draw redaction areas.</p>
            <div
              className="relative inline-block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm cursor-crosshair"
              ref={overlayRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <canvas ref={canvasRef} className="block" />

              {/* Existing rects for current page */}
              {pageInfo && currentRects.map((r) => {
                const left = (r.x / pageInfo.widthPt) * pageInfo.canvasW;
                const top = ((pageInfo.heightPt - r.y - r.height) / pageInfo.heightPt) * pageInfo.canvasH;
                const w = (r.width / pageInfo.widthPt) * pageInfo.canvasW;
                const h = (r.height / pageInfo.heightPt) * pageInfo.canvasH;
                return (
                  <div
                    key={r.id}
                    className="absolute"
                    style={{ left, top, width: w, height: h, backgroundColor: 'rgba(0,0,0,0.85)' }}
                  >
                    <button
                      onClick={() => setRects((prev) => removeRedactionRect(prev, r.id))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center leading-none"
                      aria-label="Remove redaction"
                    >×</button>
                  </div>
                );
              })}

              {dragRect && dragRect.w > 0 && dragRect.h > 0 && (
                <div
                  className="absolute pointer-events-none border-2 border-red-500"
                  style={{ left: dragRect.x, top: dragRect.y, width: dragRect.w, height: dragRect.h, backgroundColor: 'rgba(239,68,68,0.25)' }}
                />
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40">‹ Prev</button>
                <span className="text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40">Next ›</button>
              </div>
            )}
          </div>

          {rects.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Redaction Areas ({rects.length})
              </h2>
              <ul className="space-y-2">
                {rects.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Page {r.pageIndex + 1} — {Math.round(r.width)}×{Math.round(r.height)}pt</span>
                    <button
                      onClick={() => setRects((prev) => removeRedactionRect(prev, r.id))}
                      className="text-red-500 hover:text-red-700 ml-3 font-medium"
                    >Remove</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setRects([])} className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">Clear all</button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleExport}
              disabled={saveState === 'saving' || rects.length === 0}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 text-sm transition-colors"
            >
              {saveState === 'saving' ? 'Applying Redactions…' : `Apply Redactions & Download (${rects.length} area${rects.length !== 1 ? 's' : ''})`}
            </button>

            {saveError && <p className="text-sm text-red-500 text-center">{saveError}</p>}

            {saveState === 'done' && downloadBlob && (
              <PdfDownload blob={downloadBlob} filename={pdfFile.name.replace(/\.pdf$/i, '') + '_redacted.pdf'} />
            )}
          </div>

          <button
            onClick={() => { setPdfFile(null); setPdfData(null); setLoadState('idle'); setRects([]); setDownloadBlob(null); setSaveState('idle'); }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline text-center"
          >
            Load a different PDF
          </button>
        </div>
      )}
    </PdfToolLayout>
  );
}
