/**
 * M74 — Privacy and security audit tests
 */

import {
  sanitizeExtractedText,
  stripHtml,
  sanitizeFilename,
  isSafeUrl,
  isValidWorkerPayload,
  sanitizeMetadataValue,
  containsPassword,
} from '../src/lib/security';

// ─── sanitizeExtractedText ────────────────────────────────────────────────────

describe('sanitizeExtractedText', () => {
  it('escapes < and >', () => {
    expect(sanitizeExtractedText('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  it('escapes & characters', () => {
    expect(sanitizeExtractedText('a & b')).toBe('a &amp; b');
  });

  it('escapes double quotes', () => {
    expect(sanitizeExtractedText('"quoted"')).toContain('&quot;');
  });

  it('preserves normal text', () => {
    expect(sanitizeExtractedText('Hello world')).toBe('Hello world');
  });

  it('handles empty string', () => {
    expect(sanitizeExtractedText('')).toBe('');
  });
});

// ─── stripHtml ────────────────────────────────────────────────────────────────

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('plain text')).toBe('plain text');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('removes script tags', () => {
    expect(stripHtml('<script>evil()</script>')).not.toContain('<script>');
  });
});

// ─── sanitizeFilename ─────────────────────────────────────────────────────────

describe('sanitizeFilename', () => {
  it('replaces path separator characters', () => {
    expect(sanitizeFilename('../../../etc/passwd')).not.toContain('/');
    expect(sanitizeFilename('../../../etc/passwd')).not.toContain('\\');
  });

  it('replaces dangerous characters', () => {
    const cleaned = sanitizeFilename('file<name>?.pdf');
    expect(cleaned).not.toMatch(/[<>?]/);
  });

  it('keeps normal filenames intact', () => {
    expect(sanitizeFilename('my-document.pdf')).toBe('my-document.pdf');
  });

  it('truncates very long filenames', () => {
    const longName = 'a'.repeat(300);
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
  });

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });
});

// ─── isSafeUrl ────────────────────────────────────────────────────────────────

describe('isSafeUrl', () => {
  it('returns true for https URLs', () => {
    expect(isSafeUrl('https://example.com/page')).toBe(true);
  });

  it('returns true for http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('returns false for javascript: URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('returns false for data: URLs', () => {
    expect(isSafeUrl('data:text/html,<script>evil()</script>')).toBe(false);
  });

  it('returns false for malformed URLs', () => {
    expect(isSafeUrl('not-a-url')).toBe(false);
  });
});

// ─── isValidWorkerPayload ────────────────────────────────────────────────────

describe('isValidWorkerPayload', () => {
  it('accepts null', () => {
    expect(isValidWorkerPayload(null)).toBe(true);
  });

  it('accepts strings', () => {
    expect(isValidWorkerPayload('hello')).toBe(true);
  });

  it('accepts numbers', () => {
    expect(isValidWorkerPayload(42)).toBe(true);
  });

  it('accepts plain objects', () => {
    expect(isValidWorkerPayload({ type: 'progress', value: 50 })).toBe(true);
  });

  it('accepts ArrayBuffer', () => {
    expect(isValidWorkerPayload(new ArrayBuffer(10))).toBe(true);
  });

  it('rejects objects with function values', () => {
    expect(isValidWorkerPayload({ fn: () => {} })).toBe(false);
  });
});

// ─── sanitizeMetadataValue ────────────────────────────────────────────────────

describe('sanitizeMetadataValue', () => {
  it('returns empty string for non-strings', () => {
    expect(sanitizeMetadataValue(123)).toBe('');
    expect(sanitizeMetadataValue(null)).toBe('');
  });

  it('escapes HTML in metadata', () => {
    expect(sanitizeMetadataValue('<b>Author</b>')).not.toContain('<b>');
  });

  it('truncates long values', () => {
    const long = 'x'.repeat(2000);
    expect(sanitizeMetadataValue(long).length).toBeLessThanOrEqual(1000 + 50);
  });
});

// ─── containsPassword ────────────────────────────────────────────────────────

describe('containsPassword', () => {
  it('detects password key', () => {
    expect(containsPassword({ password: 'secret', tool: 'compress' })).toBe(true);
  });

  it('detects passwd key', () => {
    expect(containsPassword({ passwd: 'x' })).toBe(true);
  });

  it('does not flag normal analytics keys', () => {
    expect(containsPassword({ tool: 'compress', pages: 3 })).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(containsPassword({ PASSWORD: 'x' })).toBe(true);
  });
});

// ─── PDF lib network audit ───────────────────────────────────────────────────

describe('PDF lib network audit', () => {
  it('pdf lib files do not contain fetch() calls', () => {
    const fs = require('fs');
    const path = require('path');
    const libDir = path.resolve(__dirname, '../src/lib/pdf');
    const files = fs.readdirSync(libDir).filter((f: string) => f.endsWith('.ts'));
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf8');
      // Allow fetch in webPageToPdf (used to fetch external URLs for conversion - documented)
      if (file === 'webPageToPdf.ts') continue;
      if (/\bfetch\s*\(/.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it('pdf lib files do not contain XMLHttpRequest', () => {
    const fs = require('fs');
    const path = require('path');
    const libDir = path.resolve(__dirname, '../src/lib/pdf');
    const files = fs.readdirSync(libDir).filter((f: string) => f.endsWith('.ts'));
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(libDir, file), 'utf8');
      if (/XMLHttpRequest/.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});
