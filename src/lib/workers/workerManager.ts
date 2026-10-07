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
