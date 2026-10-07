'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { WatermarkConfig, WatermarkPosition, PageSelection, TextWatermarkConfig, ImageWatermarkConfig } from '@/lib/pdf/watermarkPdf';
import {
  defaultTextConfig,
  defaultImageConfig,
  buildWatermarkedPdf,
  selectedPageIndices,
} from '@/lib/pdf/watermarkPdf';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Watermark canvas preview ─────────────────────────────────────────────────

function WatermarkPreview({
  config, pageInfo,
}: { config: WatermarkConfig; pageInfo: PageInfo }) {
  if (config.type !== 'text') return null;
  if (!config.text.trim()) return null;

  // Approximate text dimensions on screen
  const fontSize = config.fontSize * pageInfo.scale;
  const textLen = config.text.length * fontSize * 0.55;

  const pw = pageInfo.canvasW;
  const ph = pageInfo.canvasH;
  const mx = config.marginX * pageInfo.scale;
  const my = config.marginY * pageInfo.scale;

  let left = 0, top = 0;
  const cx = pw / 2 - textLen / 2;
  const cy = ph / 2 - fontSize / 2;

  switch (config.position) {
    case 'top-left':     left = mx; top = my; break;
    case 'top-center':   left = cx; top = my; break;
    case 'top-right':    left = pw - textLen - mx; top = my; break;
    case 'center-left':  left = mx; top = cy; break;
    case 'center':       left = cx; top = cy; break;
    case 'center-right': left = pw - textLen - mx; top = cy; break;
    case 'bottom-left':  left = mx; top = ph - fontSize - my; break;
    case 'bottom-center':left = cx; top = ph - fontSize - my; break;
    case 'bottom-right': left = pw - textLen - mx; top = ph - fontSize - my; break;
    case 'diagonal':
    case 'diagonal-reverse': left = cx; top = cy; break;
  }

  const rot = config.position === 'diagonal' ? -45
    : config.position === 'diagonal-reverse' ? 45
    : config.rotation;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left,
        top,
        whiteSpace: 'nowrap',
        fontSize,
        color: config.color,
        opacity: config.opacity,
        transform: `rotate(${rot}deg)`,
        transformOrigin: 'left top',
        pointerEvents: 'none',
        userSelect: 'none',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      {config.text}
    </div>
  );
}

