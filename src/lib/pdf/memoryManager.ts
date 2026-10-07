export interface MemoryThreshold {
  warnMB: number;
  errorMB: number;
}

export const DEFAULT_THRESHOLD: MemoryThreshold = {
  warnMB: 100,
  errorMB: 500,
};

export function getFileSizeMB(fileSizeBytes: number): number {
  return fileSizeBytes / (1024 * 1024);
}

export function isFileSafe(
  fileSizeBytes: number,
  threshold: MemoryThreshold = DEFAULT_THRESHOLD,
): boolean {
  return fileSizeBytes < threshold.errorMB * 1024 * 1024;
}

export function shouldWarnAboutSize(
  fileSizeBytes: number,
  threshold: MemoryThreshold = DEFAULT_THRESHOLD,
): boolean {
  return fileSizeBytes >= threshold.warnMB * 1024 * 1024;
}

export function getMemoryWarningMessage(fileSizeMB: number): string {
  return `This file is ${fileSizeMB.toFixed(1)} MB. Large files may be slow to process on lower-powered devices.`;
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [arr.slice()];
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

export function revokeObjectUrls(urls: (string | null | undefined)[]): void {
  for (const url of urls) {
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
  }
}

export interface CancellationToken {
  cancelled: boolean;
  cancel(): void;
}

export function createCancellationToken(): CancellationToken {
  return {
    cancelled: false,
    cancel() {
      this.cancelled = true;
    },
  };
}

export function releaseCanvas(canvas: HTMLCanvasElement | null): void {
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function safeArrayBufferCopy(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0);
}
