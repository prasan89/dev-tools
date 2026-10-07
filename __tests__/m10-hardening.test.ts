/**
 * M10 Production hardening tests
 *
 * Covers: security headers, no eval/Function, safe dangerouslySetInnerHTML,
 * no API routes, error pages, no hardcoded secrets, processor coverage,
 * XSS-resistant output, static asset caching config, LAUNCH.md present.
 */

import fs from 'fs';
import path from 'path';
import { getEnabledTools } from '@/lib/registry';

const root = process.cwd();
const srcDir = path.join(root, 'src');

function readFile(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function exists(relPath: string) {
  return fs.existsSync(path.join(root, relPath));
}

function grepSrc(pattern: RegExp): string[] {
  const hits: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
        walk(full);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8');
        if (pattern.test(content)) {
          hits.push(path.relative(root, full));
        }
      }
    }
  }
  walk(srcDir);
  return hits;
}

// ---------------------------------------------------------------------------
// Security headers in next.config.ts
// ---------------------------------------------------------------------------

describe('Security headers', () => {
  const cfg = readFile('next.config.ts');

  it('next.config.ts has headers() function', () => {
    expect(cfg).toContain('async headers()');
  });

  it('has X-Content-Type-Options: nosniff', () => {
    expect(cfg).toContain('X-Content-Type-Options');
    expect(cfg).toContain('nosniff');
  });

  it('has X-Frame-Options', () => {
    expect(cfg).toContain('X-Frame-Options');
    expect(cfg).toContain('SAMEORIGIN');
  });

  it('has Referrer-Policy', () => {
    expect(cfg).toContain('Referrer-Policy');
    expect(cfg).toContain('strict-origin-when-cross-origin');
  });

  it('has Permissions-Policy', () => {
    expect(cfg).toContain('Permissions-Policy');
    expect(cfg).toContain('camera=()');
  });

  it('has Strict-Transport-Security with long max-age', () => {
    expect(cfg).toContain('Strict-Transport-Security');
    expect(cfg).toContain('max-age=');
    // Should be at least 1 year (31536000)
    const match = cfg.match(/max-age=(\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match![1])).toBeGreaterThanOrEqual(31536000);
  });

  it('has Content-Security-Policy', () => {
    expect(cfg).toContain('Content-Security-Policy');
    expect(cfg).toContain("default-src 'self'");
  });

  it('CSP allows GA4 / GTM', () => {
    expect(cfg).toContain('googletagmanager.com');
    expect(cfg).toContain('google-analytics.com');
  });

  it('CSP allows AdSense', () => {
    expect(cfg).toContain('pagead2.googlesyndication.com');
  });

  it('CSP does not use unsafe-eval in the directive value', () => {
    // Extract the actual CSP_DIRECTIVES string (not comments)
    const directivesMatch = cfg.match(/const CSP_DIRECTIVES = \[([\s\S]*?)\]\.join/);
    expect(directivesMatch).not.toBeNull();
    const directives = directivesMatch![1];
    expect(directives).not.toContain("'unsafe-eval'");
  });

  it('has immutable Cache-Control for /_next/static/*', () => {
    expect(cfg).toContain('_next/static');
    expect(cfg).toContain('immutable');
  });
});

// ---------------------------------------------------------------------------
// No eval / dynamic code execution in source
// ---------------------------------------------------------------------------

