/**
 * Worker utilities and WorkerManager — reusable Web Worker runtime for PDFTools.
 *
 * Architecture:
 *   UI → WorkerManager.submit() → Worker(scriptUrl) → postMessage → result back to UI
 *
 * Features:
 * - Unique job IDs via crypto.randomUUID()
 * - Progress callbacks
 * - Cancellation (sends 'cancel' message to worker, then terminates)
 * - Timeout handling
 * - Controlled concurrency
 * - Transferable ArrayBuffer support
 * - Memory-safe lifecycle (terminates workers on completion/error/cancel)
 */

// ─── Low-level message utilities (used by worker scripts themselves) ─────────

export type WorkerJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkerJob<TInput = unknown, TOutput = unknown> {
  id: string;
  status: WorkerJobStatus;
  input?: TInput;
  output?: TOutput;
  progress: number;
  error?: string;
}

export interface WorkerMessage {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  jobId: string;
  payload?: unknown;
  progress?: number;
}

const VALID_TYPES = new Set<string>(['start', 'progress', 'complete', 'error', 'cancel']);

export function createJobId(): string {
  return crypto.randomUUID();
}

export function isValidWorkerMessage(msg: unknown): msg is WorkerMessage {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.type === 'string' &&
    VALID_TYPES.has(m.type) &&
    typeof m.jobId === 'string' &&
    m.jobId.length > 0
  );
}

export function createWorkerJob<T>(input: T): WorkerJob<T> {
  return {
    id: createJobId(),
    status: 'pending',
    input,
    progress: 0,
  };
}

export function updateWorkerJob<T, R>(
  job: WorkerJob<T, R>,
  patch: Partial<WorkerJob<T, R>>,
): WorkerJob<T, R> {
  return { ...job, ...patch };
}

// ─── WorkerManager class ──────────────────────────────────────────────────────

export type ManagedJobStatus = WorkerJobStatus;

export interface ManagedJob<TInput = unknown, TOutput = unknown> {
  id: string;
  status: ManagedJobStatus;
  input: TInput;
  output?: TOutput;
  progress: number;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface WorkerManagerOptions {
  /** Maximum concurrently running workers. Default: 2 */
  maxConcurrency?: number;
  /** Job timeout in ms. Default: 120_000 (2 min) */
  timeoutMs?: number;
}

export type ProgressCallback = (jobId: string, progress: number) => void;
export type CompletionCallback<TOutput> = (jobId: string, output: TOutput) => void;
export type ErrorCallback = (jobId: string, error: string) => void;

interface PendingJob<TInput, TOutput> {
  job: ManagedJob<TInput, TOutput>;
  workerUrl: string;
  transferable?: Transferable[];
  onProgress?: ProgressCallback;
  onComplete: CompletionCallback<TOutput>;
  onError: ErrorCallback;
  reject: (err: Error) => void;
}

/**
 * WorkerManager manages a pool of Web Workers with a configurable concurrency limit.
 *
 * Usage:
 *   const manager = new WorkerManager({ maxConcurrency: 2 });
 *   const { jobId, result } = manager.submit('/workers/compress.worker.js', input, { transferable: [buf] });
 *   manager.cancel(jobId);
 *   const output = await result;
 */
export class WorkerManager {
  private readonly maxConcurrency: number;
  private readonly timeoutMs: number;
  private queue: PendingJob<unknown, unknown>[] = [];
  private active = new Map<string, { worker: Worker; timeoutId: ReturnType<typeof setTimeout> }>();
  private jobs = new Map<string, ManagedJob<unknown, unknown>>();

  constructor(options: WorkerManagerOptions = {}) {
    this.maxConcurrency = Math.max(1, options.maxConcurrency ?? 2);
    this.timeoutMs = options.timeoutMs ?? 120_000;
  }

  /**
   * Submit a job to a Worker script.
   * @param workerScriptUrl  Path to the Worker script (in /public/workers/)
   * @param input            Structured-clone-safe input
   * @param opts             Optional transferable buffers, progress/error callbacks
   */
  submit<TInput, TOutput>(
    workerScriptUrl: string,
    input: TInput,
    opts: {
      transferable?: Transferable[];
      onProgress?: ProgressCallback;
      onError?: ErrorCallback;
    } = {},
  ): { jobId: string; result: Promise<TOutput> } {
    const jobId = createJobId();
    const job: ManagedJob<TInput, TOutput> = {
      id: jobId,
      status: 'pending',
      input,
      progress: 0,
    };
    this.jobs.set(jobId, job as ManagedJob<unknown, unknown>);

    const result = new Promise<TOutput>((resolve, reject) => {
      const pending: PendingJob<TInput, TOutput> = {
        job,
        workerUrl: workerScriptUrl,
        transferable: opts.transferable,
        onProgress: opts.onProgress,
        onComplete: (_id, output) => resolve(output),
        onError: (_id, err) => {
          opts.onError?.(_id, err);
          reject(new Error(err));
        },
        reject,
      };
      this.queue.push(pending as PendingJob<unknown, unknown>);
      this._drain();
    });

    return { jobId, result };
  }

