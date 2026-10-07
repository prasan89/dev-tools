import {
  recordBenchmark,
  formatDuration,
  isBenchmarkResult,
} from '../src/lib/pdf/performanceBenchmark';

describe('recordBenchmark', () => {
  it('adds a numeric timestamp', () => {
    const result = recordBenchmark({ operation: 'merge', fileSize: 1024, pageCount: 5, durationMs: 200 });
    expect(typeof result.timestamp).toBe('number');
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it('preserves all input fields', () => {
    const result = recordBenchmark({ operation: 'compress', fileSize: 2048, pageCount: 10, durationMs: 1500 });
    expect(result.operation).toBe('compress');
    expect(result.fileSize).toBe(2048);
    expect(result.pageCount).toBe(10);
    expect(result.durationMs).toBe(1500);
  });
});

describe('formatDuration', () => {
  it('formats ms < 1000 with ms suffix', () => {
    expect(formatDuration(456)).toBe('456ms');
  });

  it('formats ms >= 1000 with s suffix', () => {
    expect(formatDuration(1230)).toBe('1.23s');
  });

  it('formats 0ms', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('formats exactly 1000ms', () => {
    expect(formatDuration(1000)).toBe('1.00s');
  });

  it('rounds ms values', () => {
    expect(formatDuration(456.7)).toBe('457ms');
  });
});

describe('isBenchmarkResult', () => {
  it('returns true for valid result', () => {
    expect(isBenchmarkResult({ operation: 'ocr', fileSize: 100, pageCount: 1, durationMs: 500, timestamp: 1234567890 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isBenchmarkResult(null)).toBe(false);
  });

  it('returns false when operation is missing', () => {
    expect(isBenchmarkResult({ fileSize: 100, pageCount: 1, durationMs: 500, timestamp: 123 })).toBe(false);
  });

  it('returns false when durationMs is not a number', () => {
    expect(isBenchmarkResult({ operation: 'merge', fileSize: 100, pageCount: 1, durationMs: '500', timestamp: 123 })).toBe(false);
  });
});

describe('performance layout metadata', () => {
  it('title contains fast PDF or performance', async () => {
    const mod = await import('../src/app/pdf-tools/performance/layout');
    const { metadata } = mod;
    expect(String(metadata.title).toLowerCase()).toMatch(/fast|performance/);
  });

  it('canonical contains performance', async () => {
    const mod = await import('../src/app/pdf-tools/performance/layout');
    const { metadata } = mod;
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('performance');
  });
});
