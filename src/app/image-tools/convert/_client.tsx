'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { convertImage, formatFileSize, outputFilename, createObjectUrl, revokeObjectUrl, inspectImage } from '@/lib/image-tools/engine';
import type { ConvertResult, ImageFormat } from '@/lib/image-tools/types';

const FORMAT_OPTIONS: { value: ImageFormat; label: string; desc: string }[] = [
  { value: 'jpeg', label: 'JPEG', desc: 'Lossy, no transparency, small file size' },
  { value: 'png', label: 'PNG', desc: 'Lossless, supports transparency' },
  { value: 'webp', label: 'WebP', desc: 'Lossy/lossless, supports transparency, modern browsers' },
];

interface FileResult {
  id: string;
  file: File;
  previewUrl: string;
  srcFormat?: ImageFormat;
  hasTransparency?: boolean;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result?: ConvertResult;
  outputUrl?: string;
  error?: string;
}

export default function ConvertClient() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
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

    // Inspect each file for format and transparency info
    for (let i = 0; i < incoming.length; i++) {
      const item = newItems[i];
      try {
        const info = await inspectImage(incoming[i]);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, srcFormat: info.format, hasTransparency: info.hasTransparency }
              : f,
          ),
        );
      } catch { /* ignore */ }
    }
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
    if (pending.length === 0) return;

    abortRef.current = new AbortController();
    setProcessing(true);

    for (const item of pending) {
      if (abortRef.current.signal.aborted) break;
      setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' } : f)));

      try {
        const result = await convertImage(
          item.file,
          { outputFormat: targetFormat, quality: quality / 100 },
          abortRef.current.signal,
        );
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
  }, [files, targetFormat, quality]);

  const cancelAll = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setFiles((prev) =>
      prev.map((f) => (f.status === 'processing' ? { ...f, status: 'queued' } : f)),
    );
  }, []);

  const hasDone = files.some((f) => f.status === 'done');
  const hasQueued = files.some((f) => f.status === 'queued' || f.status === 'failed');
  const willLoseTransparency = targetFormat === 'jpeg' && files.some((f) => f.hasTransparency);

  async function downloadAll() {
    const done = files.filter((f) => f.status === 'done' && f.outputUrl && f.result);
    if (done.length === 0) return;
    if (done.length === 1) {
      const f = done[0];
      const a = document.createElement('a');
      a.href = f.outputUrl!;
      a.download = outputFilename(f.file.name, f.result!.outputFormat);
      a.click();
      return;
    }
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const f of done) {
      const resp = await fetch(f.outputUrl!);
      const blob = await resp.blob();
      zip.file(outputFilename(f.file.name, f.result!.outputFormat), blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = createObjectUrl(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.zip';
    a.click();
    setTimeout(() => revokeObjectUrl(url), 60_000);
  }

  return (
    <ImageToolLayout
      title="Convert Image"
      description="Convert between JPEG, PNG, and WebP formats. Control quality and see transparency warnings."
    >
      <ImageDropzone onFiles={handleFiles} multiple disabled={processing} />

      {files.length > 0 && (
        <div className="space-y-4">
          {/* Options */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Convert To</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTargetFormat(f.value)}
                  disabled={processing}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    targetFormat === f.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'
                  }`}
                >
                  <span className="block font-semibold text-sm text-gray-900 dark:text-gray-100">{f.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</span>
                </button>
              ))}
            </div>

            {targetFormat !== 'png' && (
              <div>
                <label htmlFor="cquality" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quality: {quality}%
                </label>
                <input
                  id="cquality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-600"
                  disabled={processing}
                />
              </div>
            )}

            {willLoseTransparency && (
              <aside className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-400" role="alert">
                <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                One or more images have transparent areas. Converting to JPEG will fill transparency with white.
              </aside>
            )}
          </div>

          {/* File list */}
          <div className="space-y-3">
            {files.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="" aria-hidden="true" className="h-14 w-14 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.srcFormat?.toUpperCase() ?? '…'} → {targetFormat.toUpperCase()}
                      {item.hasTransparency && targetFormat === 'jpeg' && (
                        <span className="ml-1 text-amber-600 dark:text-amber-400">· transparency will be lost</span>
                      )}
                    </p>
                    {item.status === 'done' && item.result && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        {item.result.outputWidth} × {item.result.outputHeight}px · {formatFileSize(item.result.blob.size)}
                      </p>
                    )}
                    {item.status === 'processing' && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5" role="status">Converting…</p>}
                    {item.status === 'failed' && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5" role="alert">{item.error}</p>}
                  </div>
                  <button type="button" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {item.status === 'done' && item.outputUrl && item.result && (
                  <ImageDownloadButton url={item.outputUrl} filename={outputFilename(item.file.name, item.result.outputFormat)} label="Download" size={formatFileSize(item.result.blob.size)} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasQueued && !processing && (
              <button type="button" onClick={processAll} className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors">
                Convert {files.filter((f) => f.status === 'queued' || f.status === 'failed').length} image{files.filter((f) => f.status === 'queued' || f.status === 'failed').length !== 1 ? 's' : ''}
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
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Format guide</h2>
        <dl className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
          <div><dt className="font-medium text-gray-700 dark:text-gray-300 inline">JPEG — </dt><dd className="inline">Best for photographs. Lossy compression, no transparency support. Widely compatible.</dd></div>
          <div><dt className="font-medium text-gray-700 dark:text-gray-300 inline">PNG — </dt><dd className="inline">Best for graphics, screenshots, and images requiring transparency. Lossless — larger files than JPEG.</dd></div>
          <div><dt className="font-medium text-gray-700 dark:text-gray-300 inline">WebP — </dt><dd className="inline">Modern format with excellent compression. Supports transparency. Supported in all major browsers (Chrome, Firefox, Safari 14+, Edge).</dd></div>
        </dl>
      </section>
    </ImageToolLayout>
  );
}