  /**
   * Cancel a running or pending job.
   * Running workers receive a 'cancel' message then are terminated.
   */
  cancel(jobId: string): void {
    const queueIdx = this.queue.findIndex((p) => p.job.id === jobId);
    if (queueIdx !== -1) {
      const [pending] = this.queue.splice(queueIdx, 1);
      this._updateJob(jobId, { status: 'cancelled' });
      pending.reject(new Error('Cancelled'));
      return;
    }

    const active = this.active.get(jobId);
    if (active) {
      try { active.worker.postMessage({ type: 'cancel', jobId }); } catch { /* best-effort */ }
      clearTimeout(active.timeoutId);
      active.worker.terminate();
      this.active.delete(jobId);
      this._updateJob(jobId, { status: 'cancelled' });
      this._drain();
    }
  }

  getJob(jobId: string): ManagedJob<unknown, unknown> | undefined {
    return this.jobs.get(jobId);
  }

  isActive(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    return job?.status === 'pending' || job?.status === 'running';
  }

  /** Terminate all workers and reject all pending promises. */
  destroy(): void {
    for (const [, { worker, timeoutId }] of this.active) {
      clearTimeout(timeoutId);
      worker.terminate();
    }
    this.active.clear();
    for (const pending of this.queue) {
      pending.reject(new Error('WorkerManager destroyed'));
    }
    this.queue = [];
    this.jobs.clear();
  }

  private _drain(): void {
    while (this.active.size < this.maxConcurrency && this.queue.length > 0) {
      this._startJob(this.queue.shift()!);
    }
  }

  private _startJob(pending: PendingJob<unknown, unknown>): void {
    const { job, workerUrl, transferable, onProgress, onComplete, onError, reject } = pending;
    const jobId = job.id;

    let worker: Worker;
    try {
      worker = new Worker(workerUrl, { type: 'module' });
    } catch (err) {
      this._updateJob(jobId, { status: 'failed', error: String(err) });
      reject(err instanceof Error ? err : new Error(String(err)));
      this._drain();
      return;
    }

    this._updateJob(jobId, { status: 'running', startedAt: Date.now() });

    const timeoutId = setTimeout(() => {
      worker.terminate();
      this.active.delete(jobId);
      const msg = `Job ${jobId} timed out after ${this.timeoutMs}ms`;
      this._updateJob(jobId, { status: 'failed', error: msg });
      onError(jobId, msg);
      reject(new Error(msg));
      this._drain();
    }, this.timeoutMs);

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!isValidWorkerMessage(msg) || msg.jobId !== jobId) return;

      if (msg.type === 'progress') {
        const pct = typeof msg.progress === 'number' ? msg.progress : 0;
        this._updateJob(jobId, { progress: pct });
        onProgress?.(jobId, pct);
      } else if (msg.type === 'complete') {
        clearTimeout(timeoutId);
        worker.terminate();
        this.active.delete(jobId);
        this._updateJob(jobId, {
          status: 'completed',
          output: msg.payload,
          progress: 100,
          completedAt: Date.now(),
        });
        onComplete(jobId, msg.payload as never);
        this._drain();
      } else if (msg.type === 'error') {
        clearTimeout(timeoutId);
        worker.terminate();
        this.active.delete(jobId);
        const errMsg = typeof msg.payload === 'string' ? msg.payload : 'Worker error';
        this._updateJob(jobId, { status: 'failed', error: errMsg });
        onError(jobId, errMsg);
        reject(new Error(errMsg));
        this._drain();
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      clearTimeout(timeoutId);
      worker.terminate();
      this.active.delete(jobId);
      const errMsg = err.message || 'Worker crashed';
      this._updateJob(jobId, { status: 'failed', error: errMsg });
      onError(jobId, errMsg);
      reject(new Error(errMsg));
      this._drain();
    };

    this.active.set(jobId, { worker, timeoutId });

    const startMsg = { type: 'start', jobId, payload: job.input };
    if (transferable?.length) {
      worker.postMessage(startMsg, transferable);
    } else {
      worker.postMessage(startMsg);
    }
  }

  private _updateJob(jobId: string, patch: Partial<ManagedJob<unknown, unknown>>): void {
    const existing = this.jobs.get(jobId);
    if (existing) {
      this.jobs.set(jobId, { ...existing, ...patch });
    }
  }
}
