'use client';

import { useState, useCallback, useRef } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import {
  createBatchJob,
  updateJobStatus,
  completedJobs,
  generateBatchZip,
  makePdfFileFromJob,
  type BatchJob,
  type BatchOperation,
} from '@/lib/pdf/batchProcessor';

const OPERATIONS: { value: BatchOperation; label: string }[] = [
  { value: 'compress', label: 'Compress' },
  { value: 'watermark', label: 'Watermark (DRAFT)' },
  { value: 'metadata-clean', label: 'Clean Metadata' },
  { value: 'page-numbers', label: 'Add Page Numbers' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function BatchPage() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [operation, setOperation] = useState<BatchOperation>('compress');
  const [concurrency] = useState(2);
  const [running, setRunning] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const cancelRef = useRef(false);

  const handleFiles = useCallback((files: PdfFile[]) => {
    setJobs((prev) => [
      ...prev,
      ...files.map((f) => createBatchJob(f.file)),
    ]);
    setZipBlob(null);
  }, []);

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const clearAll = () => {
    setJobs([]);
    setZipBlob(null);
  };

  const runOperation = async (job: BatchJob): Promise<{ blob: Blob; filename: string } | null> => {
    const pdfFile = makePdfFileFromJob(job);
    try {
      if (operation === 'compress') {
        const { compressPdf, DEFAULT_OPTIONS } = await import('@/lib/pdf/compress');
        const result = await compressPdf(pdfFile, DEFAULT_OPTIONS);
        if (result.success) return { blob: result.blob, filename: result.filename };
      } else if (operation === 'watermark') {
        const { buildWatermarkedPdf, defaultTextConfig } = await import('@/lib/pdf/watermarkPdf');
        const config = { ...defaultTextConfig(), text: 'DRAFT' };
        const result = await buildWatermarkedPdf(pdfFile, config);
        if (result.success && result.outputFile) return result.outputFile;
      } else if (operation === 'metadata-clean') {
        const { buildMetadataEditedPdf, emptyMetadata } = await import('@/lib/pdf/pdfMetadata');
        const result = await buildMetadataEditedPdf(pdfFile, emptyMetadata(), true);
        if (result.success && result.outputFile) return result.outputFile;
      } else if (operation === 'page-numbers') {
        const { buildPageNumberedPdf, defaultConfig } = await import('@/lib/pdf/pageNumbers');
        const result = await buildPageNumberedPdf(pdfFile, defaultConfig());
        if (result.success && result.outputFile) return result.outputFile;
      }
    } catch {
      // handled below
    }
    return null;
  };

  const processAll = async () => {
    cancelRef.current = false;
    setRunning(true);
    setZipBlob(null);

    const queue = jobs.filter((j) => j.status === 'pending').map((j) => j.id);
    let idx = 0;

    const processNext = async () => {
      while (idx < queue.length) {
        if (cancelRef.current) break;
        const id = queue[idx++];
        setJobs((prev) => updateJobStatus(prev, id, { status: 'processing', progress: 10 }));
        const job = jobs.find((j) => j.id === id);
        if (!job) continue;
        try {
          const out = await runOperation(job);
          if (cancelRef.current) break;
          if (out) {
            setJobs((prev) =>
              updateJobStatus(prev, id, {
                status: 'completed',
                progress: 100,
                resultBlob: out.blob,
                resultFilename: out.filename,
              }),
            );
          } else {
            setJobs((prev) => updateJobStatus(prev, id, { status: 'failed', error: 'Operation failed' }));
          }
        } catch (err) {
          setJobs((prev) =>
            updateJobStatus(prev, id, {
              status: 'failed',
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
          );
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => processNext());
    await Promise.all(workers);
    setRunning(false);
  };

  const cancel = () => {
    cancelRef.current = true;
    setJobs((prev) =>
      prev.map((j) => (j.status === 'pending' || j.status === 'processing') ? { ...j, status: 'cancelled' } : j),
    );
    setRunning(false);
  };

  const downloadJob = (job: BatchJob) => {
    if (!job.resultBlob || !job.resultFilename) return;
    const url = URL.createObjectURL(job.resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = job.resultFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    const blob = await generateBatchZip(jobs);
    setZipBlob(blob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_results.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const done = completedJobs(jobs).length;
  const total = jobs.length;
  const overallProgress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Batch PDF Processing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Process multiple PDFs at once. All operations run locally — your files never leave your device.
        </p>
      </div>

      {/* Operation selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Operation:</label>
        <div className="flex flex-wrap gap-2">
          {OPERATIONS.map((op) => (
            <button
              key={op.value}
              onClick={() => setOperation(op.value)}
              disabled={running}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                operation === op.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone */}
      {!running && (
        <PdfDropzone
          onFilesSelected={handleFiles}
          multiple
          maxFiles={20}
        />
      )}

      {/* Queue */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Queue ({jobs.length} file{jobs.length !== 1 ? 's' : ''})
            </h2>
            {!running && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Overall progress */}
          {running && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall progress</span>
                <span>{done}/{total}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{job.filename}</p>
                  {job.error && (
                    <p className="text-xs text-red-500 mt-0.5 truncate">{job.error}</p>
                  )}
                  {job.status === 'processing' && (
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] ?? ''}`}>
                  {job.status}
                </span>
                {job.status === 'completed' && job.resultBlob && (
                  <button
                    onClick={() => downloadJob(job)}
                    className="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Download
                  </button>
                )}
                {!running && job.status !== 'processing' && (
                  <button
                    onClick={() => removeJob(job.id)}
                    className="shrink-0 text-gray-400 hover:text-red-500"
                    aria-label={`Remove ${job.filename}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {jobs.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {!running ? (
            <button
              onClick={processAll}
              disabled={jobs.every((j) => j.status !== 'pending')}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Process All
            </button>
          ) : (
            <button
              onClick={cancel}
              className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Cancel
            </button>
          )}
          {done > 0 && !running && (
            <button
              onClick={downloadZip}
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Download All as ZIP ({done})
            </button>
          )}
        </div>
      )}

      {zipBlob && (
        <p className="text-xs text-green-700 dark:text-green-400">ZIP downloaded with {done} file{done !== 1 ? 's' : ''}.</p>
      )}
    </div>
  );
}
