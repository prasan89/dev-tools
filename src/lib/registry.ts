import { ToolDefinition, Category, ToolCategoryId } from '@/types/tool';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  {
    id: 'json',
    slug: 'json',
    name: 'JSON Tools',
    description: 'Format, validate, transform, and query JSON data',
    icon: '{ }',
    color: 'blue',
  },
  {
    id: 'encoding',
    slug: 'encoding',
    name: 'Encoding Tools',
    description: 'Base64, URL encode/decode, hash, and cipher utilities',
    icon: '⇄',
    color: 'purple',
  },
  {
    id: 'developer',
    slug: 'developer',
    name: 'Developer Tools',
    description: 'Code formatters, linters, diff tools, and generators',
    icon: '</>',
    color: 'green',
  },
  {
    id: 'data-code',
    slug: 'data-code',
    name: 'Data & Code',
    description: 'CSV, regex, SQL, and data transformation tools',
    icon: '⊞',
    color: 'orange',
  },
  {
    id: 'utilities',
    slug: 'utilities',
    name: 'Utilities',
    description: 'Text tools, unit converters, color pickers, and more',
    icon: '⚙',
    color: 'gray',
  },
  {
    id: 'developer-utilities',
    slug: 'developer-utilities',
    name: 'Developer Utilities',
    description: 'UUID, JWT, passwords, and other developer essentials',
    icon: '⊛',
    color: 'green',
  },
  {
    id: 'date-time',
    slug: 'date-time',
    name: 'Date & Time',
    description: 'Unix timestamps, date converters, and timezone utilities',
    icon: '⏱',
    color: 'orange',
  },
];

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export const TOOLS: ToolDefinition[] = [
  // JSON Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    slug: 'json-formatter',
    category: 'json',
    description: 'Format and beautify JSON with proper indentation',
    longDescription:
      'Paste your JSON data and get it formatted with proper indentation and error detection. Supports 2-space and 4-space indentation. Copy or download the formatted result.',
    icon: '{ }',
    keywords: ['json', 'format', 'beautify', 'pretty print', 'indent', 'prettify', 'json formatter', 'json beautifier'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-validator', 'json-minifier', 'json-diff'],
    popular: true,
    order: 1,
    seoTitle: 'JSON Formatter & Beautifier — Free Online Tool',
    seoDescription:
      'Free online JSON formatter and beautifier. Format, pretty print, and validate JSON with 2 or 4 space indentation. Works entirely in your browser — your data stays private.',
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    slug: 'json-validator',
    category: 'json',
    description: 'Validate JSON syntax and get detailed error messages',
    longDescription:
      'Instantly validates your JSON and shows exactly what is wrong — including line number and column for syntax errors. No data leaves your browser.',
    icon: '✓',
    keywords: ['json', 'validate', 'lint', 'check', 'syntax', 'error', 'json validator', 'json syntax checker', 'check json'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-minifier', 'json-diff'],
    popular: true,
    order: 2,
    seoTitle: 'JSON Validator — Free Online JSON Syntax Checker',
    seoDescription:
      'Validate JSON syntax instantly with detailed error messages, line numbers, and context. Free, private, and works entirely in your browser.',
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    slug: 'json-minifier',
    category: 'json',
    description: 'Remove whitespace from JSON to reduce file size',
    longDescription:
      'Minify JSON by parsing and re-serializing without whitespace. Shows original size, minified size, and savings percentage. Safe minification that preserves all data exactly.',
    icon: '⊞',
    keywords: ['json', 'minify', 'compress', 'shrink', 'reduce', 'json minifier', 'compress json', 'json compressor'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-diff'],
    order: 3,
    seoTitle: 'JSON Minifier — Compress JSON Online',
    seoDescription:
      'Minify and compress JSON data online. Remove whitespace safely by parsing and re-serializing. See exact bytes saved. Free and browser-only.',
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    slug: 'json-diff',
    category: 'json',
    description: 'Compare two JSON documents and highlight differences',
    longDescription:
      'Paste two JSON documents side by side and see exactly what changed — added keys, removed keys, and changed values. Supports nested objects and arrays. Comparison is positional for arrays.',
    icon: '±',
    keywords: ['json', 'diff', 'compare', 'difference', 'json diff', 'compare json', 'json comparison', 'compare json files'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-minifier'],
    popular: true,
    order: 4,
    seoTitle: 'JSON Diff — Compare Two JSON Files Online',
    seoDescription:
      'Compare two JSON documents and see exactly what changed. Highlights added, removed, and changed values including nested structures. Free and browser-only.',
  },

  // Encoding Tools
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    slug: 'base64-encoder',
    category: 'encoding',
    description: 'Convert text to Base64 — handles Unicode, emoji, and all languages',
    longDescription:
      'Encodes any text string into Base64 using proper UTF-8 encoding. Works correctly with Unicode, emoji, and non-Latin scripts. Processing happens entirely in your browser.',
    icon: '⇒',
    keywords: ['base64', 'encode', 'base64 encoder', 'text to base64', 'base64 encoding', 'btoa', 'atob'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-decoder', 'url-encoder', 'html-encoder'],
    popular: true,
    order: 1,
    seoTitle: 'Base64 Encoder — Free Online Tool',
    seoDescription:
      'Encode text to Base64 online. Correctly handles Unicode, emoji, and all languages. Free, instant, and works entirely in your browser.',
  },
  {
    id: 'base64-decoder',
    name: 'Base64 Decoder',
    slug: 'base64-decoder',
    category: 'encoding',
    description: 'Decode Base64 back to plain text — supports Unicode and emoji',
    longDescription:
      'Decodes Base64-encoded strings back to their original UTF-8 text. Validates Base64 format and provides a clear error for malformed input.',
    icon: '⇐',
    keywords: ['base64', 'decode', 'base64 decoder', 'base64 to text', 'decode base64'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder', 'url-decoder', 'html-decoder'],
    popular: true,
    order: 2,
    seoTitle: 'Base64 Decoder — Free Online Tool',
    seoDescription:
      'Decode Base64 to plain text online. Handles Unicode and emoji correctly. Free, instant, and 100% browser-based.',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    slug: 'url-encoder',
    category: 'encoding',
    description: 'Percent-encode text for safe use in URLs and query strings',
    longDescription:
      'Encodes text using percent-encoding (encodeURIComponent) so it can be safely embedded in URL query parameters, path segments, or form values. Handles Unicode and all special characters correctly.',
    icon: '%2B',
    keywords: ['url', 'encode', 'url encoder', 'percent encoding', 'encode url', 'url encode', 'query string'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['url-decoder', 'base64-encoder', 'html-encoder'],
    popular: true,
    order: 3,
    seoTitle: 'URL Encoder — Percent-Encode Text Online',
    seoDescription:
      'URL encode text for use in query strings and URL parameters. Supports Unicode and special characters. Free and browser-based.',
  },
  {
    id: 'url-decoder',
    name: 'URL Decoder',
    slug: 'url-decoder',
    category: 'encoding',
    description: 'Decode percent-encoded URLs and query string values',
    longDescription:
      'Decodes percent-encoded strings back to readable text. Handles %XX sequences, Unicode, and encoded spaces. Shows a clear error for malformed percent sequences.',
    icon: '%2B',
    keywords: ['url', 'decode', 'url decoder', 'percent decoding', 'decode url', 'urldecode'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['url-encoder', 'base64-decoder', 'html-decoder'],
    order: 4,
    seoTitle: 'URL Decoder — Decode Percent-Encoded Text Online',
    seoDescription:
      'Decode URL percent-encoded strings back to readable text. Handles Unicode and encoded special characters. Free and browser-based.',
  },
  {
    id: 'html-encoder',
    name: 'HTML Encoder',
    slug: 'html-encoder',
    category: 'encoding',
    description: 'Escape HTML special characters into safe HTML entities',
    longDescription:
      'Converts HTML special characters (&, <, >, ", \') into their HTML entity equivalents so they can be safely displayed as text on a web page. Essential for preventing XSS and displaying user content safely.',
    icon: '&lt;',
    keywords: ['html', 'encode', 'html encoder', 'escape html', 'html entities', 'html escape', 'xss'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-decoder', 'url-encoder', 'base64-encoder'],
    order: 5,
    seoTitle: 'HTML Encoder — Escape HTML Entities Online',
    seoDescription:
      'Encode HTML special characters into safe HTML entities. Converts &, <, >, ", \' and more. Free and browser-based.',
  },
  {
    id: 'html-decoder',
    name: 'HTML Decoder',
    slug: 'html-decoder',
    category: 'encoding',
    description: 'Decode HTML entities back to readable characters',
    longDescription:
      'Decodes HTML entities (&amp;, &lt;, &gt;, &quot;, &#39;) back to their original characters. Also supports numeric entities (&#65;, &#x41;). Output is always plain text — never rendered as HTML.',
    icon: '&gt;',
    keywords: ['html', 'decode', 'html decoder', 'unescape html', 'html entities', 'decode html entities'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-encoder', 'url-decoder', 'base64-decoder'],
    order: 6,
    seoTitle: 'HTML Decoder — Decode HTML Entities Online',
    seoDescription:
      'Decode HTML entities back to readable text. Supports named and numeric entities. Free and browser-based.',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    slug: 'hash-generator',
    category: 'encoding',
    description: 'Generate MD5, SHA-1, SHA-256 and other hashes',
    icon: '#',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'sha1', 'checksum', 'sha512', 'hmac'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder'],
    order: 7,
    seoTitle: 'Hash Generator',
    seoDescription:
      'Generate cryptographic hashes: MD5, SHA-1, SHA-256, SHA-512. All processing happens locally.',
  },

  // Developer Tools
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    slug: 'html-formatter',
    category: 'developer',
    description: 'Format and beautify HTML markup',
    icon: '</>',
    keywords: ['html', 'format', 'beautify', 'indent', 'markup', 'tidy'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['css-formatter', 'diff-checker'],
    order: 1,
    seoTitle: 'HTML Formatter',
    seoDescription:
      'Format and beautify HTML markup with proper indentation. Free online HTML formatter.',
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    slug: 'css-formatter',
    category: 'developer',
    description: 'Format and beautify CSS stylesheets',
    icon: '#{}',
    keywords: ['css', 'format', 'beautify', 'style', 'stylesheet', 'indent'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-formatter', 'diff-checker'],
    order: 2,
    seoTitle: 'CSS Formatter',
    seoDescription: 'Format and beautify CSS stylesheets online. Free CSS prettifier.',
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    slug: 'diff-checker',
    category: 'developer',
    description: 'Compare two text blocks and highlight differences',
    icon: '±',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes', 'merge', 'patch'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'html-formatter'],
    popular: true,
    order: 3,
    seoTitle: 'Diff Checker',
    seoDescription:
      'Compare two text blocks side by side. Highlight all differences. Free online diff tool.',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'developer-utilities',
    description: 'Generate random UUID v4 values — single or bulk, upper or lower case',
    longDescription:
      'Generates cryptographically random UUID v4 values using crypto.randomUUID(). Generate 1–100 UUIDs at once, toggle uppercase/lowercase output. Entirely browser-side — nothing is sent anywhere.',
    icon: '⊛',
    keywords: ['uuid', 'guid', 'random', 'generate', 'id', 'unique', 'v4', 'uuid generator', 'random id'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['uuid-validator', 'password-generator', 'hash-generator'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'UUID Generator — Generate Random UUIDs Online',
    seoDescription:
      'Generate cryptographically random UUID v4 values online. Single or bulk (1–100), uppercase or lowercase. Free and 100% browser-based.',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    slug: 'jwt-decoder',
    category: 'developer-utilities',
    description: 'Decode and inspect JWT tokens — header, payload, registered claims',
    longDescription:
      'Decodes JWT (JSON Web Token) header and payload. Shows registered claims (exp, iat, nbf, iss, sub, aud) with human-readable timestamps. Decoding does NOT verify the signature — the token is not authenticated. Processing is 100% browser-side.',
    icon: 'JWT',
    keywords: ['jwt', 'json web token', 'decode', 'header', 'payload', 'token', 'bearer', 'jwt decoder', 'decode jwt'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder', 'base64-decoder', 'json-formatter'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'JWT Decoder — Decode JWT Tokens Online',
    seoDescription:
      'Decode JWT header and payload instantly. View registered claims with human-readable dates. Your token never leaves the browser.',
  },
  {
    id: 'uuid-validator',
    name: 'UUID Validator',
    slug: 'uuid-validator',
    category: 'developer-utilities',
    description: 'Validate a UUID string and identify its version',
    longDescription:
      'Checks whether a string is a valid UUID and identifies the UUID version (1–5) from the version nibble. Accepts upper and lower case. Shows a clear error describing what is wrong for invalid input.',
    icon: '✓',
    keywords: ['uuid', 'guid', 'validate', 'validator', 'check', 'version', 'uuid v4', 'uuid validator'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['uuid-generator', 'hash-generator'],
    isNew: true,
    order: 3,
    seoTitle: 'UUID Validator — Validate and Identify UUID Version',
    seoDescription:
      'Validate UUID strings and identify their version (v1–v5). Accepts upper/lowercase. Free and browser-based.',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    slug: 'password-generator',
    category: 'developer-utilities',
    description: 'Generate secure random passwords with custom rules',
    longDescription:
      'Generates cryptographically secure passwords using crypto.getRandomValues(). Choose length (8–128), include uppercase, lowercase, numbers, symbols, and exclude ambiguous characters. Passwords are never stored, logged, or sent anywhere.',
    icon: '🔑',
    keywords: ['password', 'generate', 'random', 'secure', 'strong', 'password generator', 'passphrase', 'credentials'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['uuid-generator', 'hash-generator'],
    popular: true,
    isNew: true,
    order: 4,
    seoTitle: 'Password Generator — Secure Random Passwords Online',
    seoDescription:
      'Generate strong, random passwords using cryptographic randomness. Customise length, character sets, and exclusions. Passwords never leave your browser.',
  },

  // Date & Time
  {
    id: 'unix-timestamp-converter',
    name: 'Unix Timestamp Converter',
    slug: 'unix-timestamp-converter',
    category: 'date-time',
    description: 'Convert a Unix timestamp to UTC, local, and ISO 8601 dates',
    longDescription:
      'Converts Unix timestamps (seconds or milliseconds) to human-readable dates in UTC, your local timezone, and ISO 8601 format. Auto-detects seconds vs milliseconds. All processing is browser-side.',
    icon: '⏱',
    keywords: ['unix', 'timestamp', 'epoch', 'convert', 'date', 'time', 'utc', 'iso 8601', 'unix time', 'epoch converter'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['timestamp-to-date'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Unix Timestamp Converter — Epoch to Date Online',
    seoDescription:
      'Convert Unix/epoch timestamps to UTC, local time, and ISO 8601 format. Auto-detects seconds vs milliseconds. Free and browser-based.',
  },
  {
    id: 'timestamp-to-date',
    name: 'Timestamp to Date',
    slug: 'timestamp-to-date',
    category: 'date-time',
    description: 'Convert any numeric timestamp to a readable date and time',
    longDescription:
      'Converts numeric timestamps in seconds or milliseconds to human-readable dates. Handles past and future dates, negative timestamps (pre-1970), and auto-detects the unit. Shows UTC, local, and ISO 8601 output.',
    icon: '📅',
    keywords: ['timestamp', 'date', 'convert', 'epoch', 'unix', 'milliseconds', 'seconds', 'time', 'date converter'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['unix-timestamp-converter'],
    isNew: true,
    order: 2,
    seoTitle: 'Timestamp to Date Converter — Free Online Tool',
    seoDescription:
      'Convert numeric timestamps (seconds or milliseconds) to human-readable dates. Handles past, future, and negative timestamps. Free and browser-based.',
  },

  // Data & Code
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'data-code',
    description: 'Test and debug regular expressions in real-time',
    icon: '.*',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test', 'debug'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['csv-to-json'],
    popular: true,
    order: 1,
    seoTitle: 'Regex Tester',
    seoDescription:
      'Test regular expressions with real-time matching and highlighting. Free online regex tester.',
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    slug: 'csv-to-json',
    category: 'data-code',
    description: 'Convert CSV data to JSON format',
    icon: '⇒',
    keywords: ['csv', 'json', 'convert', 'transform', 'data', 'spreadsheet', 'excel'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'regex-tester'],
    order: 2,
    seoTitle: 'CSV to JSON Converter',
    seoDescription:
      'Convert CSV files and text to JSON format online. Free and privacy-friendly.',
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    slug: 'markdown-preview',
    category: 'data-code',
    description: 'Preview and render Markdown in real-time',
    icon: 'Md',
    keywords: ['markdown', 'preview', 'render', 'md', 'text', 'html', 'commonmark'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['html-formatter', 'diff-checker'],
    order: 3,
    seoTitle: 'Markdown Preview',
    seoDescription:
      'Live Markdown preview and rendering. Write and see the result instantly — free online tool.',
  },

  // Utilities
  {
    id: 'word-counter',
    name: 'Word Counter',
    slug: 'word-counter',
    category: 'utilities',
    description: 'Count words, characters, lines, and sentences',
    icon: 'W',
    keywords: ['word', 'count', 'character', 'text', 'words', 'lines', 'sentences', 'paragraphs'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['markdown-preview', 'diff-checker'],
    popular: true,
    order: 1,
    seoTitle: 'Word Counter',
    seoDescription:
      'Count words, characters, paragraphs, and more. Free online word counter tool.',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    slug: 'color-picker',
    category: 'utilities',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: '◉',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'picker', 'converter', 'palette', 'rgba'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['css-formatter'],
    order: 2,
    seoTitle: 'Color Picker & Converter',
    seoDescription:
      'Pick colors and convert between HEX, RGB, HSL, and more. Free online color converter.',
  },
];

// ---------------------------------------------------------------------------
// Integrity check — runs once at module init in dev/test
// ---------------------------------------------------------------------------

function assertRegistryIntegrity() {
  if (process.env.NODE_ENV === 'production') return;
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const validCategories = new Set(CATEGORIES.map((c) => c.id));

  for (const tool of TOOLS) {
    if (ids.has(tool.id)) {
      throw new Error(`[registry] Duplicate tool id: "${tool.id}"`);
    }
    if (slugs.has(tool.slug)) {
      throw new Error(`[registry] Duplicate tool slug: "${tool.slug}"`);
    }
    if (!validCategories.has(tool.category)) {
      throw new Error(
        `[registry] Tool "${tool.id}" has unknown category: "${tool.category}"`
      );
    }
    if (!tool.seoTitle) {
      throw new Error(`[registry] Tool "${tool.id}" is missing seoTitle`);
    }
    if (!tool.seoDescription) {
      throw new Error(`[registry] Tool "${tool.id}" is missing seoDescription`);
    }
    ids.add(tool.id);
    slugs.add(tool.slug);
  }
}

assertRegistryIntegrity();

// ---------------------------------------------------------------------------
// Memoized indexes (built once, never rebuilt)
// ---------------------------------------------------------------------------

const byId = new Map<string, ToolDefinition>(TOOLS.map((t) => [t.id, t]));
const bySlug = new Map<string, ToolDefinition>(TOOLS.map((t) => [t.slug, t]));
const byCategory = new Map<ToolCategoryId, ToolDefinition[]>();
const categoryById = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]));
const categoryBySlug = new Map<string, Category>(CATEGORIES.map((c) => [c.slug, c]));

for (const tool of TOOLS) {
  if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
  byCategory.get(tool.category)!.push(tool);
}

// Pre-build lowercase search tokens for O(n) linear scan with fast string ops
const searchIndex = TOOLS.filter((t) => t.enabled).map((t) => ({
  tool: t,
  tokens: [
    t.name,
    t.slug,
    t.description,
    t.category,
    ...(t.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase(),
}));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllTools(): ToolDefinition[] {
  return TOOLS;
}

export function getEnabledTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.enabled);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return byId.get(id);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return bySlug.get(slug);
}

export function getToolsByCategory(category: ToolCategoryId | string): ToolDefinition[] {
  return (byCategory.get(category as ToolCategoryId) ?? []).filter((t) => t.enabled);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.enabled && t.popular);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return getEnabledTools();
  return searchIndex
    .filter(({ tokens }) => tokens.includes(q) || tokens.split(' ').some((tok) => tok.startsWith(q)) || tokens.includes(q))
    .map(({ tool }) => tool);
}

export function getRelatedTools(tool: ToolDefinition, limit = 4): ToolDefinition[] {
  // 1. Use explicit relatedTools list first
  if (tool.relatedTools && tool.relatedTools.length > 0) {
    const explicit = tool.relatedTools
      .map((id) => getToolById(id))
      .filter((t): t is ToolDefinition => !!t && t.enabled && t.id !== tool.id)
      .slice(0, limit);
    if (explicit.length > 0) return explicit;
  }
  // 2. Fall back to same-category tools
  return getToolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id && t.enabled)
    .slice(0, limit);
}

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryById(id: string): Category | undefined {
  return categoryById.get(id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

// ---------------------------------------------------------------------------
// Colour helpers (used by UI components)
// ---------------------------------------------------------------------------

export type ColorKey = 'blue' | 'purple' | 'green' | 'orange' | 'gray';

export const CATEGORY_COLORS: Record<
  ColorKey,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

export function getCategoryColors(color: string) {
  return CATEGORY_COLORS[color as ColorKey] ?? CATEGORY_COLORS.gray;
}
