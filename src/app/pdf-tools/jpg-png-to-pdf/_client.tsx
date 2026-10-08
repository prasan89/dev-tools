'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { ImageDropzone } from '@/components/pdf/ImageDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { ImageFile } from '@/types/image';
import type { ConvertOutcome, ConvertOptions, PageSizePreset, OrientationMode, MarginPreset, PlacementMode } from '@/lib/pdf/fromImages';
import { DEFAULT_OPTIONS, PAGE_SIZE_PRESETS } from '@/lib/pdf/fromImages';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvertState = 'idle' | 'converting' | 'done' | 'error';

// ─── Image thumbnail loader ───────────────────────────────────────────────────

function useImageObjectUrls(images: ImageFile[]) {
  const urlsRef = useRef<Map<string, string>>(new Map());

  // Create object URLs for new images, revoke for removed ones
  useEffect(() => {
    const currentIds = new Set(images.map((f) => f.id));
    // Revoke stale
    for (const [id, url] of urlsRef.current) {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(id);
      }
    }
    // Create new
    for (const img of images) {
      if (!urlsRef.current.has(img.id)) {
        urlsRef.current.set(img.id, URL.createObjectURL(img.file));
      }
    }
  }, [images]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const url of urlsRef.current.values()) URL.revokeObjectURL(url);
      urlsRef.current.clear();
    };
  }, []);

  return (id: string) => urlsRef.current.get(id) ?? null;
}

// ─── Image list item ──────────────────────────────────────────────────────────

