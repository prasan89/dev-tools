import {
  createJobId,
  isValidWorkerMessage,
  createWorkerJob,
  updateWorkerJob,
} from '../src/lib/workers/workerManager';
import type { WorkerMessage } from '../src/lib/workers/workerManager';

describe('createJobId', () => {
  it('returns a string', () => {
    expect(typeof createJobId()).toBe('string');
  });

  it('returns a non-empty string', () => {
    expect(createJobId().length).toBeGreaterThan(0);
  });

  it('returns unique values', () => {
    const a = createJobId();
    const b = createJobId();
    expect(a).not.toBe(b);
  });
});

describe('isValidWorkerMessage', () => {
  it('returns true for a valid message', () => {
    const msg: WorkerMessage = { type: 'start', jobId: 'abc-123' };
    expect(isValidWorkerMessage(msg)).toBe(true);
  });

  it('returns true for all valid types', () => {
    const types = ['start', 'progress', 'complete', 'error', 'cancel'] as const;
    for (const type of types) {
      expect(isValidWorkerMessage({ type, jobId: 'x' })).toBe(true);
    }
  });

  it('returns false for invalid type', () => {
    expect(isValidWorkerMessage({ type: 'unknown', jobId: 'x' })).toBe(false);
  });

  it('returns false when jobId is missing', () => {
    expect(isValidWorkerMessage({ type: 'start' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidWorkerMessage(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isValidWorkerMessage('string')).toBe(false);
  });

  it('returns false when jobId is empty string', () => {
    expect(isValidWorkerMessage({ type: 'start', jobId: '' })).toBe(false);
  });
});

describe('createWorkerJob', () => {
  it('creates job with pending status', () => {
    const job = createWorkerJob({ data: 'test' });
    expect(job.status).toBe('pending');
  });

  it('creates job with zero progress', () => {
    const job = createWorkerJob(42);
    expect(job.progress).toBe(0);
  });

  it('creates job with given input', () => {
    const input = { file: 'test.pdf' };
    const job = createWorkerJob(input);
    expect(job.input).toBe(input);
  });

  it('creates job with a string id', () => {
    const job = createWorkerJob(null);
    expect(typeof job.id).toBe('string');
    expect(job.id.length).toBeGreaterThan(0);
  });
});

describe('updateWorkerJob', () => {
  it('updates status', () => {
    const job = createWorkerJob('x');
    const updated = updateWorkerJob(job, { status: 'running' });
    expect(updated.status).toBe('running');
  });

  it('updates progress', () => {
    const job = createWorkerJob('x');
    const updated = updateWorkerJob(job, { progress: 50 });
    expect(updated.progress).toBe(50);
  });

  it('does not mutate original', () => {
    const job = createWorkerJob('x');
    updateWorkerJob(job, { status: 'completed' });
    expect(job.status).toBe('pending');
  });

  it('preserves unpatched fields', () => {
    const job = createWorkerJob('x');
    const updated = updateWorkerJob(job, { progress: 75 });
    expect(updated.id).toBe(job.id);
    expect(updated.input).toBe(job.input);
  });
});

describe('workers layout metadata', () => {
  it('has a canonical containing workers', async () => {
    const mod = await import('../src/app/pdf-tools/workers/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('workers');
  });
});
