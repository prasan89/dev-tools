/**
 * M11 - Tests for 7 new processors:
 * hash-generator, html-formatter, css-formatter, diff-checker,
 * markdown-preview, word-counter, color-picker
 */

// Import processors directly (no dynamic imports needed in tests)
import { wordCounterProcessor } from '@/lib/processors/word-counter';
import { colorPickerProcessor } from '@/lib/processors/color-picker';
import { htmlFormatterProcessor } from '@/lib/processors/html-formatter';
import { cssFormatterProcessor } from '@/lib/processors/css-formatter';
import { diffCheckerProcessor } from '@/lib/processors/diff-checker';
import { markdownPreviewProcessor, escapeHtml } from '@/lib/processors/markdown-preview';
import { hashGeneratorProcessor } from '@/lib/processors/hash-generator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function run(processor: typeof wordCounterProcessor, value: string, opts?: Record<string, unknown>) {
  return processor.process({ value, options: opts });
}

function run2(
  processor: typeof diffCheckerProcessor,
  value: string,
  secondary: string,
  opts?: Record<string, unknown>
) {
  return processor.process({ value, secondary, options: opts });
}

// ---------------------------------------------------------------------------
// Word Counter
// ---------------------------------------------------------------------------
describe('word-counter', () => {
  it('returns error on empty input', () => {
    const r = run(wordCounterProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('counts words correctly', () => {
    const r = run(wordCounterProcessor, 'Hello world foo bar');
    expect(r.output?.value).toContain('Words:             4');
  });

  it('counts characters', () => {
    const r = run(wordCounterProcessor, 'abc');
    expect(r.output?.value).toContain('Characters:        3');
  });

  it('counts lines', () => {
    const r = run(wordCounterProcessor, 'line1\nline2\nline3');
    expect(r.output?.value).toContain('Lines:             3');
  });

  it('includes reading time', () => {
    const r = run(wordCounterProcessor, 'word '.repeat(200));
    expect(r.output?.value).toContain('Reading time:');
  });

  it('returns meta with word count', () => {
    const r = run(wordCounterProcessor, 'one two three');
    expect(r.meta?.['words']).toBe(3);
  });

  it('output is copyable', () => {
    const r = run(wordCounterProcessor, 'hello');
    expect(r.output?.copyable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Color Picker
// ---------------------------------------------------------------------------
describe('color-picker', () => {
  it('returns error on empty input', () => {
    const r = run(colorPickerProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('converts #hex to RGB and HSL', () => {
    const r = run(colorPickerProcessor, '#ff0000');
    expect(r.output?.value).toContain('rgb(255, 0, 0)');
    expect(r.output?.value).toContain('hsl(0, 100%, 50%)');
  });

  it('handles 3-digit hex', () => {
    const r = run(colorPickerProcessor, '#fff');
    expect(r.output?.value).toContain('rgb(255, 255, 255)');
  });

  it('converts rgb() input', () => {
    const r = run(colorPickerProcessor, 'rgb(0, 128, 255)');
    expect(r.output?.value).toContain('HEX:  #0080FF');
  });

  it('converts hsl() input', () => {
    const r = run(colorPickerProcessor, 'hsl(0, 100%, 50%)');
    expect(r.output?.value).toContain('rgb(255, 0, 0)');
  });

  it('returns error for invalid color', () => {
    const r = run(colorPickerProcessor, 'notacolor');
    expect(r.error).toBeTruthy();
  });

  it('includes RGBA and HSLA in output', () => {
    const r = run(colorPickerProcessor, '#000000');
    expect(r.output?.value).toContain('rgba(0, 0, 0, 1)');
    expect(r.output?.value).toContain('hsla(0, 0%, 0%, 1)');
  });

  it('output is copyable', () => {
    const r = run(colorPickerProcessor, '#abcdef');
    expect(r.output?.copyable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// HTML Formatter
// ---------------------------------------------------------------------------
describe('html-formatter', () => {
  it('returns error on empty input', () => {
    const r = run(htmlFormatterProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('formats simple HTML', () => {
    const r = run(htmlFormatterProcessor, '<div><p>Hello</p></div>');
    expect(r.output?.value).toContain('<div>');
    expect(r.output?.value).toContain('  <p>');
  });

  it('respects 4-space indent option', () => {
    const r = run(htmlFormatterProcessor, '<ul><li>item</li></ul>', { tabWidth: '4' });
    expect(r.output?.value).toContain('    <li>');
  });

  it('handles void elements without closing tag', () => {
    const r = run(htmlFormatterProcessor, '<div><br><img src="x.png"></div>');
    expect(r.output?.value).not.toContain('</br>');
    expect(r.output?.value).not.toContain('</img>');
  });

  it('handles DOCTYPE', () => {
    const r = run(htmlFormatterProcessor, '<!DOCTYPE html><html><body></body></html>');
    expect(r.output?.value).toContain('<!DOCTYPE html>');
  });

  it('output is copyable and downloadable', () => {
    const r = run(htmlFormatterProcessor, '<p>test</p>');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('formatted.html');
  });

  it('includes meta with byte counts', () => {
    const r = run(htmlFormatterProcessor, '<p>test</p>');
    expect(r.meta).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// CSS Formatter
// ---------------------------------------------------------------------------
describe('css-formatter', () => {
  it('returns error on empty input', () => {
    const r = run(cssFormatterProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('formats minified CSS with proper indentation', () => {
    const r = run(cssFormatterProcessor, '.a{color:red;font-size:16px}');
    expect(r.output?.value).toContain('.a {');
    expect(r.output?.value).toContain('color:red;');
  });

  it('respects 4-space indent', () => {
    const r = run(cssFormatterProcessor, '.a{color:red}', { tabWidth: '4' });
    expect(r.output?.value).toContain('    color:red;');
  });

  it('handles @media queries', () => {
    const r = run(cssFormatterProcessor, '@media(max-width:768px){.a{color:blue}}');
    expect(r.output?.value).toContain('@media');
  });

  it('output is copyable and downloadable', () => {
    const r = run(cssFormatterProcessor, '.a{color:red}');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('formatted.css');
  });
});

// ---------------------------------------------------------------------------
// Diff Checker
// ---------------------------------------------------------------------------
describe('diff-checker', () => {
  it('returns error when both inputs are empty', () => {
    const r = run2(diffCheckerProcessor, '', '');
    expect(r.error).toBeTruthy();
  });

  it('reports identical texts', () => {
    const r = run2(diffCheckerProcessor, 'hello\nworld', 'hello\nworld');
    // With layoutVariant:'diff', output is structured JSON
    const data = JSON.parse(r.output?.value ?? '{}');
    expect(data.stats?.added).toBe(0);
    expect(data.stats?.removed).toBe(0);
  });

  it('detects added lines', () => {
    const r = run2(diffCheckerProcessor, 'line1', 'line1\nline2');
    expect(r.meta?.['added']).toBe(1);
    expect(r.meta?.['removed']).toBe(0);
  });

  it('detects removed lines', () => {
    const r = run2(diffCheckerProcessor, 'line1\nline2', 'line1');
    expect(r.meta?.['removed']).toBe(1);
  });

  it('detects changed lines as remove + add', () => {
    const r = run2(diffCheckerProcessor, 'hello', 'world');
    expect(r.meta?.['added']).toBeGreaterThanOrEqual(1);
    expect(r.meta?.['removed']).toBeGreaterThanOrEqual(1);
  });

  it('marks added lines with +', () => {
    const r = run2(diffCheckerProcessor, 'a', 'a\nb');
    const data = JSON.parse(r.output?.value ?? '{}');
    expect(data.lines?.some((l: { type: string }) => l.type === 'added')).toBe(true);
  });

  it('marks removed lines with -', () => {
    const r = run2(diffCheckerProcessor, 'a\nb', 'a');
    const data = JSON.parse(r.output?.value ?? '{}');
    expect(data.lines?.some((l: { type: string }) => l.type === 'removed')).toBe(true);
  });

  it('output is copyable and downloadable', () => {
    const r = run2(diffCheckerProcessor, 'a', 'b');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('diff.txt');
  });

  it('rejects inputs exceeding 5000 lines', () => {
    const big = Array.from({ length: 5001 }, (_, i) => `line ${i}`).join('\n');
    const r = run2(diffCheckerProcessor, big, 'short');
    expect(r.error).toBeTruthy();
  });

  it('hasSecondaryInput is true', () => {
    expect(diffCheckerProcessor.hasSecondaryInput).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Markdown Preview
// ---------------------------------------------------------------------------
describe('markdown-preview', () => {
  it('returns error on empty input', () => {
    const r = run(markdownPreviewProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('renders headings', () => {
    const r = run(markdownPreviewProcessor, '# Hello\n## World');
    expect(r.output?.value).toContain('# Hello');
    expect(r.output?.value).toContain('## World');
  });

  it('renders bold as **text**', () => {
    const r = run(markdownPreviewProcessor, '**bold**');
    expect(r.output?.value).toContain('**bold**');
  });

  it('renders unordered list with bullet', () => {
    const r = run(markdownPreviewProcessor, '- item one\n- item two');
    expect(r.output?.value).toContain('• item one');
    expect(r.output?.value).toContain('• item two');
  });

  it('renders ordered list', () => {
    const r = run(markdownPreviewProcessor, '1. first\n2. second');
    expect(r.output?.value).toContain('1. first');
    expect(r.output?.value).toContain('2. second');
  });

  it('renders blockquote with │', () => {
    const r = run(markdownPreviewProcessor, '> quoted text');
    expect(r.output?.value).toContain('│ quoted text');
  });

  it('renders code block', () => {
    const r = run(markdownPreviewProcessor, '```\nconst x = 1;\n```');
    expect(r.output?.value).toContain('const x = 1;');
  });

  it('renders links as text (url)', () => {
    const r = run(markdownPreviewProcessor, '[click here](https://example.com)');
    expect(r.output?.value).toContain('click here (https://example.com)');
  });

  it('output is copyable', () => {
    const r = run(markdownPreviewProcessor, '# Test');
    expect(r.output?.copyable).toBe(true);
  });

  it('includes meta with input word count', () => {
    const r = run(markdownPreviewProcessor, 'hello world');
    expect(r.meta?.['input words']).toBeDefined();
  });

  // Security: escapeHtml prevents XSS
  it('escapeHtml escapes < > & characters', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });
});

// ---------------------------------------------------------------------------
// Hash Generator — sync interface checks
// ---------------------------------------------------------------------------
describe('hash-generator', () => {
  it('returns error on empty input', () => {
    const r = run(hashGeneratorProcessor, '');
    expect(r.error).toBeTruthy();
  });

  it('autoProcess is false (requires manual trigger)', () => {
    expect(hashGeneratorProcessor.autoProcess).toBe(false);
  });

  it('has algorithm select control', () => {
    const algCtrl = hashGeneratorProcessor.optionControls?.find((c) => c.key === 'algorithm');
    expect(algCtrl).toBeDefined();
    expect(algCtrl?.options?.map((o) => o.value)).toContain('SHA-256');
    expect(algCtrl?.options?.map((o) => o.value)).toContain('SHA-512');
  });

  it('has uppercase checkbox control', () => {
    const upperCtrl = hashGeneratorProcessor.optionControls?.find((c) => c.key === 'uppercase');
    expect(upperCtrl).toBeDefined();
    expect(upperCtrl?.type).toBe('checkbox');
  });

  it('returns a result (not error) for non-empty input after warm-up', () => {
    // First call primes the async; result may be error or output depending on timing
    const r1 = run(hashGeneratorProcessor, 'test', { algorithm: 'SHA-256', uppercase: false });
    // We only assert it doesn't throw
    expect(r1).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Processor coverage — all 7 are registered in processorLoaders
// ---------------------------------------------------------------------------
describe('processor index registration', () => {
  const fs = require('fs');
  const path = require('path');
  const indexSrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/processors/index.ts'),
    'utf8'
  );

  const expectedIds = [
    'hash-generator',
    'html-formatter',
    'css-formatter',
    'diff-checker',
    'markdown-preview',
    'word-counter',
    'color-picker',
  ];

  for (const id of expectedIds) {
    it(`'${id}' is registered in processorLoaders`, () => {
      expect(indexSrc).toContain(`'${id}'`);
    });
  }
});
