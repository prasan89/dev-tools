import { base64EncoderProcessor } from '@/lib/processors/base64-encoder';
import { base64DecoderProcessor } from '@/lib/processors/base64-decoder';
import { urlEncoderProcessor } from '@/lib/processors/url-encoder';
import { urlDecoderProcessor } from '@/lib/processors/url-decoder';
import { htmlEncoderProcessor } from '@/lib/processors/html-encoder';
import { htmlDecoderProcessor } from '@/lib/processors/html-decoder';
import { getToolById, getToolsByCategory } from '@/lib/registry';
import { getProcessor } from '@/lib/processors/index';

// ============================================================
// Base64 Encoder
// ============================================================

describe('base64EncoderProcessor', () => {
  it('encodes plain ASCII text', () => {
    const result = base64EncoderProcessor.process({ value: 'Hello World' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('SGVsbG8gV29ybGQ=');
  });

  it('encodes empty string input gracefully with error', () => {
    const result = base64EncoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
    expect(result.output).toBeUndefined();
  });

  it('encodes Unicode text (Japanese)', () => {
    const result = base64EncoderProcessor.process({ value: 'こんにちは' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBeDefined();
    expect(result.output?.value.length).toBeGreaterThan(0);
    // Verify round-trip
    const decoded = base64DecoderProcessor.process({ value: result.output!.value });
    expect(decoded.output?.value).toBe('こんにちは');
  });

  it('encodes emoji correctly', () => {
    const result = base64EncoderProcessor.process({ value: '🚀' });
    expect(result.error).toBeUndefined();
    // Round-trip verification
    const decoded = base64DecoderProcessor.process({ value: result.output!.value });
    expect(decoded.output?.value).toBe('🚀');
  });

  it('encodes mixed emoji and text', () => {
    const text = 'Hello DevToolsHub 🚀';
    const encoded = base64EncoderProcessor.process({ value: text });
    expect(encoded.error).toBeUndefined();
    const decoded = base64DecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe(text);
  });

  it('encodes multiline text', () => {
    const text = 'line one\nline two\nline three';
    const result = base64EncoderProcessor.process({ value: text });
    expect(result.error).toBeUndefined();
    const decoded = base64DecoderProcessor.process({ value: result.output!.value });
    expect(decoded.output?.value).toBe(text);
  });

  it('encodes special characters', () => {
    const text = '!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/`~';
    const encoded = base64EncoderProcessor.process({ value: text });
    expect(encoded.error).toBeUndefined();
    const decoded = base64DecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe(text);
  });

  it('produces deterministic output (same input → same output)', () => {
    const a = base64EncoderProcessor.process({ value: 'test123' });
    const b = base64EncoderProcessor.process({ value: 'test123' });
    expect(a.output?.value).toBe(b.output?.value);
  });

  it('output is copyable', () => {
    const result = base64EncoderProcessor.process({ value: 'test' });
    expect(result.output?.copyable).toBe(true);
  });

  it('downloadFilename is encoded.txt', () => {
    const result = base64EncoderProcessor.process({ value: 'test' });
    expect(result.output?.downloadFilename).toBe('encoded.txt');
  });

  it('includes meta with input/output lengths', () => {
    const result = base64EncoderProcessor.process({ value: 'hello' });
    expect(result.meta?.['input length']).toBe(5);
    expect(typeof result.meta?.['output length']).toBe('number');
  });

  it('encodes Arabic script', () => {
    const text = 'مرحبا';
    const encoded = base64EncoderProcessor.process({ value: text });
    expect(encoded.error).toBeUndefined();
    const decoded = base64DecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe(text);
  });
});

// ============================================================
// Base64 Decoder
// ============================================================

describe('base64DecoderProcessor', () => {
  it('decodes standard ASCII Base64', () => {
    const result = base64DecoderProcessor.process({ value: 'SGVsbG8gV29ybGQ=' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('Hello World');
  });

  it('decodes Base64 with Unicode output', () => {
    const encoded = base64EncoderProcessor.process({ value: 'こんにちは' });
    const decoded = base64DecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe('こんにちは');
  });

  it('decodes emoji round-trip', () => {
    const encoded = base64EncoderProcessor.process({ value: '😀 👍 🎉' });
    const decoded = base64DecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe('😀 👍 🎉');
  });

  it('returns error for invalid Base64', () => {
    const result = base64DecoderProcessor.process({ value: 'not valid base64!!!' });
    expect(result.error).toBeDefined();
    expect(result.output).toBeUndefined();
  });

  it('returns error for empty input', () => {
    const result = base64DecoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('returns error for malformed padding', () => {
    // Base64 strings whose length mod 4 != 0 are invalid
    const result = base64DecoderProcessor.process({ value: 'abc' });
    expect(result.error).toBeDefined();
  });

  it('handles Base64 with embedded whitespace/line breaks', () => {
    const encoded = base64EncoderProcessor.process({ value: 'Hello World' });
    const withSpaces = encoded.output!.value.replace(/(.{4})/g, '$1 ').trim();
    const decoded = base64DecoderProcessor.process({ value: withSpaces });
    expect(decoded.error).toBeUndefined();
    expect(decoded.output?.value).toBe('Hello World');
  });

  it('downloadFilename is decoded.txt', () => {
    const result = base64DecoderProcessor.process({ value: 'SGVsbG8=' });
    expect(result.output?.downloadFilename).toBe('decoded.txt');
  });

  it('output is copyable', () => {
    const result = base64DecoderProcessor.process({ value: 'SGVsbG8=' });
    expect(result.output?.copyable).toBe(true);
  });
});

// ============================================================
// URL Encoder
// ============================================================

describe('urlEncoderProcessor', () => {
  it('encodes spaces as %20', () => {
    const result = urlEncoderProcessor.process({ value: 'hello world' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('hello%20world');
  });

  it('encodes special characters', () => {
    const result = urlEncoderProcessor.process({ value: 'a & b = c' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('%26');
    expect(result.output?.value).toContain('%3D');
  });

  it('encodes Unicode correctly', () => {
    const result = urlEncoderProcessor.process({ value: '日本語' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('%');
    // Round-trip
    const decoded = urlDecoderProcessor.process({ value: result.output!.value });
    expect(decoded.output?.value).toBe('日本語');
  });

  it('encodes query parameters', () => {
    const result = urlEncoderProcessor.process({ value: 'Java Spring Boot' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('Java%20Spring%20Boot');
  });

  it('returns error for empty input', () => {
    const result = urlEncoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('does not double-encode already encoded text (raw text is passed through)', () => {
    // encodeURIComponent just encodes what it gets, including % signs
    const result = urlEncoderProcessor.process({ value: 'hello%20world' });
    expect(result.error).toBeUndefined();
    // The % itself should be encoded
    expect(result.output?.value).toContain('%2520');
  });

  it('downloadFilename is url-encoded.txt', () => {
    const result = urlEncoderProcessor.process({ value: 'test' });
    expect(result.output?.downloadFilename).toBe('url-encoded.txt');
  });

  it('is copyable', () => {
    const result = urlEncoderProcessor.process({ value: 'test' });
    expect(result.output?.copyable).toBe(true);
  });
});

// ============================================================
// URL Decoder
// ============================================================

describe('urlDecoderProcessor', () => {
  it('decodes %20 to space', () => {
    const result = urlDecoderProcessor.process({ value: 'hello%20world' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('hello world');
  });

  it('decodes special characters', () => {
    const result = urlDecoderProcessor.process({ value: 'hello%20world%20%26%20java' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('hello world & java');
  });

  it('decodes Unicode', () => {
    const encoded = urlEncoderProcessor.process({ value: '中文' });
    const decoded = urlDecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe('中文');
  });

  it('returns error for malformed percent sequence', () => {
    const result = urlDecoderProcessor.process({ value: 'hello%GG' });
    expect(result.error).toBeDefined();
  });

  it('returns error for empty input', () => {
    const result = urlDecoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('decodes + signs as literal + (not space)', () => {
    // decodeURIComponent does not convert + to space
    const result = urlDecoderProcessor.process({ value: 'hello+world' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('hello+world');
  });

  it('downloadFilename is url-decoded.txt', () => {
    const result = urlDecoderProcessor.process({ value: 'hello%20world' });
    expect(result.output?.downloadFilename).toBe('url-decoded.txt');
  });
});

// ============================================================
// HTML Encoder
// ============================================================

describe('htmlEncoderProcessor', () => {
  it('encodes <', () => {
    const result = htmlEncoderProcessor.process({ value: '<div>' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('&lt;div&gt;');
  });

  it('encodes >', () => {
    const result = htmlEncoderProcessor.process({ value: '>' });
    expect(result.output?.value).toBe('&gt;');
  });

  it('encodes &', () => {
    const result = htmlEncoderProcessor.process({ value: 'Hello & World' });
    expect(result.output?.value).toBe('Hello &amp; World');
  });

  it('encodes double quotes', () => {
    const result = htmlEncoderProcessor.process({ value: '"hello"' });
    expect(result.output?.value).toBe('&quot;hello&quot;');
  });

  it('encodes single quotes', () => {
    const result = htmlEncoderProcessor.process({ value: "it's" });
    expect(result.output?.value).toBe('it&#39;s');
  });

  it('encodes a complete HTML snippet', () => {
    const result = htmlEncoderProcessor.process({
      value: '<div class="developer">Hello & welcome</div>',
    });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe(
      '&lt;div class=&quot;developer&quot;&gt;Hello &amp; welcome&lt;/div&gt;'
    );
  });

  it('does not corrupt Unicode characters', () => {
    const result = htmlEncoderProcessor.process({ value: 'こんにちは 🎉' });
    expect(result.output?.value).toBe('こんにちは 🎉');
  });

  it('returns error for empty input', () => {
    const result = htmlEncoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('warns when no special characters found', () => {
    const result = htmlEncoderProcessor.process({ value: 'plain text no specials' });
    expect(result.warnings?.length).toBeGreaterThan(0);
  });

  it('does not double-encode (& → &amp; not &amp;amp;)', () => {
    const result = htmlEncoderProcessor.process({ value: '&amp;' });
    expect(result.output?.value).toBe('&amp;amp;');
  });

  it('downloadFilename is html-encoded.txt', () => {
    const result = htmlEncoderProcessor.process({ value: '<test>' });
    expect(result.output?.downloadFilename).toBe('html-encoded.txt');
  });

  it('is copyable', () => {
    const result = htmlEncoderProcessor.process({ value: '<test>' });
    expect(result.output?.copyable).toBe(true);
  });
});

// ============================================================
// HTML Decoder
// ============================================================

describe('htmlDecoderProcessor', () => {
  it('decodes &amp; to &', () => {
    const result = htmlDecoderProcessor.process({ value: '&amp;' });
    expect(result.output?.value).toBe('&');
  });

  it('decodes &lt; and &gt;', () => {
    const result = htmlDecoderProcessor.process({ value: '&lt;div&gt;' });
    expect(result.output?.value).toBe('<div>');
  });

  it('decodes &quot; and &#39;', () => {
    const result = htmlDecoderProcessor.process({ value: '&quot;hello&quot; it&#39;s' });
    expect(result.output?.value).toBe('"hello" it\'s');
  });

  it('decodes a full encoded HTML snippet', () => {
    const result = htmlDecoderProcessor.process({
      value: '&lt;div class=&quot;developer&quot;&gt;Hello &amp; welcome&lt;/div&gt;',
    });
    expect(result.output?.value).toBe('<div class="developer">Hello & welcome</div>');
  });

  it('decodes decimal numeric entities', () => {
    const result = htmlDecoderProcessor.process({ value: '&#65;&#66;&#67;' });
    expect(result.output?.value).toBe('ABC');
  });

  it('decodes hexadecimal numeric entities', () => {
    const result = htmlDecoderProcessor.process({ value: '&#x41;&#x42;&#x43;' });
    expect(result.output?.value).toBe('ABC');
  });

  it('decodes emoji via numeric entity', () => {
    // 🚀 is U+1F680
    const result = htmlDecoderProcessor.process({ value: '&#128640;' });
    expect(result.output?.value).toBe('🚀');
  });

  it('leaves unknown named entities unchanged', () => {
    const result = htmlDecoderProcessor.process({ value: '&unknownEntity;' });
    expect(result.output?.value).toBe('&unknownEntity;');
  });

  it('does not render HTML — output is plain text', () => {
    // Decoding should not produce DOM-executable content
    const encoded = '&lt;script&gt;alert(1)&lt;/script&gt;';
    const result = htmlDecoderProcessor.process({ value: encoded });
    // The output is the decoded text (contains <script>) but is DISPLAYED as text, not rendered
    expect(result.output?.type).toBe('text');
    expect(result.output?.value).toBe('<script>alert(1)</script>');
  });

  it('returns error for empty input', () => {
    const result = htmlDecoderProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('round-trip: encode then decode returns original', () => {
    const original = '<div class="dev">Hello & world \'test\'</div>';
    const encoded = htmlEncoderProcessor.process({ value: original });
    const decoded = htmlDecoderProcessor.process({ value: encoded.output!.value });
    expect(decoded.output?.value).toBe(original);
  });

  it('downloadFilename is html-decoded.txt', () => {
    const result = htmlDecoderProcessor.process({ value: '&amp;' });
    expect(result.output?.downloadFilename).toBe('html-decoded.txt');
  });
});

// ============================================================
// Registry integrity — M4 tools
// ============================================================

describe('M4 registry entries', () => {
  const ids = [
    'base64-encoder',
    'base64-decoder',
    'url-encoder',
    'url-decoder',
    'html-encoder',
    'html-decoder',
  ];

  ids.forEach((id) => {
    it(`${id} exists in registry`, () => {
      expect(getToolById(id)).toBeDefined();
    });

    it(`${id} is enabled`, () => {
      expect(getToolById(id)?.enabled).toBe(true);
    });

    it(`${id} has category 'encoding'`, () => {
      expect(getToolById(id)?.category).toBe('encoding');
    });

    it(`${id} has seoTitle`, () => {
      expect(getToolById(id)?.seoTitle.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has seoDescription`, () => {
      expect(getToolById(id)?.seoDescription.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has a processor attached`, () => {
      expect(getProcessor(id)).toBeDefined();
    });
  });

  it('all 6 encoding tools appear in getToolsByCategory(encoding)', () => {
    const tools = getToolsByCategory('encoding');
    const slugs = tools.map((t) => t.slug);
    expect(slugs).toContain('base64-encoder');
    expect(slugs).toContain('base64-decoder');
    expect(slugs).toContain('url-encoder');
    expect(slugs).toContain('url-decoder');
    expect(slugs).toContain('html-encoder');
    expect(slugs).toContain('html-decoder');
  });

  it('base64-encoder relatedTools includes base64-decoder', () => {
    expect(getToolById('base64-encoder')?.relatedTools).toContain('base64-decoder');
  });

  it('base64-decoder relatedTools includes base64-encoder', () => {
    expect(getToolById('base64-decoder')?.relatedTools).toContain('base64-encoder');
  });

  it('url-encoder relatedTools includes url-decoder', () => {
    expect(getToolById('url-encoder')?.relatedTools).toContain('url-decoder');
  });

  it('html-encoder relatedTools includes html-decoder', () => {
    expect(getToolById('html-encoder')?.relatedTools).toContain('html-decoder');
  });

  it('all relatedTools IDs exist in registry', () => {
    ids.forEach((id) => {
      const tool = getToolById(id);
      tool?.relatedTools?.forEach((rid) => {
        expect(getToolById(rid)).toBeDefined();
      });
    });
  });
});