describe('No unsafe code execution', () => {
  it('no eval() calls in src/', () => {
    const hits = grepSrc(/\beval\s*\(/);
    // Allow only test files that test for absence of eval
    const nonTest = hits.filter(h => !h.includes('.test.') && !h.includes('/tests/'));
    expect(nonTest).toHaveLength(0);
  });

  it('no new Function() in src/', () => {
    const hits = grepSrc(/new\s+Function\s*\(/);
    const nonTest = hits.filter(h => !h.includes('.test.'));
    expect(nonTest).toHaveLength(0);
  });

  it('no setTimeout with string argument in src/', () => {
    const hits = grepSrc(/setTimeout\s*\(\s*["'`]/);
    const nonTest = hits.filter(h => !h.includes('.test.'));
    expect(nonTest).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// dangerouslySetInnerHTML — only allowed in JsonLd with safe data
// ---------------------------------------------------------------------------

describe('dangerouslySetInnerHTML safety', () => {
  it('only exists in JsonLd.tsx', () => {
    const hits = grepSrc(/dangerouslySetInnerHTML/);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain('JsonLd.tsx');
  });

  it('JsonLd.tsx uses JSON.stringify (not raw user input)', () => {
    const src = readFile('src/components/seo/JsonLd.tsx');
    expect(src).toContain('JSON.stringify(data)');
    // data param is typed — no user string is passed
    expect(src).not.toContain('dangerouslySetInnerHTML={{ __html: data }}');
  });
});

// ---------------------------------------------------------------------------
// No API routes (zero server-side attack surface beyond sitemap/robots)
// ---------------------------------------------------------------------------

describe('No unexpected API routes', () => {
  it('no custom route.ts files exist outside allowed paths', () => {
    const appDir = path.join(srcDir, 'app');
    const routes: string[] = [];
    function findRoutes(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) findRoutes(full);
        else if (entry.name === 'route.ts' || entry.name === 'route.js') {
          routes.push(path.relative(root, full));
        }
      }
    }
    findRoutes(appDir);
    // sitemap.ts and robots.ts are conventions, not route files.
    // Donation API routes are intentional — all other routes are unexpected.
    const allowedRoutes = [
      'src/app/api/donations/create-order/route.ts',
      'src/app/api/donations/verify/route.ts',
    ];
    const unexpected = routes.filter((r) => !allowedRoutes.includes(r));
    expect(unexpected).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Error pages exist
// ---------------------------------------------------------------------------

describe('Error pages', () => {
  it('not-found.tsx exists', () => {
    expect(exists('src/app/not-found.tsx')).toBe(true);
  });

  it('error.tsx exists', () => {
    expect(exists('src/app/error.tsx')).toBe(true);
  });

  it('404 page has noindex robots meta', () => {
    const src = readFile('src/app/not-found.tsx');
    expect(src).toContain('index: false');
  });

  it('error page does not expose stack trace', () => {
    const src = readFile('src/app/error.tsx');
    // Should not render error.message or error.stack directly in JSX
    expect(src).not.toContain('{error.message}');
    expect(src).not.toContain('{error.stack}');
  });
});

// ---------------------------------------------------------------------------
// No hardcoded secrets in source
// ---------------------------------------------------------------------------

describe('No hardcoded secrets', () => {
  it('no hardcoded AIza (Google API key pattern)', () => {
    const hits = grepSrc(/AIza[0-9A-Za-z\-_]{35}/);
    expect(hits).toHaveLength(0);
  });

  it('no hardcoded G- measurement IDs (must be env var)', () => {
    const hits = grepSrc(/['"]G-[A-Z0-9]{8,}['"]/);
    // Must only appear as env var reference, not literal
    expect(hits).toHaveLength(0);
  });

  it('no hardcoded ca-pub- AdSense IDs', () => {
    const hits = grepSrc(/['"]ca-pub-[0-9]{10,}['"]/);
    expect(hits).toHaveLength(0);
  });

  it('no sk- tokens (OpenAI pattern)', () => {
    const hits = grepSrc(/sk-[A-Za-z0-9]{20,}/);
    expect(hits).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ToolOutput XSS safety
// ---------------------------------------------------------------------------

describe('ToolOutput XSS safety', () => {
  it('ToolOutput renders inside <pre> (React-escaped)', () => {
    const src = readFile('src/components/ui/ToolOutput.tsx');
    expect(src).toContain('<pre');
    // Must NOT use dangerouslySetInnerHTML for output
    expect(src).not.toContain('dangerouslySetInnerHTML');
  });

  it('ToolOutput error state uses plain span (no HTML injection)', () => {
    const src = readFile('src/components/ui/ToolOutput.tsx');
    expect(src).toContain('<span');
    expect(src).not.toContain('dangerouslySetInnerHTML');
  });
});

// ---------------------------------------------------------------------------
// All processor-backed tools have processors
// ---------------------------------------------------------------------------

describe('Processor coverage', () => {
  const processorDir = path.join(srcDir, 'lib', 'processors');
  const processorFiles = fs.readdirSync(processorDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => f.replace('.ts', ''));

  it('at least 25 processor files exist', () => {
    expect(processorFiles.length).toBeGreaterThanOrEqual(25);
  });

  it('index.ts exports all processor files', () => {
    const indexSrc = readFile('src/lib/processors/index.ts');
    for (const proc of processorFiles) {
      expect(indexSrc).toContain(proc);
    }
  });
});

// ---------------------------------------------------------------------------
// LAUNCH.md exists and is documented
// ---------------------------------------------------------------------------

describe('Production documentation', () => {
  it('LAUNCH.md exists', () => {
    expect(exists('LAUNCH.md')).toBe(true);
  });

  it('LAUNCH.md contains deploy commands', () => {
    const src = readFile('LAUNCH.md');
    expect(src).toContain('docker buildx build');
    expect(src).toContain('gcloud run deploy');
  });

  it('LAUNCH.md documents rollback procedure', () => {
    const src = readFile('LAUNCH.md');
    expect(src).toContain('Rollback');
    expect(src).toContain('update-traffic');
  });

  it('LAUNCH.md documents environment variables', () => {
    const src = readFile('LAUNCH.md');
    expect(src).toContain('NEXT_PUBLIC_SITE_URL');
    expect(src).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  });

  it('LAUNCH.md documents Search Console steps', () => {
    const src = readFile('LAUNCH.md');
    expect(src).toContain('Search Console');
  });
});

// ---------------------------------------------------------------------------
// Dockerfile hardening
// ---------------------------------------------------------------------------

describe('Dockerfile security', () => {
  it('Dockerfile uses non-root user', () => {
    const src = readFile('Dockerfile');
    expect(src).toContain('USER nextjs');
    expect(src).toContain('adduser');
  });

  it('Dockerfile uses multi-stage build', () => {
    const src = readFile('Dockerfile');
    expect(src).toContain('AS deps');
    expect(src).toContain('AS builder');
    expect(src).toContain('AS runner');
  });

  it('Dockerfile copies only standalone output (no source files)', () => {
    const src = readFile('Dockerfile');
    expect(src).toContain('standalone');
    // Should NOT copy all src files into the runner
    expect(src).not.toMatch(/COPY\s+\.\/src/);
  });

  it('Dockerfile disables Next.js telemetry', () => {
    const src = readFile('Dockerfile');
    expect(src).toContain('NEXT_TELEMETRY_DISABLED=1');
  });
});
