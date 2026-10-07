import type { PdfFile } from '@/types/pdf';

export type BatchOperation = 'compress' | 'watermark' | 'metadata-clean' | 'page-numbers';
export type BatchJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchJob {
  id: string;
  file: File;
  filename: string;
  status: BatchJobStatus;
  progress: number;
  resultBlob?: Blob;
  resultFilename?: string;
  error?: string;
}

export interface BatchConfig {
  operation: BatchOperation;
  concurrency: number;
}

export function createBatchJob(file: File): BatchJob {
  return {
    id: crypto.randomUUID(),
    file,
    filename: file.name,
    status: 'pending',
    progress: 0,
  };
}

export function updateJobStatus(
  jobs: BatchJob[],
  id: string,
  patch: Partial<BatchJob>,
): BatchJob[] {
  return jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
}

export function pendingJobs(jobs: BatchJob[]): BatchJob[] {
  return jobs.filter((j) => j.status === 'pending');
}

export function completedJobs(jobs: BatchJob[]): BatchJob[] {
  return jobs.filter((j) => j.status === 'completed');
}

export function failedJobs(jobs: BatchJob[]): BatchJob[] {
  return jobs.filter((j) => j.status === 'failed');
}

export async function generateBatchZip(jobs: BatchJob[]): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  for (const job of completedJobs(jobs)) {
    if (job.resultBlob && job.resultFilename) {
      zip.file(job.resultFilename, job.resultBlob);
    }
  }
  const content = await zip.generateAsync({ type: 'uint8array' });
  return new Blob([content.buffer as ArrayBuffer], { type: 'application/zip' });
}

export function makePdfFileFromJob(job: BatchJob): PdfFile {
  return {
    id: job.id,
    name: job.filename,
    size: job.file.size,
    file: job.file,
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}
