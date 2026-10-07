/**
 * M67 — Batch PDF Processor tests
 */

import {
  createBatchJob,
  updateJobStatus,
  pendingJobs,
  completedJobs,
  failedJobs,
  generateBatchZip,
} from '../src/lib/pdf/batchProcessor';
import type { BatchJob } from '../src/lib/pdf/batchProcessor';

// ─── jszip mock ───────────────────────────────────────────────────────────────

const mockZipFile = jest.fn();
const mockGenerateAsync = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockZipInstance = { file: mockZipFile, generateAsync: mockGenerateAsync };

jest.mock('jszip', () => jest.fn().mockImplementation(() => mockZipInstance), { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateAsync.mockResolvedValue(new Uint8Array([1, 2, 3]));
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeFile(name = 'test.pdf'): File {
  return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], name, { type: 'application/pdf' });
}

function makeCompletedJob(name = 'out.pdf'): BatchJob {
  return {
    ...createBatchJob(makeFile(name)),
    status: 'completed',
    progress: 100,
    resultBlob: new Blob(['pdf'], { type: 'application/pdf' }),
    resultFilename: name,
  };
}

// ─── createBatchJob ───────────────────────────────────────────────────────────

describe('createBatchJob', () => {
  it('creates job with pending status', () => {
    const job = createBatchJob(makeFile());
    expect(job.status).toBe('pending');
  });

  it('creates job with progress 0', () => {
    const job = createBatchJob(makeFile());
    expect(job.progress).toBe(0);
  });

  it('sets filename from file name', () => {
    const job = createBatchJob(makeFile('report.pdf'));
    expect(job.filename).toBe('report.pdf');
  });

  it('assigns a unique id', () => {
    const j1 = createBatchJob(makeFile());
    const j2 = createBatchJob(makeFile());
    expect(j1.id).not.toBe(j2.id);
  });

  it('stores the file reference', () => {
    const file = makeFile();
    const job = createBatchJob(file);
    expect(job.file).toBe(file);
  });
});

// ─── updateJobStatus ──────────────────────────────────────────────────────────

describe('updateJobStatus', () => {
  it('updates only the specified job', () => {
    const j1 = createBatchJob(makeFile('a.pdf'));
    const j2 = createBatchJob(makeFile('b.pdf'));
    const updated = updateJobStatus([j1, j2], j1.id, { status: 'processing' });
    expect(updated[0].status).toBe('processing');
    expect(updated[1].status).toBe('pending');
  });

  it('applies patch fields', () => {
    const job = createBatchJob(makeFile());
    const updated = updateJobStatus([job], job.id, { progress: 50, status: 'processing' });
    expect(updated[0].progress).toBe(50);
  });

  it('returns same length array', () => {
    const jobs = [createBatchJob(makeFile()), createBatchJob(makeFile())];
    expect(updateJobStatus(jobs, jobs[0].id, { status: 'completed' })).toHaveLength(2);
  });

  it('no-ops for unknown id', () => {
    const job = createBatchJob(makeFile());
    const updated = updateJobStatus([job], 'nonexistent', { status: 'completed' });
    expect(updated[0].status).toBe('pending');
  });
});

// ─── filter helpers ───────────────────────────────────────────────────────────

describe('pendingJobs', () => {
  it('returns only pending jobs', () => {
    const j1 = createBatchJob(makeFile());
    const j2 = { ...createBatchJob(makeFile()), status: 'completed' as const };
    expect(pendingJobs([j1, j2])).toHaveLength(1);
    expect(pendingJobs([j1, j2])[0].id).toBe(j1.id);
  });

  it('returns empty array when none pending', () => {
    const j = { ...createBatchJob(makeFile()), status: 'completed' as const };
    expect(pendingJobs([j])).toHaveLength(0);
  });
});

describe('completedJobs', () => {
  it('returns only completed jobs', () => {
    const j1 = createBatchJob(makeFile());
    const j2 = makeCompletedJob();
    expect(completedJobs([j1, j2])).toHaveLength(1);
  });
});

describe('failedJobs', () => {
  it('returns only failed jobs', () => {
    const j1 = createBatchJob(makeFile());
    const j2 = { ...createBatchJob(makeFile()), status: 'failed' as const, error: 'oops' };
    expect(failedJobs([j1, j2])).toHaveLength(1);
  });
});

// ─── generateBatchZip ─────────────────────────────────────────────────────────

describe('generateBatchZip', () => {
  it('returns a Blob', async () => {
    const jobs = [makeCompletedJob('a.pdf'), makeCompletedJob('b.pdf')];
    const blob = await generateBatchZip(jobs);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('calls zip.file for each completed job', async () => {
    const jobs = [makeCompletedJob('a.pdf'), makeCompletedJob('b.pdf')];
    await generateBatchZip(jobs);
    expect(mockZipFile).toHaveBeenCalledTimes(2);
  });

  it('skips non-completed jobs', async () => {
    const jobs = [createBatchJob(makeFile()), makeCompletedJob('done.pdf')];
    await generateBatchZip(jobs);
    expect(mockZipFile).toHaveBeenCalledTimes(1);
  });

  it('blob type is application/zip', async () => {
    const blob = await generateBatchZip([makeCompletedJob()]);
    expect(blob.type).toBe('application/zip');
  });
});

// ─── Layout SEO ──────────────────────────────────────────────────────────────

describe('batch layout metadata', () => {
  it('title contains batch PDF', async () => {
    const mod = await import('../src/app/pdf-tools/batch/layout');
    expect(String(mod.metadata.title)).toMatch(/batch.+pdf/i);
  });

  it('has batch-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/batch/layout');
    const kws = ((mod.metadata.keywords as string[]) ?? []).join(' ').toLowerCase();
    expect(kws).toMatch(/batch pdf|bulk pdf|process multiple/i);
  });

  it('canonical contains /batch', async () => {
    const mod = await import('../src/app/pdf-tools/batch/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('/batch');
  });
});
