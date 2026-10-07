/**
 * M75 — Full PDFTools Regression QA
 * Master regression suite covering all tools M21–M74.
 */

// ─── PDF Foundation ──────────────────────────────────────────────────────────

describe('PDF foundation modules', () => {
  it('validation module exports validatePdfFile', async () => {
    const mod = await import('../src/lib/pdf/validation');
    expect(typeof mod.validatePdfFile).toBe('function');
  });
});

// ─── Core Operations ─────────────────────────────────────────────────────────

describe('Core PDF operations', () => {
  const coreModules: [string, string[]][] = [
    ['../src/lib/pdf/merge', ['mergePdfFiles']],
    ['../src/lib/pdf/split', ['splitByRanges']],
    ['../src/lib/pdf/compress', ['compressPdf']],
    ['../src/lib/pdf/toImage', ['convertPdfToImages']],
    ['../src/lib/pdf/fromImages', ['convertImagesToPdf']],
    ['../src/lib/pdf/organize', ['buildOrganizedPdf']],
    ['../src/lib/pdf/extract', ['extractPages']],
    ['../src/lib/pdf/crop', ['buildCroppedPdf']],
  ];

  for (const [path, exports] of coreModules) {
    it(`${path} exports expected functions`, async () => {
      const mod = await import(path);
      for (const name of exports) {
        expect(typeof mod[name]).toBe('function');
      }
    });
  }
});

// ─── Editor Operations ────────────────────────────────────────────────────────

describe('PDF editor modules', () => {
  const editorModules: [string, string[]][] = [
    ['../src/lib/pdf/watermarkPdf', ['buildWatermarkedPdf']],
    ['../src/lib/pdf/pageNumbers', ['buildPageNumberedPdf']],
    ['../src/lib/pdf/pdfMetadata', ['readMetadata', 'buildMetadataEditedPdf']],
    ['../src/lib/pdf/protectPdf', ['buildProtectedPdf']],
    ['../src/lib/pdf/unlockPdf', ['unlockPdf']],
    ['../src/lib/pdf/redactPdf', ['buildRedactedPdf']],
  ];

  for (const [path, exports] of editorModules) {
    it(`${path} exports expected functions`, async () => {
      const mod = await import(path);
      for (const name of exports) {
        expect(typeof mod[name]).toBe('function');
      }
    });
  }
});

// ─── Advanced PDF operations ──────────────────────────────────────────────────

describe('Advanced PDF modules', () => {
  const advancedModules: [string, string[]][] = [
    ['../src/lib/pdf/comparePdf', ['diffTextPages']],
    ['../src/lib/pdf/repairPdf', ['repairPdf']],
    ['../src/lib/pdf/pdfAConverter', ['convertToPdfA']],
    ['../src/lib/pdf/createPdf', ['buildNewPdf']],
    ['../src/lib/pdf/scanToPdf', ['buildScanPdf']],
    ['../src/lib/pdf/pdfToText', ['extractTextFromPdf']],
    ['../src/lib/pdf/pdfToMarkdown', ['extractMarkdownFromPdf']],
    ['../src/lib/pdf/pdfToHtml', ['convertPdfToHtml']],
    ['../src/lib/pdf/pdfToSvg', ['convertPdfToSvg']],
    ['../src/lib/pdf/pdfToWebp', ['convertPdfToWebp']],
    ['../src/lib/pdf/htmlToPdf', ['convertHtmlToPdf']],
    ['../src/lib/pdf/webPageToPdf', ['convertUrlToPdf']],
    ['../src/lib/pdf/ocrEngine', ['recognizeImage']],
    ['../src/lib/pdf/ocrToPdf', ['buildOcrSearchablePdf']],
    ['../src/lib/pdf/ocrToText', ['extractTextViaOcr']],
  ];

  for (const [path, exports] of advancedModules) {
    it(`${path} exports expected functions`, async () => {
      const mod = await import(path);
      for (const name of exports) {
        expect(typeof mod[name]).toBe('function');
      }
    });
  }
});

// ─── Office Conversions ───────────────────────────────────────────────────────

