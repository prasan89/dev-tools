'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl, formatFileSize } from '@/lib/image-tools/engine';

// Block sizes: 2px → 64px (powers-of-2 feel natural for pixel art)
const MIN_BLOCK = 2;
const MAX_BLOCK = 64;

export default function PixelateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [blockSize, setBlockSize] = useState(12);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const sourceRef = useRef('');
  const outputRef = useRef('');

  useEffect(() => () => {
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
  }, []);

  const onFiles = (files: File[]) => {
    const next = files[0];
    if (!next) return;
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
    const url = createObjectUrl(next);
    sourceRef.current = url;
    outputRef.current = '';
    setFile(next);
    setSource(url);
    setOutput('');
    setOutputBlob(null);
    setError('');
  };

  const reset = () => {
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
    sourceRef.current = '';
    outputRef.current = '';
    setFile(null);
    setSource('');
    setOutput('');
    setOutputBlob(null);
    setBlockSize(12);
    setError('');
  };

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
      setError('Could not decode this image.');
      setProcessing(false);
      return;
    }
    try {
      const { width, height } = bitmap;
      if (width < 1 || height < 1) throw new Error('Image has invalid dimensions.');

      const bs = Math.max(1, Math.min(blockSize, Math.min(width, height)));

      // Downscale to low-res canvas (integer-division rounds down)
      const smallW = Math.max(1, Math.floor(width / bs));
      const smallH = Math.max(1, Math.floor(height / bs));

      const small = document.createElement('canvas');
      small.width = smallW;
      small.height = smallH;
      const smallCtx = small.getContext('2d');
      if (!smallCtx) throw new Error('Canvas is not available.');

      // Use default (smooth) interpolation to average block colors
      smallCtx.drawImage(bitmap, 0, 0, smallW, smallH);

      // Scale back up using nearest-neighbor to produce crisp blocks
      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      const outCtx = out.getContext('2d');
      if (!outCtx) throw new Error('Canvas is not available.');

      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(small, 0, 0, width, height);

      const mime =
        file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';

      const blob = await new Promise<Blob>((resolve, reject) =>
        out.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not export image.'))),
          mime,
          0.92,
        ),
      );

      if (outputRef.current) revokeObjectUrl(outputRef.current);
      const url = createObjectUrl(blob);
      outputRef.current = url;
      setOutput(url);
      setOutputBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pixelation failed.');
    } finally {
      bitmap.close();
      setProcessing(false);
    }
  };

  const outputName = file
    ? file.name.replace(/\.[^.]+$/, '') +
      `-pixelate-${blockSize}px` +
      (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg')
    : '';

  return (
    <ImageToolLayout
      title="Pixelate Image"
      description="Apply pixel-art style pixelation with adjustable block size. Uses nearest-neighbor scaling for crisp pixel blocks. No uploads required."
    >
      <div className="space-y-5">
        {!file && <ImageDropzone onFiles={onFiles} />}

        {file && (
          <>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(file.size)}
                  {outputBlob && <> · Output: {formatFileSize(outputBlob.size)}</>}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-violet-600 dark:text-violet-400 hover:underline shrink-0">
                Choose another
              </button>
            </div>

            {/* Preview */}
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output || source}
                alt={output ? 'Pixelated image preview' : 'Original image'}
                className="max-h-[480px] max-w-full object-contain rounded"
                style={output ? {} : { imageRendering: 'pixelated', filter: `blur(${Math.max(0, blockSize - 2)}px)` }}
              />
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
              <div>
                <label
                  htmlFor="px-block"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Block size: {blockSize}px
                </label>
                <input
                  id="px-block"
                  type="range"
                  min={MIN_BLOCK}
                  max={MAX_BLOCK}
                  value={blockSize}
                  onChange={(e) => {
                    setBlockSize(Number(e.target.value));
                    setOutput('');
                    setOutputBlob(null);
                  }}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Subtle ({MIN_BLOCK}px)</span>
                  <span>Large blocks ({MAX_BLOCK}px)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void process()}
                  disabled={processing}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {processing ? 'Processing…' : 'Pixelate'}
                </button>
                {output && (
                  <ImageDownloadButton
                    url={output}
                    filename={outputName}
                    label="Download"
                    size={outputBlob ? formatFileSize(outputBlob.size) : undefined}
                  />
                )}
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            )}
          </>
        )}

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">How pixelation works</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The image is first scaled down to a fraction of its original size (one pixel per block),
            then scaled back up using nearest-neighbor interpolation. This produces crisp, sharp pixel blocks
            with no blurry interpolation. Transparency is preserved for PNG and WebP.
          </p>
        </section>
      </div>
    </ImageToolLayout>
  );
}
