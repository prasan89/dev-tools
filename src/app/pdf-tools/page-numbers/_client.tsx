'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import type { PageNumberConfig, NumberFormat, NumberPosition, PageSelection } from '@/lib/pdf/pageNumbers';
import {
  defaultConfig,
  buildPageNumberedPdf,
  formatPageNumber,
} from '@/lib/pdf/pageNumbers';

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

function PageNumberOverlay({
  config,
  pageInfo,
  pageNumber,
  totalPages,
}: {
  config: PageNumberConfig;
  pageInfo: PageInfo;
  pageNumber: number;
  totalPages: number;
}) {
  const label = formatPageNumber(pageNumber, totalPages, config);
  const fontSize = config.fontSize * pageInfo.scale;
  const textLen = label.length * fontSize * 0.55;

  const pw = pageInfo.canvasW;
  const ph = pageInfo.canvasH;
  const mx = config.marginX * pageInfo.scale;
  const my = config.marginY * pageInfo.scale;

  let left = 0, top = 0;
  const cx = pw / 2 - textLen / 2;

  switch (config.position) {
    case 'top-left':      left = mx; top = my; break;
    case 'top-center':    left = cx; top = my; break;
    case 'top-right':     left = pw - textLen - mx; top = my; break;
    case 'bottom-left':   left = mx; top = ph - fontSize - my; break;
    case 'bottom-center': left = cx; top = ph - fontSize - my; break;
    case 'bottom-right':  left = pw - textLen - mx; top = ph - fontSize - my; break;
  }

  return (
    <div
      className="absolute pointer-events-none select-none whitespace-nowrap"
      style={{
        left,
        top,
        fontSize: `${fontSize}px`,
        fontFamily: config.fontFamily,
        color: config.color,
        opacity: config.opacity,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
}

const FORMAT_OPTIONS: { value: NumberFormat; label: string }[] = [
  { value: '1', label: '1, 2, 3 …' },
  { value: 'Page N', label: 'Page 1, Page 2 …' },
  { value: 'Page N of T', label: 'Page 1 of 5 …' },
  { value: 'N / T', label: '1 / 5, 2 / 5 …' },
  { value: 'custom', label: 'Custom' },
];

const POSITION_OPTIONS: { value: NumberPosition; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export default function PageNumbersPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [config, setConfig] = useState<PageNumberConfig>(defaultConfig());
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setPdfFile(f);
    setLoadState('loading');
    setDownloadBlob(null);
    setSaveState('idle');
    setSaveError(null);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      setPdfData(data);
      setLoadState('ready');
    };
    reader.onerror = () => setLoadState('error');
    reader.readAsArrayBuffer(f.file);
  }, []);

  useEffect(() => {
    if (loadState !== 'ready' || !pdfData || !canvasRef.current) return;
    renderPage(pdfData, currentPage, canvasRef.current)
      .then(setPageInfo)
      .catch(() => setLoadState('error'));
  }, [loadState, pdfData, currentPage]);

  const totalPages = pdfFile?.pageCount ?? 1;

  const handleExport = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError(null);
    const result = await buildPageNumberedPdf(pdfFile, config);
    if (result.success && result.outputFile) {
      setDownloadBlob(result.outputFile.blob);
      setSaveState('done');
    } else {
      setSaveError(result.error ?? 'Failed to add page numbers');
      setSaveState('error');
    }
  }, [pdfFile, config]);

  const updateConfig = (patch: Partial<PageNumberConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setDownloadBlob(null);
    setSaveState('idle');
  };

  return (
    <PdfToolLayout title="Add Page Numbers to PDF" description="Add customizable page numbers to any PDF.">
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
        <div className="flex flex-col gap-6">
          {/* Preview + overlay */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative inline-block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <canvas ref={canvasRef} className="block" />
              {pageInfo && (
                <PageNumberOverlay
                  config={config}
                  pageInfo={pageInfo}
                  pageNumber={currentPage}
                  totalPages={totalPages}
                />
              )}
            </div>

            {/* Page nav */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
                >
                  ‹ Prev
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>

          {/* Config panel */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Page Number Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Format */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Format</label>
                <select
                  value={config.format}
                  onChange={(e) => updateConfig({ format: e.target.value as NumberFormat })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Position</label>
                <select
                  value={config.position}
                  onChange={(e) => updateConfig({ position: e.target.value as NumberPosition })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {POSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom prefix/suffix */}
              {config.format === 'custom' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Prefix</label>
                    <input
                      type="text"
                      value={config.customPrefix}
                      onChange={(e) => updateConfig({ customPrefix: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Suffix</label>
                    <input
                      type="text"
                      value={config.customSuffix}
                      onChange={(e) => updateConfig({ customSuffix: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Font */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Font</label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => updateConfig({ fontFamily: e.target.value as PageNumberConfig['fontFamily'] })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier">Courier</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

              {/* Font size */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Font Size ({config.fontSize}pt)</label>
                <input
                  type="range" min={6} max={36} step={1}
                  value={config.fontSize}
                  onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Color */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Color</label>
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => updateConfig({ color: e.target.value })}
                  className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Opacity ({Math.round(config.opacity * 100)}%)</label>
                <input
                  type="range" min={0.1} max={1} step={0.05}
                  value={config.opacity}
                  onChange={(e) => updateConfig({ opacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Start number */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Start Number</label>
                <input
                  type="number" min={1}
                  value={config.startNumber}
                  onChange={(e) => updateConfig({ startNumber: Math.max(1, Number(e.target.value)) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>

              {/* Skip first N pages */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Skip First N Pages</label>
                <input
                  type="number" min={0}
                  value={config.pageOffset}
                  onChange={(e) => updateConfig({ pageOffset: Math.max(0, Number(e.target.value)) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>

              {/* Margin X */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Margin X ({config.marginX}pt)</label>
                <input
                  type="range" min={10} max={100} step={2}
                  value={config.marginX}
                  onChange={(e) => updateConfig({ marginX: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Margin Y */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Margin Y ({config.marginY}pt)</label>
                <input
                  type="range" min={10} max={100} step={2}
                  value={config.marginY}
                  onChange={(e) => updateConfig({ marginY: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Page selection */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Apply to Pages</label>
                <select
                  value={config.pageSelection}
                  onChange={(e) => updateConfig({ pageSelection: e.target.value as PageSelection })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="all">All pages</option>
                  <option value="odd">Odd pages</option>
                  <option value="even">Even pages</option>
                  <option value="range">Custom range</option>
                </select>
              </div>

              {config.pageSelection === 'range' && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Page Range (e.g. 1-3,5)</label>
                  <input
                    type="text"
                    value={config.pageRange}
                    onChange={(e) => updateConfig({ pageRange: e.target.value })}
                    placeholder="1-3,5"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleExport}
              disabled={saveState === 'saving'}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 text-sm transition-colors"
            >
              {saveState === 'saving' ? 'Adding Page Numbers…' : 'Add Page Numbers & Download'}
            </button>

            {saveError && (
              <p className="text-sm text-red-500 text-center">{saveError}</p>
            )}

            {saveState === 'done' && downloadBlob && (
              <PdfDownload
                blob={downloadBlob}
                filename={pdfFile.name.replace(/\.pdf$/i, '') + '_numbered.pdf'}
              />
            )}
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setPdfFile(null);
              setPdfData(null);
              setLoadState('idle');
              setDownloadBlob(null);
              setSaveState('idle');
              setSaveError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline text-center"
          >
            Load a different PDF
          </button>
        </div>
      )}
    </PdfToolLayout>
  );
}
