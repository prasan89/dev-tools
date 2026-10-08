/**
 * M80.3 — Homepage Performance & Dependency Isolation Tests
 *
 * Ensures the homepage (page.tsx, layout.tsx) never eagerly imports heavy
 * PDF-processing libraries. PDF tools must remain route-level, lazy-loaded.
 *
 * Also validates SW cache-bust and analytics/AdSense non-blocking strategies.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

// ─── Homepage Dependency Isolation ───────────────────────────────────────────

describe('Homepage: no heavy PDF/OCR/conversion library imports', () => {
  const FORBIDDEN_IMPORTS = [
    'pdfjs-dist',
    'pdf-lib',
    '@cantoo/pdf-lib',
    'tesseract.js',
    'mammoth',
    'xlsx',
    'jszip',
  ];

  // Files that must not import heavy libs (directly or via re-export)
  const GUARDED_FILES = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
  ];

  for (const file of GUARDED_FILES) {
    for (const lib of FORBIDDEN_IMPORTS) {
      it(`${file} does not import '${lib}'`, () => {
        const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
        // Match direct imports: import ... from 'lib' or require('lib')
        const importRegex = new RegExp(
          `(import[^'"]*['"]${lib.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]|require\\(['"]${lib.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\))`,
          'i'
        );
        expect(src).not.toMatch(importRegex);
      });
    }
  }
});

// ─── Homepage Server Component (no unnecessary 'use client') ─────────────────

describe('Homepage: page.tsx is a Server Component', () => {
  it('page.tsx does not have "use client" directive', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
    expect(src).not.toMatch(/^['"]use client['"]/m);
  });

  it('page.tsx does not import PDF processing implementations', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
    const pdfImpls = [
      'mergePdf', 'splitPdf', 'compressPdf', 'ocrEngine',
      'pdfToWord', 'pdfToExcel', 'buildProtectedPdf', 'unlockPdf',
      'extractText', 'recognizeImage',
    ];
    for (const impl of pdfImpls) {
      expect(src).not.toContain(impl);
    }
  });

  it('page.tsx tool cards use only metadata (id, title, href, icon)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf8');
    // Tool cards should use slug/href links, not invoke processing functions
    expect(src).toContain('href=');
    expect(src).not.toContain('onClick={process');
  });
});

// ─── Layout Lightweight Audit ─────────────────────────────────────────────────

describe('layout.tsx: lightweight root layout', () => {
  it('layout.tsx does not import PDF processing libraries', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
    const forbidden = ['pdfjs', 'pdf-lib', 'tesseract', 'mammoth', 'xlsx', 'jszip', '@cantoo'];
    for (const lib of forbidden) {
      expect(src).not.toContain(lib);
    }
  });

  it('layout.tsx uses Inter font with display swap (no render blocking)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
    expect(src).toContain("display: 'swap'");
  });
});

// ─── Analytics Non-Blocking ───────────────────────────────────────────────────

describe('Analytics: non-blocking load strategy', () => {
  it('GoogleAnalytics uses afterInteractive strategy', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/analytics/GoogleAnalytics.tsx'),
      'utf8'
    );
    expect(src).toContain('afterInteractive');
    expect(src).not.toContain('strategy="beforeInteractive"');
    expect(src).not.toContain('strategy="eager"');
  });

  it('GoogleAnalytics does not send PDF content to GA', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/analytics/GoogleAnalytics.tsx'),
      'utf8'
    );
    // Should not pass file contents or document data
    expect(src).not.toContain('fileContent');
    expect(src).not.toContain('pdfContent');
    expect(src).not.toContain('ocrResult');
  });
});

// ─── AdSense Non-Blocking ────────────────────────────────────────────────────

describe('AdSense: non-blocking load strategy', () => {
  it('AdSenseScript uses afterInteractive strategy', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/ads/AdSenseScript.tsx'),
      'utf8'
    );
    expect(src).toContain('afterInteractive');
    expect(src).not.toContain('strategy="beforeInteractive"');
  });

  it('AdSenseScript loads script async', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/ads/AdSenseScript.tsx'),
      'utf8'
    );
    expect(src).toContain('async');
  });
});

// ─── Service Worker Non-Blocking ─────────────────────────────────────────────

describe('ServiceWorker: non-blocking registration', () => {
  it('ServiceWorkerRegistration uses useEffect (deferred after render)', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/pwa/ServiceWorkerRegistration.tsx'),
      'utf8'
    );
    expect(src).toContain('useEffect');
    expect(src).not.toContain('useLayoutEffect');
  });

  it('SW cache version is v3 (post-deploy cache bust)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    expect(src).toContain("CACHE_VERSION = 'v3'");
  });

  it('SW does not precache HTML pages (prevents stale-CSS flash on deploy)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    // APP_SHELL should not contain HTML page paths
    expect(src).not.toMatch(/APP_SHELL\s*=\s*\[/);
  });

  it('SW install handler does not addAll HTML routes', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    // No cache.addAll with HTML pages
    expect(src).not.toMatch(/cache\.addAll\s*\(\s*\[/);
  });

  it('SW navigate requests use network-first', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    expect(src).toContain("request.mode === 'navigate'");
    // Network-first: fetch() comes before caches.match()
    const navigateBlock = src.split("request.mode === 'navigate'")[1]?.split('return;')[0] ?? '';
    const fetchPos = navigateBlock.indexOf('fetch(request)');
    const cachePos = navigateBlock.indexOf('caches.match(request)');
    expect(fetchPos).toBeGreaterThan(-1);
    expect(cachePos).toBeGreaterThan(-1);
    expect(fetchPos).toBeLessThan(cachePos); // fetch before cache fallback
  });

  it('SW never caches /api/ routes', () => {
    const src = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
    expect(src).not.toMatch(/cache\.put.*\/api\//);
  });
});

// ─── PDF Tool Routes: Lazy-Loaded ─────────────────────────────────────────────

describe('PDF tool pages: use dynamic imports for heavy libs', () => {
  const LAZY_IMPORT_TOOLS = [
    { file: 'src/lib/pdf/ocrEngine.ts', lib: 'tesseract.js', label: 'OCR' },
    { file: 'src/lib/pdf/wordToPdf.ts', lib: 'mammoth', label: 'mammoth (DOCX)' },
  ];

  for (const { file, lib, label } of LAZY_IMPORT_TOOLS) {
    it(`${label}: uses dynamic import() not static import`, () => {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      // Static top-level import would be: import ... from 'lib'
      const staticImport = new RegExp(`^import[^'"]*['"]${lib}['"]`, 'm');
      expect(src).not.toMatch(staticImport);
      // Dynamic import should be present
      const dynamicImport = new RegExp(`import\\(['"]${lib}['"]\\)`);
      expect(src).toMatch(dynamicImport);
    });
  }
});

// ─── Next.js Config: Optimization ────────────────────────────────────────────

describe('next.config.ts: performance optimization', () => {
  it('compress is enabled', () => {
    const src = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(src).toContain('compress: true');
  });

  it('output is standalone', () => {
    const src = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(src).toContain('"standalone"');
  });

  it('optimizePackageImports is configured', () => {
    const src = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(src).toContain('optimizePackageImports');
  });

  it('partialPrefetching is enabled', () => {
    const src = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(src).toContain('partialPrefetching: true');
  });
});
