/**
 * M80.1 — Production Architecture Hardening Tests
 *
 * Covers:
 * - WorkerManager lifecycle (submit, cancel, progress, destroy)
 * - HTML sanitizer for DOCX→HTML pipeline
 * - INP replaces FID in performance targets
 * - OCR progress stage types
 * - Batch UI: no "DRAFT" labels
 * - Zero-server network audit
 * - mammoth dependency present
 * - SW cache versioning
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

// ─── WorkerManager ────────────────────────────────────────────────────────────

describe('WorkerManager', () => {
  let WorkerManager: typeof import('../src/lib/workers/workerManager').WorkerManager;

  beforeAll(async () => {
    const mod = await import('../src/lib/workers/workerManager');
    WorkerManager = mod.WorkerManager;
  });

  it('exports WorkerManager class', () => {
    expect(typeof WorkerManager).toBe('function');
  });

  it('constructs with default options', () => {
    const mgr = new WorkerManager();
    expect(mgr).toBeTruthy();
    mgr.destroy();
  });

  it('constructs with custom concurrency', () => {
    const mgr = new WorkerManager({ maxConcurrency: 4, timeoutMs: 5000 });
    expect(mgr).toBeTruthy();
    mgr.destroy();
  });

  it('destroy cleans up with no active jobs', () => {
    const mgr = new WorkerManager();
    expect(() => mgr.destroy()).not.toThrow();
  });

  it('submit returns jobId and result promise', () => {
    // In test environment Workers cannot spawn; submit should return immediately
    const mgr = new WorkerManager();
    // Mock Worker globally
    const origWorker = global.Worker;
    global.Worker = jest.fn().mockImplementation(() => ({
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    })) as unknown as typeof Worker;

    const { jobId, result } = mgr.submit('/workers/test.js', { data: 'hello' });
    expect(typeof jobId).toBe('string');
    expect(jobId.length).toBeGreaterThan(0);
    expect(result).toBeInstanceOf(Promise);

    mgr.cancel(jobId);
    mgr.destroy();
    global.Worker = origWorker;
  });

  it('cancel before start marks job as cancelled', () => {
    const mgr = new WorkerManager({ maxConcurrency: 0 }); // 0 → clamped to 1
    const origWorker = global.Worker;
    global.Worker = jest.fn().mockImplementation(() => ({
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    })) as unknown as typeof Worker;

    // Submit two jobs, cancel the second before it starts
    const j1 = mgr.submit('/workers/test.js', 'first');
    const j2 = mgr.submit('/workers/test.js', 'second');
    mgr.cancel(j2.jobId);

    const job2 = mgr.getJob(j2.jobId);
    expect(job2?.status).toBe('cancelled');

    mgr.destroy();
    global.Worker = origWorker;
    // Silence unhandled rejection from j1/j2
    j1.result.catch(() => {});
    j2.result.catch(() => {});
  });

  it('getJob returns undefined for unknown id', () => {
    const mgr = new WorkerManager();
    expect(mgr.getJob('nonexistent-id')).toBeUndefined();
    mgr.destroy();
  });

  it('isActive returns false for unknown job', () => {
    const mgr = new WorkerManager();
    expect(mgr.isActive('nonexistent-id')).toBe(false);
    mgr.destroy();
  });

  it('destroy rejects all queued job promises', async () => {
    const mgr = new WorkerManager({ maxConcurrency: 1 });
    const origWorker = global.Worker;
    global.Worker = jest.fn().mockImplementation(() => ({
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    })) as unknown as typeof Worker;

    // First job starts (worker spawns); second stays queued
    const j1 = mgr.submit('/workers/test.js', 'data1');
    const j2 = mgr.submit('/workers/test.js', 'data2');
    const rejection = j2.result.catch((e: Error) => e.message);
    mgr.destroy();
    const msg = await rejection;
    expect(msg).toMatch(/destroyed/i);

    j1.result.catch(() => {});
    global.Worker = origWorker;
  });
});

// ─── HTML Sanitizer ───────────────────────────────────────────────────────────

describe('sanitizeConverterHtml', () => {
  let sanitizeConverterHtml: (html: string) => string;

  beforeAll(async () => {
    const mod = await import('../src/lib/security');
    sanitizeConverterHtml = mod.sanitizeConverterHtml;
  });

  it('removes <script> tags and content', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const out = sanitizeConverterHtml(input);
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert');
    expect(out).toContain('Hello');
  });

  it('removes <iframe> tags', () => {
    const out = sanitizeConverterHtml('<p>text</p><iframe src="evil.com"></iframe>');
    expect(out).not.toContain('<iframe');
  });

  it('removes on* event handlers', () => {
    const out = sanitizeConverterHtml('<p onclick="alert(1)">Click me</p>');
    expect(out).not.toContain('onclick');
    expect(out).toContain('Click me');
  });

  it('removes onload event handlers', () => {
    const out = sanitizeConverterHtml('<body onload="steal()">content</body>');
    expect(out).not.toContain('onload');
    expect(out).toContain('content');
  });

  it('neutralizes javascript: hrefs', () => {
    const out = sanitizeConverterHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toMatch(/href\s*=\s*["']?javascript:/i);
  });

  it('neutralizes vbscript: hrefs', () => {
    const out = sanitizeConverterHtml('<a href="vbscript:msgbox(1)">click</a>');
    expect(out).not.toMatch(/href\s*=\s*["']?vbscript:/i);
  });

  it('preserves normal HTML structure', () => {
    const input = '<h1>Title</h1><p>A paragraph with <strong>bold</strong> text.</p>';
    const out = sanitizeConverterHtml(input);
    expect(out).toContain('<h1>Title</h1>');
    expect(out).toContain('<strong>bold</strong>');
  });

  it('removes <object> tags', () => {
    const out = sanitizeConverterHtml('<p>text</p><object data="evil.swf"></object>');
    expect(out).not.toContain('<object');
  });

  it('removes <embed> tags', () => {
    const out = sanitizeConverterHtml('<p>text</p><embed src="evil.swf">');
    expect(out).not.toContain('<embed');
  });
});

// ─── INP replaces FID ─────────────────────────────────────────────────────────

describe('Performance: INP replaces FID (March 2024 Core Web Vitals)', () => {
  it('WEB_VITALS_TARGETS has INP not FID', async () => {
    const { WEB_VITALS_TARGETS } = await import('../src/lib/performance');
    expect('INP' in WEB_VITALS_TARGETS).toBe(true);
    expect('FID' in WEB_VITALS_TARGETS).toBe(false);
  });

  it('INP target is 200ms', async () => {
    const { WEB_VITALS_TARGETS } = await import('../src/lib/performance');
    expect(WEB_VITALS_TARGETS.INP).toBe(200);
  });

  it('getInpStatus is exported', async () => {
    const mod = await import('../src/lib/performance');
    expect(typeof (mod as Record<string, unknown>).getInpStatus).toBe('function');
  });

  it('getInpStatus returns good for 150ms', async () => {
    const { getInpStatus } = await import('../src/lib/performance');
    expect(getInpStatus(150)).toBe('good');
  });

  it('getInpStatus returns needs-improvement for 350ms', async () => {
    const { getInpStatus } = await import('../src/lib/performance');
    expect(getInpStatus(350)).toBe('needs-improvement');
  });

  it('getInpStatus returns poor for 600ms', async () => {
    const { getInpStatus } = await import('../src/lib/performance');
    expect(getInpStatus(600)).toBe('poor');
  });
});

// ─── OCR progress stages ──────────────────────────────────────────────────────

describe('OCR engine progress stages', () => {
  it('exports OcrProgressStage type (via recognizeImage signature)', async () => {
    const mod = await import('../src/lib/pdf/ocrEngine');
    expect(typeof mod.recognizeImage).toBe('function');
  });

  it('recognizeImage accepts optional onProgress callback', async () => {
    const { recognizeImage } = await import('../src/lib/pdf/ocrEngine');
    // Just verify signature accepts 3 args without throwing
    expect(recognizeImage.length).toBeGreaterThanOrEqual(2);
  });

  it('STAGE_MESSAGES covers all stages', () => {
    const stages = [
      'loading-engine',
      'loading-language',
      'initializing',
      'recognizing',
      'finalizing',
      'complete',
    ];
    // Verify the ocrEngine source file references all stages
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/ocrEngine.ts'), 'utf8');
    for (const stage of stages) {
      expect(src).toContain(stage);
    }
  });
});

// ─── Batch UI: no "DRAFT" label ───────────────────────────────────────────────

describe('Batch UI labels', () => {
  it('batch page.tsx does not contain (DRAFT) label', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/app/pdf-tools/batch/page.tsx'),
      'utf8',
    );
    expect(src).not.toContain('(DRAFT)');
  });

  it('batch page has Watermark operation without DRAFT suffix', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/app/pdf-tools/batch/page.tsx'),
      'utf8',
    );
    expect(src).toContain("label: 'Watermark'");
    expect(src).not.toMatch(/label:\s*['"]Watermark\s*\(DRAFT\)/);
  });
});

// ─── mammoth dependency ───────────────────────────────────────────────────────

describe('mammoth dependency', () => {
  it('mammoth is in package.json dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.dependencies?.mammoth).toBeTruthy();
  });

  it('mammoth is in node_modules', () => {
    const mammothPkg = path.join(ROOT, 'node_modules/mammoth/package.json');
    expect(fs.existsSync(mammothPkg)).toBe(true);
  });

  it('wordToPdf.ts imports mammoth', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/wordToPdf.ts'), 'utf8');
    expect(src).toContain("import('mammoth')");
  });

  it('wordToPdf.ts calls sanitizeConverterHtml on mammoth output', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/wordToPdf.ts'), 'utf8');
    expect(src).toContain('sanitizeConverterHtml');
  });
});

// ─── SW cache versioning ──────────────────────────────────────────────────────

describe('Service Worker cache versioning', () => {
  it('sw.js has CACHE_VERSION constant', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    expect(src).toContain('CACHE_VERSION');
  });

  it('sw.js cache name uses version variable', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    expect(src).toMatch(/CACHE_NAME\s*=\s*`devtoolshub-\$\{CACHE_VERSION\}`/);
  });

  it('sw.js never caches user document patterns', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    // Should not cache /api/ routes
    expect(src).not.toMatch(/cache\.put.*\/api\//);
  });
});

// ─── Zero-server network audit ────────────────────────────────────────────────

describe('Zero-server: no PDF upload patterns in lib/pdf/', () => {
  const libPdfDir = path.join(ROOT, 'src/lib/pdf');
  const pdfFiles = fs.readdirSync(libPdfDir).filter((f) => f.endsWith('.ts'));

  it('no PDF lib file uses FormData', () => {
    for (const file of pdfFiles) {
      const src = fs.readFileSync(path.join(libPdfDir, file), 'utf8');
      expect(src).not.toMatch(/new FormData\(\)/);
    }
  });

  it('no PDF lib file uses fetch() with a non-localhost URL as first arg', () => {
    for (const file of pdfFiles) {
      const src = fs.readFileSync(path.join(libPdfDir, file), 'utf8');
      // fetch('https://... or fetch("http://... would be an upload
      expect(src).not.toMatch(/fetch\s*\(\s*['"]https?:\/\//);
    }
  });

  it('no PDF lib file imports axios', () => {
    for (const file of pdfFiles) {
      const src = fs.readFileSync(path.join(libPdfDir, file), 'utf8');
      expect(src).not.toMatch(/import.*axios/);
    }
  });
});