describe('Office conversion modules', () => {
  const officeModules: [string, string[]][] = [
    ['../src/lib/pdf/pdfToWord', ['convertPdfToWord']],
    ['../src/lib/pdf/pdfToExcel', ['convertPdfToExcel']],
    ['../src/lib/pdf/pdfToPowerpoint', ['convertPdfToPowerpoint']],
    ['../src/lib/pdf/wordToPdf', ['convertWordToPdf']],
    ['../src/lib/pdf/excelToPdf', ['convertExcelToPdf']],
    ['../src/lib/pdf/powerpointToPdf', ['convertPptxToPdf']],
  ];

  for (const [path, exports] of officeModules) {
    it(`${path} exports expected functions`, async () => {
      const mod = await import(path);
      for (const name of exports) {
        expect(typeof mod[name]).toBe('function');
      }
    });
  }
});

// ─── Infrastructure ───────────────────────────────────────────────────────────

describe('Infrastructure modules', () => {
  const infraModules: [string, string[]][] = [
    ['../src/lib/pdf/batchProcessor', ['createBatchJob', 'generateBatchZip']],
    ['../src/lib/pdf/pdfWorkflow', ['createWorkflow', 'addStep']],
    ['../src/lib/workers/workerManager', ['createWorkerJob', 'isValidWorkerMessage']],
    ['../src/lib/pdf/performanceBenchmark', ['recordBenchmark', 'formatDuration']],
    ['../src/lib/pdf/memoryManager', ['isFileSafe', 'chunkArray']],
    ['../src/lib/browserCompat', ['detectCapabilities']],
    ['../src/lib/security', ['sanitizeExtractedText', 'isSafeUrl']],
  ];

  for (const [path, exports] of infraModules) {
    it(`${path} exports expected functions`, async () => {
      const mod = await import(path);
      for (const name of exports) {
        expect(typeof mod[name]).toBe('function');
      }
    });
  }
});

// ─── Route pages exist ────────────────────────────────────────────────────────

describe('PDFTools route pages exist', () => {
  const routes = [
    '../src/app/pdf-tools/page',
    '../src/app/pdf-tools/viewer/page',
    '../src/app/pdf-tools/merge-pdf/page',
    '../src/app/pdf-tools/split-pdf/page',
    '../src/app/pdf-tools/compress-pdf/page',
    '../src/app/pdf-tools/edit-pdf/page',
    '../src/app/pdf-tools/watermark-pdf/page',
    '../src/app/pdf-tools/protect-pdf/page',
    '../src/app/pdf-tools/pdf-to-word/page',
    '../src/app/pdf-tools/pdf-to-excel/page',
    '../src/app/pdf-tools/pdf-to-powerpoint/page',
    '../src/app/pdf-tools/word-to-pdf/page',
    '../src/app/pdf-tools/excel-to-pdf/page',
    '../src/app/pdf-tools/powerpoint-to-pdf/page',
    '../src/app/pdf-tools/batch/page',
    '../src/app/pdf-tools/workflows/page',
    '../src/app/pdf-tools/ocr/page',
    '../src/app/pdf-tools/ocr-text/page',
  ];

  for (const route of routes) {
    it(`${route} exports a default component`, async () => {
      const mod = await import(route);
      expect(typeof mod.default).toBe('function');
    });
  }
});

// ─── Privacy assertions ───────────────────────────────────────────────────────

describe('Privacy architecture assertions', () => {
  it('no PDF lib file contains FormData with PDF uploads', async () => {
    const fs = require('fs');
    const path = require('path');
    const libDir = path.resolve(__dirname, '../src/lib/pdf');
    const files = fs.readdirSync(libDir).filter((f: string) => f.endsWith('.ts'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf8');
      expect(content).not.toMatch(/new FormData\(\)/);
    }
  });

  it('no PDF lib file logs passwords', async () => {
    const fs = require('fs');
    const path = require('path');
    const libDir = path.resolve(__dirname, '../src/lib/pdf');
    const files = fs.readdirSync(libDir).filter((f: string) => f.endsWith('.ts'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf8');
      expect(content).not.toMatch(/console\.(log|error|warn)\([^)]*password/i);
    }
  });

  it('analytics module does not log passwords in event payloads', async () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../src/lib/analytics.ts'), 'utf8');
    // Should not have code that sends password values as event properties
    // (comments mentioning password for privacy purposes are acceptable)
    expect(content).not.toMatch(/trackEvent\([^)]*password/i);
  });
});
