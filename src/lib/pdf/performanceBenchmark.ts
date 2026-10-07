export interface BenchmarkResult {
  operation: string;
  fileSize: number;
  pageCount: number;
  durationMs: number;
  timestamp: number;
}

export function recordBenchmark(
  result: Omit<BenchmarkResult, 'timestamp'>,
): BenchmarkResult {
  return { ...result, timestamp: Date.now() };
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function isBenchmarkResult(val: unknown): val is BenchmarkResult {
  if (!val || typeof val !== 'object') return false;
  const v = val as Record<string, unknown>;
  return (
    typeof v.operation === 'string' &&
    typeof v.fileSize === 'number' &&
    typeof v.pageCount === 'number' &&
    typeof v.durationMs === 'number' &&
    typeof v.timestamp === 'number'
  );
}
