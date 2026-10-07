import {
  isFileSafe,
  shouldWarnAboutSize,
  getFileSizeMB,
  getMemoryWarningMessage,
  chunkArray,
  revokeObjectUrls,
  createCancellationToken,
  releaseCanvas,
  safeArrayBufferCopy,
  DEFAULT_THRESHOLD,
} from '../src/lib/pdf/memoryManager';

const MB = 1024 * 1024;

// ─── isFileSafe ───────────────────────────────────────────────────────────────

describe('isFileSafe', () => {
  it('returns true for a small file', () => {
    expect(isFileSafe(1 * MB)).toBe(true);
  });

  it('returns true for a 100MB file', () => {
    expect(isFileSafe(100 * MB)).toBe(true);
  });

  it('returns false for a file at the error threshold', () => {
    expect(isFileSafe(DEFAULT_THRESHOLD.errorMB * MB)).toBe(false);
  });

  it('returns false for a file above the error threshold', () => {
    expect(isFileSafe(600 * MB)).toBe(false);
  });

  it('respects custom threshold', () => {
    expect(isFileSafe(10 * MB, { warnMB: 5, errorMB: 8 })).toBe(false);
    expect(isFileSafe(7 * MB, { warnMB: 5, errorMB: 8 })).toBe(true);
  });
});

// ─── shouldWarnAboutSize ──────────────────────────────────────────────────────

describe('shouldWarnAboutSize', () => {
  it('returns false for a file below the warn threshold', () => {
    expect(shouldWarnAboutSize(50 * MB)).toBe(false);
  });

  it('returns true at the warn threshold', () => {
    expect(shouldWarnAboutSize(DEFAULT_THRESHOLD.warnMB * MB)).toBe(true);
  });

  it('returns true above the warn threshold', () => {
    expect(shouldWarnAboutSize(200 * MB)).toBe(true);
  });

  it('respects custom threshold', () => {
    expect(shouldWarnAboutSize(6 * MB, { warnMB: 5, errorMB: 10 })).toBe(true);
    expect(shouldWarnAboutSize(4 * MB, { warnMB: 5, errorMB: 10 })).toBe(false);
  });
});

// ─── getFileSizeMB ────────────────────────────────────────────────────────────

describe('getFileSizeMB', () => {
  it('returns 1 for 1MB', () => {
    expect(getFileSizeMB(1 * MB)).toBe(1);
  });

  it('returns 0.5 for 512KB', () => {
    expect(getFileSizeMB(512 * 1024)).toBeCloseTo(0.5, 2);
  });
});

// ─── getMemoryWarningMessage ──────────────────────────────────────────────────

describe('getMemoryWarningMessage', () => {
  it('includes the file size in the message', () => {
    const msg = getMemoryWarningMessage(25);
    expect(msg).toMatch(/25/);
  });

  it('returns a non-empty string', () => {
    expect(getMemoryWarningMessage(10).length).toBeGreaterThan(0);
  });
});

// ─── chunkArray ──────────────────────────────────────────────────────────────

describe('chunkArray', () => {
  it('splits an array evenly', () => {
    const result = chunkArray([1, 2, 3, 4], 2);
    expect(result).toEqual([[1, 2], [3, 4]]);
  });

  it('last chunk is smaller when not evenly divisible', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunkArray([], 2)).toEqual([]);
  });

  it('returns single chunk when chunkSize >= array length', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });
});

// ─── revokeObjectUrls ─────────────────────────────────────────────────────────

describe('revokeObjectUrls', () => {
  const revokeObjectURL = jest.fn();

  beforeAll(() => {
    Object.defineProperty(global, 'URL', {
      value: { revokeObjectURL },
      writable: true,
    });
  });

  beforeEach(() => revokeObjectURL.mockClear());

  it('calls revokeObjectURL for each non-null URL', () => {
    revokeObjectUrls(['blob:a', 'blob:b']);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('skips null values', () => {
    revokeObjectUrls([null, 'blob:a', undefined]);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('does not throw for empty array', () => {
    expect(() => revokeObjectUrls([])).not.toThrow();
  });
});

// ─── createCancellationToken ──────────────────────────────────────────────────

describe('createCancellationToken', () => {
  it('starts with cancelled = false', () => {
    const token = createCancellationToken();
    expect(token.cancelled).toBe(false);
  });

  it('cancel() sets cancelled to true', () => {
    const token = createCancellationToken();
    token.cancel();
    expect(token.cancelled).toBe(true);
  });

  it('can be cancelled multiple times without error', () => {
    const token = createCancellationToken();
    token.cancel();
    token.cancel();
    expect(token.cancelled).toBe(true);
  });
});

// ─── releaseCanvas ────────────────────────────────────────────────────────────

describe('releaseCanvas', () => {
  it('sets width and height to 0', () => {
    const canvas = { width: 800, height: 600 } as HTMLCanvasElement;
    releaseCanvas(canvas);
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });

  it('does nothing for null', () => {
    expect(() => releaseCanvas(null)).not.toThrow();
  });
});

// ─── safeArrayBufferCopy ──────────────────────────────────────────────────────

describe('safeArrayBufferCopy', () => {
  it('returns a copy with the same byte content', () => {
    const original = new Uint8Array([1, 2, 3]).buffer;
    const copy = safeArrayBufferCopy(original);
    expect(new Uint8Array(copy)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('returns a different reference', () => {
    const original = new Uint8Array([1]).buffer;
    const copy = safeArrayBufferCopy(original);
    expect(copy).not.toBe(original);
  });
});
