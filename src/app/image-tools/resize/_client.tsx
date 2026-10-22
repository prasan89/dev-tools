'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { resizeImage, formatFileSize, outputFilename, createObjectUrl, revokeObjectUrl, inspectImage } from '@/lib/image-tools/engine';
import type { ResizeOptions, ResizeResult, ImageFormat } from '@/lib/image-tools/types';

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: 'HD (1280×720)', w: 1280, h: 720 },
  { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
  { label: '4K (3840×2160)', w: 3840, h: 2160 },
  { label: 'Square 512', w: 512, h: 512 },
  { label: 'Square 1024', w: 1024, h: 1024 },
  { label: 'Avatar (128×128)', w: 128, h: 128 },
];

interface FileResult {
  id: string;
  file: File;
  previewUrl: string;
  origW?: number;
  origH?: number;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result?: ResizeResult;
  outputUrl?: string;
  error?: string;
}

export default function ResizeClient() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [mode, setMode] = useState<'dimensions' | 'percent'>('dimensions');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [percent, setPercent] = useState('50');
  const [keepAspect, setKeepAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        revokeObjectUrl(f.previewUrl);
        if (f.outputUrl) revokeObjectUrl(f.outputUrl);
      });
      return [];
    });
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const handleFiles = useCallback(async (incoming: File[]) => {
    const newItems: FileResult[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: createObjectUrl(f),
      status: 'queued',
    }));
    setFiles((prev) => [...prev, ...newItems]);

    // Inspect dimensions for first file (to populate width/height fields)
    if (incoming.length > 0 && !width && !height) {
      try {
        const info = await inspectImage(incoming[0]);
        setWidth(String(info.width));
        setHeight(String(info.height));
        setOutputFormat(info.format);
        newItems.forEach((item, i) => {
          if (i === 0) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, origW: info.width, origH: info.height } : f,
              ),
            );
          }
        });
      } catch { /* ignore */ }
    }
  }, [width, height]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        revokeObjectUrl(item.previewUrl);
        if (item.outputUrl) revokeObjectUrl(item.outputUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleWidthChange = useCallback((val: string) => {
    setWidth(val);
    if (keepAspect && mode === 'dimensions') {
      const firstFile = files[0];
      if (firstFile?.origW && firstFile?.origH && val) {
        const w = parseInt(val, 10);
        if (!isNaN(w)) {
          setHeight(String(Math.round((firstFile.origH * w) / firstFile.origW)));
        }
      }
    }
  }, [keepAspect, mode, files]);

  const handleHeightChange = useCallback((val: string) => {
    setHeight(val);
    if (keepAspect && mode === 'dimensions') {
      const firstFile = files[0];
      if (firstFile?.origW && firstFile?.origH && val) {
        const h = parseInt(val, 10);
        if (!isNaN(h)) {
          setWidth(String(Math.round((firstFile.origW * h) / firstFile.origH)));
        }
      }
    }
  }, [keepAspect, mode, files]);

  const applyPreset = useCallback((w: number, h: number) => {
    setMode('dimensions');
    setWidth(String(w));
    setHeight(String(h));
    setKeepAspect(true);
  }, []);

  const processAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === 'queued' || f.status === 'failed');
    if (pending.length === 0) return;

    const opts: ResizeOptions = {
      keepAspectRatio: keepAspect,
      outputFormat,
      quality: quality / 100,
      ...(mode === 'percent'
        ? { percent: parseFloat(percent) }
        : {
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined,
          }),
    };

    abortRef.current = new AbortController();
    setProcessing(true);

    for (const item of pending) {
      if (abortRef.current.signal.aborted) break;
      setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' } : f)));

      try {
        const result = await resizeImage(item.file, opts, abortRef.current.signal);
        const outputUrl = createObjectUrl(result.blob);
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'done', result, outputUrl } : f)),
        );
      } catch (err: unknown) {
        if (abortRef.current?.signal.aborted) break;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'failed', error: err instanceof Error ? err.message : String(err) }
              : f,
          ),
        );
      }
    }
    setProcessing(false);
  }, [files, keepAspect, outputFormat, quality, mode, percent, width, height]);

  const cancelAll = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setFiles((prev) =>
      prev.map((f) => (f.status === 'processing' ? { ...f, status: 'queued' } : f)),
    );
  }, []);

  const hasDone = files.some((f) => f.status === 'done');
  const hasQueued = files.some((f) => f.status === 'queued' || f.status === 'failed');

  async function downloadAll() {
    const done = files.filter((f) => f.status === 'done' && f.outputUrl && f.result);
    if (done.length === 0) return;
    if (done.length === 1) {
      const f = done[0];
      const a = document.createElement('a');
      a.href = f.outputUrl!;
      a.download = outputFilename(f.file.name, f.result!.format, '_resized');
      a.click();
      return;
    }
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const f of done) {
      zip.file(outputFilename(f.file.name, f.result!.format, '_resized'), f.result!.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = createObjectUrl(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized-images.zip';
    a.click();
    setTimeout(() => revokeObjectUrl(url), 60_000);
  }

  return (
    <ImageToolLayout
      title="Resize Image"
      description="Resize JPEG, PNG, and WebP images by pixel dimensions or percentage. Lock aspect ratio or use custom sizes."
    >
      <ImageDropzone onFiles={handleFiles} multiple disabled={processing} />

      {files.length > 0 && (
        <div className="space-y-4">
          {/* Options */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Resize Options</h2>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-fit">
              {(['dimensions', 'percent'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {m === 'dimensions' ? 'By dimensions' : 'By percentage'}
                </button>
              ))}
            </div>

            {mode === 'dimensions' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="w" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Width (px)</label>
                    <input
                      id="w"
                      type="number"
                      min={1}
                      max={16384}
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <label htmlFor="h" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Height (px)</label>
                    <input
                      id="h"
                      type="number"
                      min={1}
                      max={16384}
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      disabled={processing}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(e) => setKeepAspect(e.target.checked)}
                    className="accent-violet-600 w-4 h-4"
                    disabled={processing}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Lock aspect ratio</span>
                </label>

                {/* Presets */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyPreset(p.w, p.h)}
                        disabled={processing}
                        className="rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="pct" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scale: {percent}%
                </label>
                <input
                  id="pct"
                  type="range"
                  min={1}
                  max={400}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-full accent-violet-600"
                  disabled={processing}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Smaller</span><span>Larger</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="outFmt" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Output format</label>
                <select
                  id="outFmt"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
                  disabled={processing}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rquality" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quality: {quality}%
                </label>
                <input
                  id="rquality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-600"
                  disabled={processing}
                />
              </div>
            </div>
          </div>

          {/* File list */}
          <div className="space-y-3">
            {files.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.status === 'done' && item.outputUrl ? item.outputUrl : item.previewUrl} alt="" aria-hidden="true" className="h-14 w-14 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.file.name}</p>
                    {item.origW && item.origH && (
                      <p className="text-xs text-gray-400 mt-0.5">Original: {item.origW} × {item.origH}px</p>
                    )}
                    {item.status === 'done' && item.result && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        Output: {item.result.outputWidth} × {item.result.outputHeight}px · {formatFileSize(item.result.blob.size)}
                      </p>
                    )}
                    {item.status === 'processing' && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5" role="status">Processing…</p>}
                    {item.status === 'failed' && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5" role="alert">{item.error}</p>}
                  </div>
                  <button type="button" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {item.status === 'done' && item.outputUrl && item.result && (
                  <ImageDownloadButton url={item.outputUrl} filename={outputFilename(item.file.name, item.result.format, '_resized')} label="Download" size={formatFileSize(item.result.blob.size)} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasQueued && !processing && (
              <button type="button" onClick={processAll} className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors">
                Resize {files.filter((f) => f.status === 'queued' || f.status === 'failed').length} image{files.filter((f) => f.status === 'queued' || f.status === 'failed').length !== 1 ? 's' : ''}
              </button>
            )}
            {processing && (
              <button type="button" onClick={cancelAll} className="rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-medium transition-colors">Cancel</button>
            )}
            {hasDone && !processing && (
              <button type="button" onClick={downloadAll} className="rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 px-5 py-2.5 text-sm font-medium transition-colors">Download all as ZIP</button>
            )}
            {files.length > 0 && !processing && (
              <button type="button" onClick={cleanup} className="rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-5 py-2.5 text-sm transition-colors">Clear all</button>
            )}
          </div>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">About image resizing</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Images are decoded and redrawn at the new dimensions using high-quality scaling. Dimensions must be between 1 and 16384 pixels. Very small output dimensions may cause proportional rounding. When locking aspect ratio with a single dimension specified, the other is calculated from the original dimensions.</p>
      </section>
    </ImageToolLayout>
  );
}
