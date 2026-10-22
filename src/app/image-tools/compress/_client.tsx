'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { compressImage, formatFileSize, compressionSavings, outputFilename, createObjectUrl, revokeObjectUrl } from '@/lib/image-tools/engine';
import type { CompressOptions, CompressResult } from '@/lib/image-tools/types';

interface FileResult {
  id: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result?: CompressResult;
  outputUrl?: string;
  error?: string;
}

export default function CompressClient() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [targetKb, setTargetKb] = useState('');
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

  const handleFiles = useCallback((incoming: File[]) => {
    const newItems: FileResult[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: createObjectUrl(f),
      status: 'queued',
    }));
    setFiles((prev) => [...prev, ...newItems]);
  }, []);

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

  const processAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === 'queued' || f.status === 'failed');
    if (pending.length === 0 || abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setProcessing(true);

    const opts: CompressOptions = {
      quality: quality / 100,
      maxWidth: maxWidth ? Number.parseInt(maxWidth, 10) : undefined,
      maxHeight: maxHeight ? Number.parseInt(maxHeight, 10) : undefined,
      targetSizeKb: targetKb ? Number.parseFloat(targetKb) : undefined,
    };

    try {
      for (const item of pending) {
        if (controller.signal.aborted) break;

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', error: undefined } : f)),
        );

        try {
          const result = await compressImage(item.file, opts, controller.signal);
          if (controller.signal.aborted) break;
          const outputUrl = createObjectUrl(result.blob);
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id !== item.id) {
                return f;
              }
              if (f.outputUrl) revokeObjectUrl(f.outputUrl);
              return { ...f, status: 'done', result, outputUrl, error: undefined };
            }),
          );
        } catch (err: unknown) {
          if (controller.signal.aborted) break;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'failed', error: err instanceof Error ? err.message : String(err) }
                : f,
            ),
          );
        }
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setProcessing(false);
      }
    }
  }, [files, quality, maxWidth, maxHeight, targetKb]);

  const cancelAll = useCallback(() => {
    const controller = abortRef.current;
    abortRef.current = null;
    controller?.abort();
    setProcessing(false);
    setFiles((prev) =>
      prev.map((f) => (f.status === 'processing' ? { ...f, status: 'queued' } : f)),
    );
  }, []);

  const hasQueued = files.some((f) => f.status === 'queued' || f.status === 'failed');
  const hasDone = files.some((f) => f.status === 'done');

  async function downloadAll() {
    const done = files.filter((f) => f.status === 'done' && f.outputUrl && f.result);
    if (done.length === 0) return;
    if (done.length === 1) {
      const f = done[0];
      const a = document.createElement('a');
      a.href = f.outputUrl!;
      a.download = outputFilename(f.file.name, f.result!.format, '_compressed');
      a.click();
      return;
    }
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const filenameCounts = new Map<string, number>();
    for (const f of done) {
      const filename = outputFilename(f.file.name, f.result!.format, '_compressed');
      const count = filenameCounts.get(filename) ?? 0;
      filenameCounts.set(filename, count + 1);
      const uniqueFilename = count === 0
        ? filename
        : filename.replace(/(\.[^.]+)$/, `_${count + 1}$1`);
      // Use the in-memory blob directly; no network fetch is needed for blob URLs.
      zip.file(uniqueFilename, f.result!.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = createObjectUrl(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed-images.zip';
    a.click();
    setTimeout(() => revokeObjectUrl(url), 60_000);
  }

  return (
    <ImageToolLayout
      title="Compress Image"
      description="Reduce JPEG, PNG, and WebP image file size. Adjust quality or target a specific file size. Processing happens in your browser."
    >
      <ImageDropzone onFiles={handleFiles} multiple disabled={processing} />

      {files.length > 0 && (
        <div className="space-y-4">
          {/* Options */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Compression Options</h2>

            <div>
              <label htmlFor="quality" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quality: {quality}%
              </label>
              <input
                id="quality"
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-violet-600"
                disabled={processing}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Quality affects JPEG and WebP. PNG uses lossless encoding, so this slider does not control its compression level.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxWidth" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max width (px) <span className="text-gray-400">optional</span>
                </label>
                <input
                  id="maxWidth"
                  type="number"
                  min={1}
                  max={16384}
                  placeholder="e.g. 1920"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label htmlFor="maxHeight" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max height (px) <span className="text-gray-400">optional</span>
                </label>
                <input
                  id="maxHeight"
                  type="number"
                  min={1}
                  max={16384}
                  placeholder="e.g. 1080"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="targetKb" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target size (KB) <span className="text-gray-400">optional — best-effort</span>
              </label>
              <input
                id="targetKb"
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={targetKb}
                onChange={(e) => setTargetKb(e.target.value)}
                disabled={processing}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="mt-1 text-xs text-gray-400">JPEG and WebP quality is adjusted to approach the target. PNG uses lossless encoding, so its size target may not be achievable. Exact size is not guaranteed.</p>
            </div>
          </div>

          {/* File list */}
          <div className="space-y-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-14 w-14 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Original: {formatFileSize(item.file.size)}</p>
                    {item.status === 'done' && item.result && (
                      <>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Output: {formatFileSize(item.result.outputSize)}
                          {' · '}
                          <span className={item.result.outputSize <= item.result.originalSize ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                            {compressionSavings(item.result.originalSize, item.result.outputSize)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.result.outputWidth} × {item.result.outputHeight}px
                        </p>
                        {item.result.outputSize > item.result.originalSize && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Output is larger than original. Consider keeping the original.
                          </p>
                        )}
                      </>
                    )}
                    {item.status === 'processing' && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5" role="status" aria-live="polite">Processing…</p>
                    )}
                    {item.status === 'failed' && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5" role="alert">{item.error}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    disabled={processing}
                    aria-label={`Remove ${item.file.name}`}
                    disabled={processing}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {item.status === 'done' && item.outputUrl && item.result && (
                  <ImageDownloadButton
                    url={item.outputUrl}
                    filename={outputFilename(item.file.name, item.result.format, '_compressed')}
                    label="Download"
                    size={formatFileSize(item.result.outputSize)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {hasQueued && !processing && (
              <button
                type="button"
                onClick={processAll}
                className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Compress {files.filter((f) => f.status === 'queued' || f.status === 'failed').length} image{files.filter((f) => f.status === 'queued' || f.status === 'failed').length !== 1 ? 's' : ''}
              </button>
            )}
            {processing && (
              <button
                type="button"
                onClick={cancelAll}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
            {hasDone && !processing && (
              <button
                type="button"
                onClick={downloadAll}
                className="rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Download all as ZIP
              </button>
            )}
            {files.length > 0 && !processing && (
              <button
                type="button"
                onClick={cleanup}
                className="rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-5 py-2.5 text-sm transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">How image compression works</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Images are decoded in your browser, drawn to a canvas at the target dimensions, and re-encoded at the chosen quality. JPEG and WebP support lossy quality settings; PNG uses lossless encoding so quality adjustments do not reduce PNG file size beyond palette reduction. For the best PNG size reduction, convert to WebP.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <strong className="text-gray-700 dark:text-gray-300">Note:</strong> Compression does not always reduce file size. If the output is larger than the original, keep the original file.
        </p>
      </section>
    </ImageToolLayout>
  );
}
