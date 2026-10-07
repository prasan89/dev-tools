'use client';

import { useCallback, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { MergeOutcome } from '@/lib/pdf/merge';

type MergeState = 'idle' | 'merging' | 'done' | 'error';

export default function MergePdfPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [mergeState, setMergeState] = useState<MergeState>('idle');
  const [mergeResult, setMergeResult] = useState<MergeOutcome | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);

  const cleanupDownloadUrl = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
      setDownloadUrl(null);
    }
  }, []);

  const handleFilesSelected = useCallback((newFiles: PdfFile[]) => {
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    setMergeState('idle');
    setMergeResult(null);
    cleanupDownloadUrl();
  }, [cleanupDownloadUrl]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergeState('idle');
    setMergeResult(null);
    cleanupDownloadUrl();
  }, [cleanupDownloadUrl]);

  const clearAll = useCallback(() => {
    setFiles([]);
    setMergeState('idle');
    setMergeResult(null);
    cleanupDownloadUrl();
  }, [cleanupDownloadUrl]);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  // Drag-to-reorder
  const dragSrcIndex = useRef<number | null>(null);

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragSrcIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === targetIndex) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(src, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragSrcIndex.current = null;
  };

  const handleMerge = useCallback(async () => {
    if (files.length < 2 || mergeState === 'merging') return;
    setMergeState('merging');
    cleanupDownloadUrl();

    const { mergePdfFiles } = await import('@/lib/pdf/merge');
    const result = await mergePdfFiles(files);

    if (result.success) {
      const url = URL.createObjectURL(result.blob);
      downloadUrlRef.current = url;
      setDownloadUrl(url);
    }
    setMergeResult(result);
    setMergeState(result.success ? 'done' : 'error');
  }, [files, mergeState, cleanupDownloadUrl]);

  const handleStartOver = useCallback(() => {
    setFiles([]);
    setMergeState('idle');
    setMergeResult(null);
    cleanupDownloadUrl();
  }, [cleanupDownloadUrl]);

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount ?? 0), 0);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const canMerge = files.length >= 2 && mergeState !== 'merging';

  return (
    <PdfToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document. Drag to reorder. Everything happens in your browser — files are never uploaded."
      breadcrumbs={[
        { label: 'PDF Tools', href: '/pdf-tools' },
        { label: 'Merge PDF' },
      ]}
    >
      {/* Success result */}
      {mergeState === 'done' && mergeResult?.success && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">PDFs merged successfully</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pages</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{mergeResult.pageCount}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Size</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(mergeResult.sizeBytes)}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Files merged</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{files.length}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PdfDownload
              blob={mergeResult.blob}
              filename={mergeResult.filename}
              label="Download Merged PDF"
            />
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Merge another set
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {mergeState === 'error' && mergeResult && !mergeResult.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3"
        >
          <svg className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Merge failed</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{mergeResult.error}</p>
            <button
              type="button"
              onClick={() => { setMergeState('idle'); setMergeResult(null); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && mergeState !== 'done' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {totalPages > 0 && ` · ${totalPages} pages`}
              {` · ${formatFileSize(totalSize)}`}
            </h2>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Remove all files"
            >
              Clear all
            </button>
          </div>

          <ul
            className="space-y-2"
            aria-label="Selected PDF files"
            role="list"
          >
            {files.map((file, index) => (
              <li
                key={file.id}
                draggable
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver}
                onDrop={onDrop(index)}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                aria-label={`${file.name}, file ${index + 1} of ${files.length}`}
              >
                {/* Drag handle */}
                <svg
                  className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                </svg>

                {/* Order number */}
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-xs font-medium text-blue-600 dark:text-blue-400 tabular-nums"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                {/* File icon */}
                <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                </svg>

                {/* Filename + meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatFileSize(file.size)}
                    {file.pageCount !== null && ` · ${file.pageCount} page${file.pageCount !== 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Move up/down */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    aria-label={`Move ${file.name} up`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    aria-label={`Move ${file.name} down`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="rounded p-1 text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Add more */}
          <PdfDropzone
            onFilesSelected={handleFilesSelected}
            multiple
            maxFiles={10}
            className="mt-2"
          />

          {/* Merge button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleMerge}
              disabled={!canMerge}
              aria-busy={mergeState === 'merging'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {mergeState === 'merging' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Merging…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Merge {files.length} PDFs
                </>
              )}
            </button>
            {files.length < 2 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Add at least 2 PDFs to merge
              </p>
            )}
            {mergeState === 'merging' && (
              <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                Merging {files.length} files…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state — dropzone */}
      {files.length === 0 && (
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          multiple
          maxFiles={10}
        />
      )}
    </PdfToolLayout>
  );
}