function ImageListItem({
  image,
  index,
  total,
  thumbUrl,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  image: ImageFile;
  index: number;
  total: number;
  thumbUrl: string | null;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const isPng = image.name.toLowerCase().endsWith('.png');

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
      aria-label={`${image.name}, image ${index + 1} of ${total}`}
    >
      {/* Drag handle */}
      <svg className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
      </svg>

      {/* Order badge */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-xs font-medium text-blue-600 dark:text-blue-400 tabular-nums" aria-hidden="true">
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        ) : (
          <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
          </svg>
        )}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300" title={image.name}>
          {image.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {formatFileSize(image.size)}
          {image.width && image.height && ` · ${image.width}×${image.height}`}
          {' · '}
          <span className={isPng ? 'text-purple-500' : 'text-orange-500'}>{isPng ? 'PNG' : 'JPG'}</span>
        </p>
      </div>

      {/* Move up/down */}
      <div className="flex items-center gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label={`Move ${image.name} up`}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label={`Move ${image.name} down`}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Remove */}
      <button type="button" onClick={onRemove} aria-label={`Remove ${image.name}`}
        className="rounded p-1 text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-colors">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}

// ─── Options panel ─────────────────────────────────────────────────────────────

function OptionsPanel({
  opts,
  onChange,
}: {
  opts: ConvertOptions;
  onChange: (patch: Partial<ConvertOptions>) => void;
}) {
  const pageSizes: { id: PageSizePreset; label: string }[] = [
    { id: 'a4', label: 'A4' },
    { id: 'letter', label: 'Letter' },
    { id: 'a3', label: 'A3' },
    { id: 'original', label: 'Original size' },
    { id: 'custom', label: 'Custom' },
  ];

  const orientations: { id: OrientationMode; label: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'landscape', label: 'Landscape' },
  ];

  const margins: { id: MarginPreset; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
    { id: 'custom', label: 'Custom' },
  ];

  const placements: { id: PlacementMode; label: string; desc: string }[] = [
    { id: 'fit', label: 'Fit', desc: 'Fit entire image within page' },
    { id: 'fill', label: 'Fill', desc: 'Fill page, may crop edges' },
    { id: 'center', label: 'Center', desc: 'Original size, centered' },
    { id: 'original', label: 'Natural', desc: 'Natural pixel size' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page options</h2>

      {/* Page size */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Page size</legend>
        <div className="flex flex-wrap gap-1.5">
          {pageSizes.map(({ id, label }) => (
            <label key={id} className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
              opts.pageSize === id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400',
            ].join(' ')}>
              <input type="radio" name="pageSize" value={id} checked={opts.pageSize === id}
                onChange={() => onChange({ pageSize: id })} className="sr-only" />
              {label}
              {id !== 'original' && id !== 'custom' && (
                <span className="text-gray-400 dark:text-gray-600">
                  {Math.round(PAGE_SIZE_PRESETS[id].width)}×{Math.round(PAGE_SIZE_PRESETS[id].height)}pt
                </span>
              )}
            </label>
          ))}
        </div>
        {opts.pageSize === 'custom' && (
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-gray-500">W:</label>
            <input type="number" min={72} max={2383} step={1} value={Math.round(opts.customWidth)}
              onChange={(e) => onChange({ customWidth: parseFloat(e.target.value) || 595 })}
              className="w-20 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label className="text-xs text-gray-500">H:</label>
            <input type="number" min={72} max={2383} step={1} value={Math.round(opts.customHeight)}
              onChange={(e) => onChange({ customHeight: parseFloat(e.target.value) || 842 })}
              className="w-20 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-xs text-gray-400">points</span>
          </div>
        )}
      </fieldset>

      {/* Orientation */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Orientation</legend>
        <div className="flex gap-1.5">
          {orientations.map(({ id, label }) => (
            <label key={id} className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
              opts.orientation === id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400',
            ].join(' ')}>
              <input type="radio" name="orientation" value={id} checked={opts.orientation === id}
                onChange={() => onChange({ orientation: id })} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Margins */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Margins</legend>
        <div className="flex flex-wrap gap-1.5">
          {margins.map(({ id, label }) => (
            <label key={id} className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
              opts.margin === id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400',
            ].join(' ')}>
              <input type="radio" name="margin" value={id} checked={opts.margin === id}
                onChange={() => onChange({ margin: id })} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
        {opts.margin === 'custom' && (
          <div className="mt-2 flex items-center gap-2">
            <label htmlFor="custom-margin" className="text-xs text-gray-500">Margin:</label>
            <input id="custom-margin" type="number" min={0} max={200} step={1}
              value={Math.round(opts.customMargin)}
              onChange={(e) => onChange({ customMargin: parseFloat(e.target.value) || 0 })}
              className="w-20 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-xs text-gray-400">points (~{Math.round((opts.customMargin / 2.835) * 10) / 10}mm)</span>
          </div>
        )}
      </fieldset>

      {/* Placement */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Image placement</legend>
        <div className="flex flex-wrap gap-1.5">
          {placements.map(({ id, label, desc }) => (
            <label key={id} title={desc} className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
              opts.placement === id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400',
            ].join(' ')}>
              <input type="radio" name="placement" value={id} checked={opts.placement === id}
                onChange={() => onChange({ placement: id })} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
          {placements.find((p) => p.id === opts.placement)?.desc}
        </p>
      </fieldset>

      {/* JPEG quality */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          JPEG quality — {Math.round(opts.jpegQuality * 100)}%
        </label>
        <input type="range" min={50} max={100} step={5}
          value={Math.round(opts.jpegQuality * 100)}
          onChange={(e) => onChange({ jpegQuality: parseInt(e.target.value, 10) / 100 })}
          aria-label={`JPEG quality ${Math.round(opts.jpegQuality * 100)}%`}
          className="w-full max-w-xs accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 max-w-xs mt-0.5">
          <span>Smaller file</span><span>Better quality</span>
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">PNG images are always lossless</p>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function JpgPngToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [opts, setOpts] = useState<ConvertOptions>({ ...DEFAULT_OPTIONS });
  const [convertState, setConvertState] = useState<ConvertState>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<ConvertOutcome | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getThumbUrl = useImageObjectUrls(images);

  const handleImagesSelected = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = newImages.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    setConvertState('idle');
    setResult(null);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((f) => f.id !== id));
    setConvertState('idle');
    setResult(null);
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setConvertState('idle');
    setResult(null);
  }, []);

  const moveUp = useCallback((index: number) => {
    setImages((prev) => {
      if (index === 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const dragSrcIndex = useRef<number | null>(null);
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragSrcIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (_index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === targetIndex) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(src, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragSrcIndex.current = null;
  };

  const handleConvert = useCallback(async () => {
    if (images.length === 0 || convertState === 'converting') return;
    setConvertState('converting');
    setResult(null);
    setProgress({ done: 0, total: images.length });
    setProgressMsg('Preparing images…');

    const ac = new AbortController();
    abortRef.current = ac;

    const { convertImagesToPdf } = await import('@/lib/pdf/fromImages');
    const outcome = await convertImagesToPdf(
      images,
      opts,
      (done, total) => {
        setProgress({ done, total });
        setProgressMsg(`Processing image ${done} of ${total}…`);
      },
      ac.signal,
    );

    abortRef.current = null;
    setProgressMsg('');
    setResult(outcome);
    setConvertState(outcome.success ? 'done' : 'error');
  }, [images, opts, convertState]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setImages([]);
    setConvertState('idle');
    setResult(null);
    setProgress({ done: 0, total: 0 });
    setProgressMsg('');
  }, []);

  const patchOpts = useCallback((patch: Partial<ConvertOptions>) => {
    setOpts((prev) => ({ ...prev, ...patch }));
  }, []);

  const isProcessing = convertState === 'converting';
  const canConvert = images.length > 0 && !isProcessing;
  const totalSize = images.reduce((s, f) => s + f.size, 0);

  return (
    <PdfToolLayout
      title="JPG / PNG to PDF"
      description="Convert JPG and PNG images into a single PDF entirely in your browser. Arrange images, choose page size and margins — your images never leave your device."
      breadcrumbs={[
        { label: 'PDF Tools', href: '/pdf-tools' },
        { label: 'JPG / PNG to PDF' },
      ]}
    >
      {/* Success */}
      {convertState === 'done' && result?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">PDF created successfully</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Images</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{images.length}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pages</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{result.pageCount}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">File size</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(result.sizeBytes)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PdfDownload blob={result.blob} filename={result.filename} label="Download PDF" />
            <button type="button" onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Create another PDF
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {convertState === 'error' && result && !result.success && (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Conversion failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{result.error}</p>
            <button type="button" onClick={() => { setConvertState('idle'); setResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Image list + options */}
      {images.length > 0 && convertState !== 'done' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {images.length} image{images.length !== 1 ? 's' : ''} · {formatFileSize(totalSize)}
            </h2>
            <button type="button" onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Remove all images">
              Clear all
            </button>
          </div>

          {/* Image list */}
          <ul className="space-y-2" aria-label="Selected images" role="list">
            {images.map((image, index) => (
              <ImageListItem
                key={image.id}
                image={image}
                index={index}
                total={images.length}
                thumbUrl={getThumbUrl(image.id)}
                onMoveUp={() => moveUp(index)}
                onMoveDown={() => moveDown(index)}
                onRemove={() => removeImage(image.id)}
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver(index)}
                onDrop={onDrop(index)}
              />
            ))}
          </ul>

          {/* Add more */}
          <ImageDropzone onFilesSelected={handleImagesSelected} compact multiple maxFiles={50} />

          {/* Options */}
          <OptionsPanel opts={opts} onChange={patchOpts} />

          {/* Convert button */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleConvert}
              disabled={!canConvert}
              aria-busy={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isProcessing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {progressMsg || 'Converting…'}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create PDF from {images.length} image{images.length !== 1 ? 's' : ''}
                </>
              )}
            </button>

            {isProcessing && (
              <>
                {progress.total > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                    {progress.done}/{progress.total}
                  </p>
                )}
                <button type="button" onClick={handleCancel}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <ImageDropzone onFilesSelected={handleImagesSelected} multiple maxFiles={50} />
      )}
    </PdfToolLayout>
  );
}