// ─── Position selector ────────────────────────────────────────────────────────

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'top-left', label: '↖ Top Left' },
  { value: 'top-center', label: '↑ Top Center' },
  { value: 'top-right', label: '↗ Top Right' },
  { value: 'center-left', label: '← Center Left' },
  { value: 'center', label: '⊕ Center' },
  { value: 'center-right', label: '→ Center Right' },
  { value: 'bottom-left', label: '↙ Bottom Left' },
  { value: 'bottom-center', label: '↓ Bottom Center' },
  { value: 'bottom-right', label: '↘ Bottom Right' },
  { value: 'diagonal', label: '↗↙ Diagonal' },
  { value: 'diagonal-reverse', label: '↖↘ Diagonal Rev.' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WatermarkPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>(defaultTextConfig);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDataRef = useRef<ArrayBuffer | null>(null);

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setLoadState('loading');
    setLoadError('');
    setCurrentPage(1);
    setPageInfo(null);
    setSaveState('idle');
    setDownloadBlob(null);
    setPdfFile(file);

    try {
      const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.file);
      });
      pdfDataRef.current = buf;

      const pdfjs = await import('pdfjs-dist');
      if (!pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
      }
      const doc = await pdfjs.getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
      setTotalPages(doc.numPages);
      setLoadState('ready');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load PDF');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    if (loadState !== 'ready' || !pdfDataRef.current || !canvasRef.current) return;
    let cancelled = false;
    renderPage(pdfDataRef.current, currentPage, canvasRef.current)
      .then((info) => { if (!cancelled) setPageInfo(info); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loadState, currentPage]);

  const updateConfig = useCallback((patch: Partial<TextWatermarkConfig> | Partial<ImageWatermarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch } as WatermarkConfig));
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime: 'image/jpeg' | 'image/png' = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const arr = new Uint8Array(atob(dataUrl.split(',')[1]).split('').map((c) => c.charCodeAt(0)));
      setConfig((prev) => {
        const base = prev.type === 'image' ? prev : defaultImageConfig();
        return { ...base, imageData: dataUrl, imageMimeType: mime, imageBytes: arr } as WatermarkConfig;
      });
      setSaveState('idle');
      setDownloadBlob(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError('');
    try {
      const result = await buildWatermarkedPdf(pdfFile, config);
      if (!result.success || !result.outputFile) throw new Error(result.error ?? 'Export failed');
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Export failed');
      setSaveState('error');
    }
  }, [pdfFile, config]);

  const handleReset = useCallback(() => {
    setDownloadBlob(null);
    setPdfFile(null);
    setLoadState('idle');
    setTotalPages(0);
    setCurrentPage(1);
    setPageInfo(null);
    setSaveState('idle');
    setSaveError('');
    setLoadError('');
    pdfDataRef.current = null;
    setConfig(defaultTextConfig());
  }, []);

  const affectedCount = totalPages > 0 ? selectedPageIndices(config, totalPages).length : 0;

  return (
    <PdfToolLayout
      title="Watermark PDF"
      description="Add text or image watermarks to PDF pages in your browser. Choose position, opacity, rotation, and which pages to watermark. Your PDF never leaves your device."
    >
      {loadState === 'idle' && (
        <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center py-20 gap-3">
          <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading PDF…</span>
        </div>
      )}

      {loadState === 'error' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load PDF</p>
          <p className="text-xs text-red-600 dark:text-red-500">{loadError}</p>
          <button onClick={handleReset} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors">Try another file</button>
        </div>
      )}

      {loadState === 'ready' && pdfFile && (
        <div className="space-y-4">
          {/* File bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">{pdfFile.name}</span>
            <span>{formatFileSize(pdfFile.size)}</span>
            <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
            <button onClick={handleReset} className="ml-auto rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Change file</button>
          </div>

          <div className="flex gap-4 items-start flex-wrap lg:flex-nowrap">
            {/* Controls */}
            <aside className="w-full lg:w-72 shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4 text-sm">
              {/* Type toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {(['text', 'image'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setConfig(t === 'text' ? defaultTextConfig() : defaultImageConfig());
                      setSaveState('idle');
                      setDownloadBlob(null);
                    }}
                    className={[
                      'flex-1 py-2 text-xs font-medium transition-colors',
                      config.type === t
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    {t === 'text' ? 'Text' : 'Image'}
                  </button>
                ))}
              </div>

              {/* Text config */}
              {config.type === 'text' && (
                <>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Watermark text</span>
                    <input
                      type="text"
                      value={config.text}
                      onChange={(e) => updateConfig({ text: e.target.value })}
                      placeholder="CONFIDENTIAL"
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Font size</span>
                      <input type="number" min={6} max={200} value={config.fontSize}
                        onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Color</span>
                      <input type="color" value={config.color}
                        onChange={(e) => updateConfig({ color: e.target.value })}
                        className="mt-1 w-full h-7 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Font</span>
                    <select value={config.fontFamily} onChange={(e) => updateConfig({ fontFamily: e.target.value as 'Helvetica' | 'Courier' | 'Times New Roman' })}
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="Helvetica">Helvetica</option>
                      <option value="Courier">Courier</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rotation ({config.rotation}°)</span>
                    <input type="range" min={-180} max={180} value={config.rotation}
                      onChange={(e) => updateConfig({ rotation: Number(e.target.value) })}
                      className="mt-1 w-full accent-blue-600" />
                  </label>
                </>
              )}

              {/* Image config */}
              {config.type === 'image' && (
                <>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Watermark image (PNG/JPG)</span>
                    <input type="file" accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="mt-1 w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:text-blue-700 hover:file:bg-blue-100" />
                  </label>
                  {config.imageData && (
                    <img src={config.imageData} alt="Watermark preview" className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-gray-700" />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Width (pt)</span>
                      <input type="number" min={10} max={600} value={config.width}
                        onChange={(e) => updateConfig({ width: Number(e.target.value) })}
                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Height (pt)</span>
                      <input type="number" min={10} max={600} value={config.height}
                        onChange={(e) => updateConfig({ height: Number(e.target.value) })}
                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rotation ({config.rotation}°)</span>
                    <input type="range" min={-180} max={180} value={config.rotation}
                      onChange={(e) => updateConfig({ rotation: Number(e.target.value) })}
                      className="mt-1 w-full accent-blue-600" />
                  </label>
                </>
              )}

              {/* Shared: opacity, position, margins, page selection */}
              <label className="block">
                <span className="text-xs text-gray-500 dark:text-gray-400">Opacity ({Math.round(config.opacity * 100)}%)</span>
                <input type="range" min={0.05} max={1} step={0.05} value={config.opacity}
                  onChange={(e) => updateConfig({ opacity: Number(e.target.value) })}
                  className="mt-1 w-full accent-blue-600" />
              </label>

              <label className="block">
                <span className="text-xs text-gray-500 dark:text-gray-400">Position</span>
                <select value={config.position} onChange={(e) => updateConfig({ position: e.target.value as WatermarkPosition })}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>

              {!['diagonal','diagonal-reverse','center'].includes(config.position) && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Margin X (pt)</span>
                    <input type="number" min={0} max={200} value={config.marginX}
                      onChange={(e) => updateConfig({ marginX: Number(e.target.value) })}
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Margin Y (pt)</span>
                    <input type="number" min={0} max={200} value={config.marginY}
                      onChange={(e) => updateConfig({ marginY: Number(e.target.value) })}
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </label>
                </div>
              )}

              {/* Page selection */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Apply to pages</span>
                <div className="flex flex-wrap gap-2">
                  {(['all','odd','even','range'] as PageSelection[]).map((s) => (
                    <button key={s} onClick={() => updateConfig({ pageSelection: s })}
                      className={[
                        'rounded px-2.5 py-1 text-xs border transition-colors',
                        config.pageSelection === s
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400',
                      ].join(' ')}
                    >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
                {config.pageSelection === 'range' && (
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Page range (e.g. 1-3,5)</span>
                    <input type="text" value={config.pageRange}
                      onChange={(e) => updateConfig({ pageRange: e.target.value })}
                      placeholder="1-3,5,7-9"
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </label>
                )}
                {totalPages > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Watermark applied to {affectedCount} of {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                  </p>
                )}
              </div>
            </aside>

            {/* Preview */}
            <div className="flex-1 min-w-0 space-y-3">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">← Prev</button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next →</button>
                </div>
              )}

              <div className="relative inline-block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                <canvas ref={canvasRef} className="block" />
                {pageInfo && <WatermarkPreview config={config} pageInfo={pageInfo} />}
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500">Live preview — image watermarks show in the exported PDF.</p>
            </div>
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Watermarking {affectedCount} {affectedCount === 1 ? 'page' : 'pages'}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {saveState === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>}
              {saveState === 'done' && downloadBlob ? (
                <PdfDownload blob={downloadBlob} filename={downloadName} label="Download watermarked PDF" />
              ) : (
                <button
                  onClick={handleExport}
                  disabled={saveState === 'saving'}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saveState === 'saving' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export watermarked PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
