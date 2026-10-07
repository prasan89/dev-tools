'use client';

import { useCallback, useRef, useState } from 'react';
import {
  addScanPage,
  buildScanPdf,
  moveScanPage,
  removeScanPage,
  rotateScanPage,
  setColorMode,
} from '@/lib/pdf/scanToPdf';
import type { ColorMode, ScanPage } from '@/lib/pdf/scanToPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

type PageSize = 'fit' | 'A4' | 'Letter';

export default function ScanToPdfPage() {
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [building, setBuilding] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
    );
    if (!arr.length) return;
    setResultBlob(null);
    setError(null);
    setPages((prev) => {
      let next = [...prev];
      const newPreviews: Record<string, string> = {};
      for (const file of arr) {
        const id = crypto.randomUUID();
        next = addScanPage(next, file);
        // Create preview URL for the last added page
        newPreviews[next[next.length - 1].id] = URL.createObjectURL(file);
      }
      setPreviews((p) => ({ ...p, ...newPreviews }));
      return next;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleRemove = useCallback((id: string) => {
    setPages((prev) => removeScanPage(prev, id));
    setPreviews((prev) => {
      const next = { ...prev };
      if (next[id]) URL.revokeObjectURL(next[id]);
      delete next[id];
      return next;
    });
  }, []);

  const handleBuild = useCallback(async () => {
    setBuilding(true);
    setError(null);
    setResultBlob(null);
    const result = await buildScanPdf(pages, pageSize);
    setBuilding(false);
    if (result.success && result.outputFile) {
      setResultBlob(result.outputFile.blob);
    } else {
      setError(result.error ?? 'Failed to build PDF');
    }
  }, [pages, pageSize]);

  const colorModeLabel: Record<ColorMode, string> = {
    original: 'Original',
    grayscale: 'Grayscale',
    blackwhite: 'B&W',
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scan / Image to PDF</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert scanned images to a PDF. Reorder pages, rotate, apply grayscale or B&amp;W — all in your browser.
        </p>
      </div>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop images here or click to select"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 p-10 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Drop images here or click to select</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP accepted</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-hidden="true"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Page list */}
      {pages.length > 0 && (
        <section aria-label="Scan pages">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Pages ({pages.length})
            </h2>
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-xs text-gray-500 dark:text-gray-400">
                Page size:
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fit">Fit to Image</option>
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>

          <ul className="space-y-2">
            {pages.map((page, idx) => (
              <li
                key={page.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
              >
                {/* Thumbnail */}
                {previews[page.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previews[page.id]}
                    alt={`Page ${idx + 1}: ${page.file.name}`}
                    className="h-14 w-10 object-cover rounded border border-gray-200 dark:border-gray-700 shrink-0"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                ) : (
                  <div className="h-14 w-10 bg-gray-100 dark:bg-gray-800 rounded shrink-0" aria-hidden="true" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {idx + 1}. {page.file.name}
                  </p>
                  <p className="text-xs text-gray-400">{(page.file.size / 1024).toFixed(0)} KB</p>
                </div>

                {/* Color mode */}
                <div className="flex gap-1">
                  {(['original', 'grayscale', 'blackwhite'] as ColorMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPages((prev) => setColorMode(prev, page.id, mode))}
                      aria-pressed={page.colorMode === mode}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        page.colorMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {colorModeLabel[mode]}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPages((prev) => moveScanPage(prev, page.id, 'up'))}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPages((prev) => moveScanPage(prev, page.id, 'down'))}
                    disabled={idx === pages.length - 1}
                    aria-label="Move down"
                    className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPages((prev) => rotateScanPage(prev, page.id))}
                    aria-label="Rotate 90°"
                    className="rounded p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(page.id)}
                    aria-label="Remove page"
                    className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Build */}
      {pages.length > 0 && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleBuild}
            disabled={building}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {building ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Building PDF…
              </>
            ) : (
              `Build PDF (${pages.length} page${pages.length !== 1 ? 's' : ''})`
            )}
          </button>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {resultBlob && (
            <PdfDownload
              blob={resultBlob}
              filename="scanned_document.pdf"
              label="Download Scanned PDF"
            />
          )}
        </div>
      )}
    </div>
  );
}
