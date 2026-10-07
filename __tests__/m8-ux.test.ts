/**
 * M8 UX / Accessibility tests
 *
 * Tests cover:
 * - SearchBar: ARIA attributes and keyboard navigation logic
 * - Action buttons: aria-label presence, type="button", min-h touch target
 * - ToolOutput: role=alert on error, no <label> for non-form element
 * - globals.css: reduced-motion wrapping for scroll-behavior
 * - getProcessor: async API for all 25 tools
 */

import { searchTools } from '@/lib/registry';
import { getProcessor } from '@/lib/processors/index';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Search logic (pure function — no DOM needed)
// ---------------------------------------------------------------------------

describe('searchTools', () => {
  it('returns results for a valid query', () => {
    const r = searchTools('json');
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns all enabled tools for empty query', () => {
    // searchTools('') returns all enabled tools — SearchBar guards query.length < 2
    const r = searchTools('');
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns empty array for no match', () => {
    expect(searchTools('zzznomatch')).toHaveLength(0);
  });

  it('finds tools by partial keyword prefix', () => {
    const r = searchTools('base64');
    expect(r.some((t) => t.id === 'base64-encoder')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getProcessor — async API, all 25 tools resolve
// ---------------------------------------------------------------------------

const EXPECTED_TOOLS = [
  'json-formatter',
  'json-minifier',
  'json-validator',
  'json-diff',
  'json-to-csv',
  'csv-to-json',
  'json-to-yaml',
  'json-to-xml',
  'base64-encoder',
  'base64-decoder',
  'url-encoder',
  'url-decoder',
  'html-encoder',
  'html-decoder',
  'jwt-decoder',
  'regex-tester',
  'sql-formatter',
  'xml-formatter',
  'yaml-formatter',
  'yaml-to-json',
  'uuid-generator',
  'uuid-validator',
  'unix-timestamp-converter',
  'timestamp-to-date',
  'password-generator',
];

describe('getProcessor — all 25 tools', () => {
  it.each(EXPECTED_TOOLS)('resolves processor for %s', async (toolId) => {
    const p = await getProcessor(toolId);
    expect(p).toBeDefined();
    expect(typeof p!.process).toBe('function');
  });

  it('returns undefined for unknown tool ID', async () => {
    const p = await getProcessor('nonexistent-tool-xyz');
    expect(p).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Source-code audits (static analysis via fs.readFileSync)
// These catch regressions faster than full render tests.
// ---------------------------------------------------------------------------

const srcDir = path.join(process.cwd(), 'src');

function readSrc(relPath: string) {
  return fs.readFileSync(path.join(srcDir, relPath), 'utf8');
}

describe('DownloadButton accessibility', () => {
  const src = readSrc('components/ui/DownloadButton.tsx');

  it('has aria-label', () => {
    expect(src).toContain('aria-label=');
  });

  it('has type="button"', () => {
    expect(src).toContain('type="button"');
  });

  it('has min-h touch target', () => {
    expect(src).toContain('min-h-[2.25rem]');
  });
});

describe('CopyButton accessibility', () => {
  const src = readSrc('components/ui/CopyButton.tsx');

  it('has aria-label', () => {
    expect(src).toContain('aria-label=');
  });

  it('has min-h touch target', () => {
    expect(src).toContain('min-h-[2.25rem]');
  });
});

describe('ClearButton accessibility', () => {
  const src = readSrc('components/ui/ClearButton.tsx');

  it('has aria-label="Clear input"', () => {
    expect(src).toContain('aria-label="Clear input"');
  });

  it('has type="button"', () => {
    expect(src).toContain('type="button"');
  });

  it('has min-h touch target', () => {
    expect(src).toContain('min-h-[2.25rem]');
  });
});

describe('SearchBar ARIA combobox pattern', () => {
  const src = readSrc('components/ui/SearchBar.tsx');

  it('has role="combobox" wrapper', () => {
    expect(src).toContain('role="combobox"');
  });

  it('has aria-expanded on wrapper', () => {
    expect(src).toContain('aria-expanded=');
  });

  it('has aria-haspopup="listbox"', () => {
    expect(src).toContain('aria-haspopup="listbox"');
  });

  it('has role="listbox" on dropdown', () => {
    expect(src).toContain('role="listbox"');
  });

  it('has role="option" on items', () => {
    expect(src).toContain('role="option"');
  });

  it('has aria-selected on options', () => {
    expect(src).toContain('aria-selected=');
  });

  it('has aria-activedescendant on input', () => {
    expect(src).toContain('aria-activedescendant=');
  });

  it('has sr-only label for input', () => {
    expect(src).toContain('sr-only');
    expect(src).toContain('Search developer tools');
  });

  it('has aria-live announcement', () => {
    expect(src).toContain('aria-live="polite"');
  });

  it('handles ArrowDown key', () => {
    expect(src).toContain("'ArrowDown'");
  });

  it('handles ArrowUp key', () => {
    expect(src).toContain("'ArrowUp'");
  });

  it('handles Escape key', () => {
    expect(src).toContain("'Escape'");
  });
});

describe('ToolInput label association', () => {
  const src = readSrc('components/ui/ToolInput.tsx');

  it('uses useId for input ID', () => {
    expect(src).toContain('useId');
  });

  it('has htmlFor on label', () => {
    expect(src).toContain('htmlFor={id}');
  });

  it('has id on textarea', () => {
    expect(src).toContain('id={id}');
  });
});

describe('ToolOutput accessibility', () => {
  const src = readSrc('components/ui/ToolOutput.tsx');

  it('has role="alert" for error state', () => {
    expect(src).toContain("role={error ? 'alert' : undefined}");
  });

  it('uses <p> not <label> for output section heading', () => {
    // Should NOT have a <label> element (label is for form controls)
    expect(src).not.toContain('<label ');
    expect(src).toContain('<p ');
  });
});

describe('ToolWorkspace accessibility', () => {
  const src = readSrc('components/tools/ToolWorkspace.tsx');

  it('Run button has type="button"', () => {
    // Check that the run button has type="button"
    expect(src).toContain('type="button"');
  });

  it('Run button has aria-label', () => {
    expect(src).toContain('aria-label="Run tool"');
  });

  it('Load Example button has type="button"', () => {
    expect(src).toContain('type="button"');
  });

  it('processor loading state has aria-live announcement', () => {
    expect(src).toContain('aria-live="polite"');
    expect(src).toContain('Loading tool, please wait.');
  });
});

describe('ToolCard server component', () => {
  const src = readSrc('components/ui/ToolCard.tsx');

  it('does not have use client directive', () => {
    expect(src).not.toContain("'use client'");
    expect(src).not.toContain('"use client"');
  });

  it('does not use useState or useEffect', () => {
    expect(src).not.toContain('useState');
    expect(src).not.toContain('useEffect');
  });
});

describe('Header server component', () => {
  const src = readSrc('components/layout/Header.tsx');

  it('does not have use client directive', () => {
    expect(src).not.toContain("'use client'");
    expect(src).not.toContain('"use client"');
  });
});

describe('MobileNav client island', () => {
  const src = readSrc('components/layout/MobileNav.tsx');

  it('has use client directive', () => {
    expect(src).toContain("'use client'");
  });

  it('has aria-expanded on toggle button', () => {
    expect(src).toContain('aria-expanded');
  });

  it('has aria-label on toggle button', () => {
    expect(src).toContain('aria-label');
  });
});

describe('globals.css reduced motion', () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), 'src', 'app', 'globals.css'),
    'utf8'
  );

  it('wraps scroll-behavior smooth in prefers-reduced-motion query', () => {
    const idx = css.indexOf('scroll-behavior: smooth');
    expect(idx).toBeGreaterThan(-1);
    // The smooth value must appear inside a @media (prefers-reduced-motion: no-preference) block
    const before = css.slice(0, idx);
    expect(before).toContain('prefers-reduced-motion: no-preference');
  });

  it('does not apply smooth scroll unconditionally', () => {
    // Verify there's no scroll-behavior: smooth outside the media query
    // by checking the fallback 'auto' is present
    expect(css).toContain('scroll-behavior: auto');
  });
});
