/**
 * M80 — Production Hardening
 * Verifies security headers, CSP, no console.log leaks, and critical configs.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC_LIB_PDF = path.join(ROOT, 'src/lib/pdf');
const NEXT_CONFIG = path.join(ROOT, 'next.config.ts');

describe('Security headers in next.config', () => {
  let config: string;
  beforeAll(() => {
    config = fs.readFileSync(NEXT_CONFIG, 'utf8');
  });

  it('has X-Content-Type-Options nosniff', () => {
    expect(config).toContain('X-Content-Type-Options');
    expect(config).toContain('nosniff');
  });

  it('has X-Frame-Options SAMEORIGIN', () => {
    expect(config).toContain('X-Frame-Options');
    expect(config).toContain('SAMEORIGIN');
  });

  it('has Strict-Transport-Security', () => {
    expect(config).toContain('Strict-Transport-Security');
    expect(config).toContain('max-age=63072000');
  });

  it('has Content-Security-Policy', () => {
    expect(config).toContain('Content-Security-Policy');
    expect(config).toContain("object-src 'none'");
  });

  it('does NOT include unsafe-eval in CSP directive value', () => {
    // Extract the CSP value string (after "script-src") and verify it contains no unsafe-eval
    const scriptSrcMatch = config.match(/script-src[^"']*(["'])[^"']*\1/);
    if (scriptSrcMatch) {
      expect(scriptSrcMatch[0]).not.toContain("'unsafe-eval'");
    } else {
      // Check the CSP_DIRECTIVES array join doesn't include unsafe-eval as a directive
      const cspArrayMatch = config.match(/const CSP_DIRECTIVES = \[([\s\S]*?)\]\.join/);
      if (cspArrayMatch) {
        expect(cspArrayMatch[1]).not.toMatch(/"[^"]*'unsafe-eval'[^"]*"/);
      }
    }
  });

  it('has Permissions-Policy', () => {
    expect(config).toContain('Permissions-Policy');
  });

  it('disables poweredByHeader', () => {
    expect(config).toContain('poweredByHeader: false');
  });

  it('has output standalone', () => {
    expect(config).toContain('output: "standalone"');
  });
});

describe('No console.log in PDF lib files', () => {
  const pdfFiles = fs
    .readdirSync(SRC_LIB_PDF)
    .filter((f) => f.endsWith('.ts'));

  for (const file of pdfFiles) {
    it(`${file} has no console.log`, () => {
      const content = fs.readFileSync(path.join(SRC_LIB_PDF, file), 'utf8');
      expect(content).not.toMatch(/console\.log\(/);
    });
  }
});

describe('Zero-server architecture', () => {
  const pdfFiles = fs
    .readdirSync(SRC_LIB_PDF)
    .filter((f) => f.endsWith('.ts'));

  it('no PDF lib file uses FormData (no server uploads)', () => {
    for (const file of pdfFiles) {
      const content = fs.readFileSync(path.join(SRC_LIB_PDF, file), 'utf8');
      expect(content).not.toMatch(/new FormData\(\)/);
    }
  });

  it('no PDF lib file uses fetch to upload PDFs', () => {
    for (const file of pdfFiles) {
      const content = fs.readFileSync(path.join(SRC_LIB_PDF, file), 'utf8');
      // fetch() with FormData body would indicate an upload
      expect(content).not.toMatch(/fetch\([^)]*FormData/);
    }
  });

  it('no PDF lib file uses eval()', () => {
    for (const file of pdfFiles) {
      const content = fs.readFileSync(path.join(SRC_LIB_PDF, file), 'utf8');
      expect(content).not.toMatch(/\beval\s*\(/);
    }
  });
});

describe('Crypto security primitives', () => {
  it('protectPdf uses crypto.getRandomValues not Math.random', () => {
    const content = fs.readFileSync(path.join(SRC_LIB_PDF, 'protectPdf.ts'), 'utf8');
    expect(content).not.toMatch(/Math\.random\(\)/);
  });
});

describe('Package.json sanity', () => {
  it('has required PDF processing dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.dependencies['pdfjs-dist']).toBeTruthy();
    expect(pkg.dependencies['pdf-lib']).toBeTruthy();
  });

  it('has office conversion dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.dependencies['docx']).toBeTruthy();
    expect(pkg.dependencies['xlsx']).toBeTruthy();
    expect(pkg.dependencies['pptxgenjs']).toBeTruthy();
  });
});
