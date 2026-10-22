'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl, formatFileSize } from '@/lib/image-tools/engine';

export default function GrayscaleClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [intensity, setIntensity] = useState(100);
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
    setIntensity(100);
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
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available.');

      // Draw original
      ctx.drawImage(bitmap, 0, 0);

      if (intensity > 0) {
        // Apply grayscale via pixel manipulation to support fractional intensity
        // and preserve alpha channel correctly.
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const t = intensity / 100;
        for (let i = 0; i < data.length; i += 4) {
          // Luminance-weighted grayscale (BT.601)
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = Math.round(data[i] + (gray - data[i]) * t);
          data[i + 1] = Math.round(data[i + 1] + (gray - data[i + 1]) * t);
          data[i + 2] = Math.round(data[i + 2] + (gray - data[i + 2]) * t);
          // alpha (data[i+3]) is preserved unchanged
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Preserve PNG/WebP transparency; fall back to JPEG for other formats
      const mime =
        file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
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
      setError(e instanceof Error ? e.message : 'Grayscale conversion failed.');
    } finally {
      bitmap.close();
      setProcessing(false);
    }
  };

  const outputName = file
    ? file.name.replace(/\.[^.]+$/, '') +
      (intensity === 100 ? '-grayscale' : `-grayscale-${intensity}`) +
      (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg')
    : '';

  return (
    <ImageToolLayout
      title="Image to Grayscale"
      description="Convert images to grayscale with adjustable intensity. Blend from full color to black and white. Processed entirely in your browser."
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
                  {outputBlob && (
                    <> · Output: {formatFileSize(outputBlob.size)}</>
                  )}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-violet-600 dark:text-violet-400 hover:underline shrink-0">
                Choose another
              </button>
            </div>

            {/* Preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Original</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={source}
                  alt="Original"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-64"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={output || source}
                  alt="Grayscale preview"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain max-h-64"
                  style={{ filter: output ? 'none' : `grayscale(${intensity}%)` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
              <div>
                <label
                  htmlFor="gs-intensity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Grayscale intensity: {intensity}%
                </label>
                <input
                  id="gs-intensity"
                  type="range"
                  min={0}
                  max={100}
                  value={intensity}
                  onChange={(e) => {
                    setIntensity(Number(e.target.value));
                    setOutput('');
                    setOutputBlob(null);
                  }}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Original colors</span>
                  <span>Full grayscale</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void process()}
                  disabled={processing}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {processing ? 'Processing…' : 'Apply grayscale'}
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
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">How it works</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Each pixel is converted using the BT.601 luminance formula (0.299R + 0.587G + 0.114B).
            The intensity slider blends between original and grayscale. Transparency (alpha) is preserved for PNG and WebP.
            No data leaves your device.
          </p>
        </section>
      </div>
    </ImageToolLayout>
  );
}
