'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl, formatFileSize } from '@/lib/image-tools/engine';

type OutputFormat = 'png' | 'jpeg' | 'webp';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'png', label: 'PNG (transparent corners)' },
  { value: 'jpeg', label: 'JPEG (solid background)' },
  { value: 'webp', label: 'WebP (transparent corners)' },
];

export default function RoundedCornersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [radius, setRadius] = useState(32);
  const [radiusInput, setRadiusInput] = useState('32');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
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
    setNaturalW(0);
    setNaturalH(0);
    setError('');

    // Detect initial format preference
    if (next.type === 'image/jpeg') setOutputFormat('jpeg');
    else setOutputFormat('png');

    // Read natural dimensions for clamping
    createImageBitmap(next).then((bm) => {
      setNaturalW(bm.width);
      setNaturalH(bm.height);
      bm.close();
    }).catch(() => {});
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
    setRadius(32);
    setRadiusInput('32');
    setOutputFormat('png');
    setBgColor('#ffffff');
    setNaturalW(0);
    setNaturalH(0);
    setError('');
  };

  const handleRadiusInput = (val: string) => {
    setRadiusInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) {
      setRadius(n);
      setOutput('');
      setOutputBlob(null);
    }
  };

  const maxRadius = naturalW && naturalH ? Math.floor(Math.min(naturalW, naturalH) / 2) : 512;

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

      // Clamp radius to half the shorter dimension
      const r = Math.max(0, Math.min(radius, Math.floor(Math.min(width, height) / 2)));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available.');

      // For JPEG, fill background first (no transparency support)
      if (outputFormat === 'jpeg') {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Clip to rounded-corner path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(width - r, 0);
      ctx.arcTo(width, 0, width, r, r);
      ctx.lineTo(width, height - r);
      ctx.arcTo(width, height, width - r, height, r);
      ctx.lineTo(r, height);
      ctx.arcTo(0, height, 0, height - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(bitmap, 0, 0);
      ctx.restore();

      const mime =
        outputFormat === 'png' ? 'image/png' :
        outputFormat === 'webp' ? 'image/webp' :
        'image/jpeg';

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
      setError(e instanceof Error ? e.message : 'Could not round corners.');
    } finally {
      bitmap.close();
      setProcessing(false);
    }
  };

  const ext = outputFormat === 'png' ? '.png' : outputFormat === 'webp' ? '.webp' : '.jpg';
  const outputName = file
    ? file.name.replace(/\.[^.]+$/, '') + `-rounded-${radius}px` + ext
    : '';

  const needsBg = outputFormat === 'jpeg';

  return (
    <ImageToolLayout
      title="Round Image Corners"
      description="Add rounded corners to any image with adjustable radius. Export as PNG or WebP with transparent corners, or JPEG with a solid background."
    >
      <div className="space-y-5">
        {!file && <ImageDropzone onFiles={onFiles} />}

        {file && (
          <>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {naturalW > 0 && <>{naturalW} × {naturalH}px · </>}
                  {formatFileSize(file.size)}
                  {outputBlob && <> · Output: {formatFileSize(outputBlob.size)}</>}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-violet-600 dark:text-violet-400 hover:underline shrink-0">
                Choose another
              </button>
            </div>

            {/* Preview */}
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output || source}
                alt={output ? 'Rounded corners preview' : 'Original image'}
                className="max-h-[480px] max-w-full object-contain"
                style={{
                  borderRadius: output ? 0 : `${radius}px`,
                  background: needsBg && !output ? bgColor : undefined,
                }}
              />
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
              {/* Radius */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="rc-radius" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Corner radius
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={maxRadius}
                      value={radiusInput}
                      onChange={(e) => handleRadiusInput(e.target.value)}
                      className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-violet-500"
                      aria-label="Corner radius in pixels"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </div>
                </div>
                <input
                  id="rc-radius"
                  type="range"
                  min={0}
                  max={maxRadius || 512}
                  value={radius}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setRadius(n);
                    setRadiusInput(String(n));
                    setOutput('');
                    setOutputBlob(null);
                  }}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>No rounding (0px)</span>
                  <span>Maximum ({maxRadius || 512}px)</span>
                </div>
              </div>

              {/* Output format */}
              <div>
                <label htmlFor="rc-fmt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Output format
                </label>
                <select
                  id="rc-fmt"
                  value={outputFormat}
                  onChange={(e) => {
                    setOutputFormat(e.target.value as OutputFormat);
                    setOutput('');
                    setOutputBlob(null);
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {needsBg && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    JPEG does not support transparency. Corner areas will be filled with the background color below.
                  </p>
                )}
              </div>

              {/* Background color (JPEG only) */}
              {needsBg && (
                <div>
                  <label htmlFor="rc-bg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="rc-bg"
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        setOutput('');
                        setOutputBlob(null);
                      }}
                      className="h-10 w-16 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{bgColor}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void process()}
                  disabled={processing}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {processing ? 'Processing…' : 'Apply rounded corners'}
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
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">About rounded corners</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Corners are created using a canvas clipping path with the exact same radius applied to all four corners.
            PNG and WebP preserve corner transparency. JPEG fills the corner area with the chosen background color
            since JPEG does not support transparency. The original image dimensions are preserved.
          </p>
        </section>
      </div>
    </ImageToolLayout>
  );
}
