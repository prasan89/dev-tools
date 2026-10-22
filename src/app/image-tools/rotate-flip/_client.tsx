'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { transformImage, formatFileSize, outputFilename, createObjectUrl, revokeObjectUrl } from '@/lib/image-tools/engine';
import type { TransformResult, RotateAngle, FlipDirection, ImageFormat } from '@/lib/image-tools/types';

interface FileResult {
  id: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result?: TransformResult;
  outputUrl?: string;
  error?: string;
}

export default function RotateFlipClient() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [rotate, setRotate] = useState<RotateAngle | 0>(0);
  const [flip, setFlip] = useState<FlipDirection | ''>('');
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpeg');
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
    if (pending.length === 0) return;
    if (rotate === 0 && flip === '') return;

    abortRef.current = new AbortController();
    setProcessing(true);

    for (const item of pending) {
      if (abortRef.current.signal.aborted) break;
      setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' } : f)));

      try {
        const result = await transformImage(
          item.file,
          {
            rotate: rotate !== 0 ? rotate : undefined,
            flip: flip !== '' ? flip : undefined,
            outputFormat,
          },
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
  }, [files, rotate, flip, outputFormat]);

  const cancelAll = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setFiles((prev) =>
      prev.map((f) => (f.status === 'processing' ? { ...f, status: 'queued' } : f)),
    );
  }, []);

  const hasDone = files.some((f) => f.status === 'done');
  const hasQueued = files.some((f) => f.status === 'queued' || f.status === 'failed');
  const noTransform = rotate === 0 && flip === '';

  async function downloadAll() {
    const done = files.filter((f) => f.status === 'done' && f.outputUrl && f.result);
    if (done.length === 0) return;
    if (done.length === 1) {
      const f = done[0];
      const a = document.createElement('a');
      a.href = f.outputUrl!;
      a.download = outputFilename(f.file.name, f.result!.format, '_transformed');
      a.click();
      return;
    }
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const f of done) {
      const resp = await fetch(f.outputUrl!);
      const blob = await resp.blob();
      zip.file(outputFilename(f.file.name, f.result!.format, '_transformed'), blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = createObjectUrl(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed-images.zip';
    a.click();
    setTimeout(() => revokeObjectUrl(url), 60_000);
  }

  const rotateOptions: { value: RotateAngle | 0; label: string }[] = [
    { value: 0, label: 'No rotation' },
    { value: 90, label: '90° clockwise' },
    { value: 180, label: '180°' },
    { value: 270, label: '90° counter-clockwise' },
  ];

  return (
    <ImageToolLayout
      title="Rotate & Flip Image"
      description="Rotate 90°, 180°, or 270°. Flip horizontally or vertically. Batch operations supported."
    >
      <ImageDropzone onFiles={handleFiles} multiple disabled={processing} />

      {files.length > 0 && (
        <div className="space-y-4">
          {/* Options */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Transform Options</h2>

            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Rotate</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rotateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRotate(opt.value as RotateAngle | 0)}
                    disabled={processing}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                      rotate === opt.value
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Flip</p>
              <div className="flex flex-wrap gap-2">
                {(['', 'horizontal', 'vertical'] as const).map((dir) => (
                  <button
                    key={dir || 'none'}
                    type="button"
                    onClick={() => setFlip(dir)}
                    disabled={processing}
                    className={`rounded-lg border-2 px-4 py-2 text-xs font-medium transition-all ${
                      flip === dir
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                  >
                    {dir === '' ? 'No flip' : dir === 'horizontal' ? 'Flip horizontal' : 'Flip vertical'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rfmt" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Output format</label>
              <select
                id="rfmt"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
                disabled={processing}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {noTransform && (
              <p className="text-xs text-amber-600 dark:text-amber-400" role="alert">
                Select a rotation or flip to apply.
              </p>
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
                    <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(item.file.size)}</p>
                    {item.status === 'done' && item.result && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        {item.result.outputWidth} × {item.result.outputHeight}px · {formatFileSize(item.result.blob.size)}
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
                  <ImageDownloadButton url={item.outputUrl} filename={outputFilename(item.file.name, item.result.format, '_transformed')} label="Download" size={formatFileSize(item.result.blob.size)} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasQueued && !processing && (
              <button type="button" onClick={processAll} disabled={noTransform} className="rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-medium transition-colors">
                Apply to {files.filter((f) => f.status === 'queued' || f.status === 'failed').length} image{files.filter((f) => f.status === 'queued' || f.status === 'failed').length !== 1 ? 's' : ''}
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
    </ImageToolLayout>
  );
}
