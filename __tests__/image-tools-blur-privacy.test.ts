/**
 * Tests for the upgraded Blur Image tool:
 * - Full-image blur / pixelate
 * - Face detection bounding box expansion
 * - Manual region management
 * - Mode logic
 * - Export filename
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

// ─── expandBox: bounding box padding ─────────────────────────────────────────

describe('expandBox: face bounding box padding', () => {
  function expandBox(
    x: number, y: number, w: number, h: number, pct: number,
  ): { x: number; y: number; w: number; h: number } {
    const pad = pct / 100;
    const nx = Math.max(0, x - w * pad);
    const ny = Math.max(0, y - h * pad);
    const nr = Math.min(1, x + w + w * pad);
    const nb = Math.min(1, y + h + h * pad);
    return { x: nx, y: ny, w: nr - nx, h: nb - ny };
  }

  it('0% padding returns the original box unchanged', () => {
    const r = expandBox(0.1, 0.1, 0.2, 0.3, 0);
    expect(r.x).toBeCloseTo(0.1);
    expect(r.y).toBeCloseTo(0.1);
    expect(r.w).toBeCloseTo(0.2);
    expect(r.h).toBeCloseTo(0.3);
  });

  it('20% padding expands the box by 20% of its width/height on each side', () => {
    const r = expandBox(0.3, 0.3, 0.2, 0.2, 20);
    // x: 0.3 - 0.2*0.20 = 0.3 - 0.04 = 0.26
    expect(r.x).toBeCloseTo(0.26);
    expect(r.y).toBeCloseTo(0.26);
    // right edge: 0.3 + 0.2 + 0.2*0.20 = 0.54; w = 0.54 - 0.26 = 0.28
    expect(r.w).toBeCloseTo(0.28);
    expect(r.h).toBeCloseTo(0.28);
  });

  it('clamps left/top to 0 when padding would go negative', () => {
    // Box at left edge: x=0.01, padding would push x negative
    const r = expandBox(0.01, 0.01, 0.1, 0.1, 50);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
  });

  it('clamps right/bottom to 1 when padding would exceed the image', () => {
    // Box near right edge: x=0.85, w=0.1, with padding
    const r = expandBox(0.85, 0.85, 0.1, 0.1, 50);
    expect(r.x + r.w).toBeLessThanOrEqual(1);
    expect(r.y + r.h).toBeLessThanOrEqual(1);
  });

  it('50% padding on a centered box stays within [0,1]', () => {
    const r = expandBox(0.4, 0.4, 0.2, 0.2, 50);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(1);
    expect(r.y + r.h).toBeLessThanOrEqual(1);
  });
});

// ─── Region management ────────────────────────────────────────────────────────

describe('region move clamping', () => {
  function moveRegion(
    region: { x: number; y: number; w: number; h: number },
    dx: number, dy: number,
  ) {
    return {
      ...region,
      x: Math.max(0, Math.min(1 - region.w, region.x + dx)),
      y: Math.max(0, Math.min(1 - region.h, region.y + dy)),
    };
  }

  it('move right stays within bounds', () => {
    const r = moveRegion({ x: 0.8, y: 0.5, w: 0.2, h: 0.2 }, 0.1, 0);
    expect(r.x + r.w).toBeLessThanOrEqual(1);
  });

  it('move left clamps at 0', () => {
    const r = moveRegion({ x: 0.05, y: 0.5, w: 0.2, h: 0.2 }, -0.2, 0);
    expect(r.x).toBeGreaterThanOrEqual(0);
  });

  it('move up clamps at 0', () => {
    const r = moveRegion({ x: 0.5, y: 0.02, w: 0.2, h: 0.2 }, 0, -0.1);
    expect(r.y).toBeGreaterThanOrEqual(0);
  });

  it('w and h are preserved during move', () => {
    const region = { x: 0.3, y: 0.3, w: 0.25, h: 0.15 };
    const r = moveRegion(region, 0.05, 0.05);
    expect(r.w).toBe(region.w);
    expect(r.h).toBe(region.h);
  });
});

// ─── canApply logic ───────────────────────────────────────────────────────────

describe('canApply: when blur can be applied', () => {
  function canApply(mode: 'full' | 'face' | 'manual', regionCount: number): boolean {
    return mode === 'full' || regionCount > 0;
  }

  it('full mode is always applicable', () => {
    expect(canApply('full', 0)).toBe(true);
  });

  it('face mode with no regions is not applicable', () => {
    expect(canApply('face', 0)).toBe(false);
  });

  it('face mode with regions is applicable', () => {
    expect(canApply('face', 2)).toBe(true);
  });

  it('manual mode with no regions is not applicable', () => {
    expect(canApply('manual', 0)).toBe(false);
  });

  it('manual mode with regions is applicable', () => {
    expect(canApply('manual', 1)).toBe(true);
  });
});

// ─── Output filename ──────────────────────────────────────────────────────────

describe('blur output filename', () => {
  function blurFilename(file: File, format: 'jpeg' | 'png' | 'webp'): string {
    return file.name.replace(/\.[^.]+$/, '') + '-blurred' +
      (format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg');
  }

  it('jpeg output uses .jpg extension', () => {
    expect(blurFilename(makeFile('photo.jpg', 'image/jpeg'), 'jpeg')).toBe('photo-blurred.jpg');
  });

  it('png output uses .png extension', () => {
    expect(blurFilename(makeFile('image.png', 'image/png'), 'png')).toBe('image-blurred.png');
  });

  it('webp output uses .webp extension', () => {
    expect(blurFilename(makeFile('img.webp', 'image/webp'), 'webp')).toBe('img-blurred.webp');
  });

  it('source extension stripped regardless of output format', () => {
    expect(blurFilename(makeFile('photo.png', 'image/png'), 'jpeg')).toBe('photo-blurred.jpg');
  });
});

// ─── Pixelation block size for blurRegion ────────────────────────────────────

describe('blurRegion: pixelation block size calculation', () => {
  function computePixelBlocks(strength: number, rw: number, rh: number): { sw: number; sh: number } {
    const bs = Math.max(1, Math.min(strength * 2, Math.min(rw, rh)));
    return {
      sw: Math.max(1, Math.floor(rw / bs)),
      sh: Math.max(1, Math.floor(rh / bs)),
    };
  }

  it('strength 12 → block 24px, correctly downscales a 120×80 region', () => {
    const { sw, sh } = computePixelBlocks(12, 120, 80);
    // bs = min(24, min(120,80)) = 24
    // sw = floor(120/24) = 5, sh = floor(80/24) = 3
    expect(sw).toBe(5);
    expect(sh).toBe(3);
  });

  it('block size clamped to min dimension of the region', () => {
    // 10×5 region with strength 20 (block 40) → clamped to 5
    const { sw, sh } = computePixelBlocks(20, 10, 5);
    expect(sw).toBeGreaterThanOrEqual(1);
    expect(sh).toBeGreaterThanOrEqual(1);
  });

  it('minimum 1 pixel for very small regions', () => {
    const { sw, sh } = computePixelBlocks(24, 2, 2);
    expect(sw).toBe(1);
    expect(sh).toBe(1);
  });
});

// ─── Mode switching resets output ─────────────────────────────────────────────

describe('mode switching behavior', () => {
  it('switching mode clears any existing output', () => {
    let output = 'blob:http://x/123';
    let outputBlob = new Blob(['data']);
    const switchMode = () => {
      output = '';
      outputBlob = null as unknown as Blob;
    };
    switchMode();
    expect(output).toBe('');
    expect(outputBlob).toBeNull();
  });
});

// ─── Detector state transitions ───────────────────────────────────────────────

describe('face detector state machine', () => {
  type DetectorState = 'idle' | 'loading' | 'ready' | 'failed';

  function transition(current: DetectorState, event: 'start' | 'success' | 'failure'): DetectorState {
    if (event === 'start') return 'loading';
    if (event === 'success') return 'ready';
    if (event === 'failure') return 'failed';
    return current;
  }

  it('idle → loading on start', () => {
    expect(transition('idle', 'start')).toBe('loading');
  });

  it('loading → ready on success', () => {
    expect(transition('loading', 'success')).toBe('ready');
  });

  it('loading → failed on failure', () => {
    expect(transition('loading', 'failure')).toBe('failed');
  });

  it('detect button is disabled in loading state', () => {
    const state: DetectorState = 'loading';
    const isDetecting = true;
    const disabled = isDetecting || state === 'loading';
    expect(disabled).toBe(true);
  });

  it('detect button is enabled in idle state', () => {
    const state: DetectorState = 'idle';
    const isDetecting = false;
    const disabled = isDetecting || state === 'loading';
    expect(disabled).toBe(false);
  });
});

// ─── Face regions merged with manual regions ─────────────────────────────────

describe('region source merging', () => {
  interface Region {
    id: string;
    source: 'face' | 'manual';
    x: number; y: number; w: number; h: number;
  }

  function mergeRegions(existing: Region[], newFaceRegions: Region[]): Region[] {
    return [
      ...existing.filter((r) => r.source === 'manual'),
      ...newFaceRegions,
    ];
  }

  it('re-running detection replaces old face regions, keeps manual regions', () => {
    const existing: Region[] = [
      { id: 'a', source: 'face', x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
      { id: 'b', source: 'manual', x: 0.5, y: 0.5, w: 0.1, h: 0.1 },
    ];
    const newFace: Region[] = [
      { id: 'c', source: 'face', x: 0.3, y: 0.3, w: 0.2, h: 0.2 },
    ];
    const result = mergeRegions(existing, newFace);
    expect(result).toHaveLength(2);
    expect(result.filter(r => r.source === 'face')).toHaveLength(1);
    expect(result.find(r => r.id === 'c')).toBeTruthy();
    expect(result.find(r => r.id === 'b')).toBeTruthy();
    expect(result.find(r => r.id === 'a')).toBeFalsy();
  });

  it('0 faces detected keeps manual regions intact', () => {
    const existing: Region[] = [
      { id: 'b', source: 'manual', x: 0.5, y: 0.5, w: 0.1, h: 0.1 },
    ];
    const result = mergeRegions(existing, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });
});
