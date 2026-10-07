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
  {
    id: 'regex',
    slug: 'regex',
    name: 'Regex',
    description: 'Test and debug regular expressions in real-time',
    icon: '.*',
    color: 'purple',
  },
  {
    id: 'sql',
    slug: 'sql',
    name: 'SQL',
    description: 'Format, beautify, and inspect SQL queries',
    icon: '⊞',
    color: 'blue',
  },
  {
    id: 'xml',
    slug: 'xml',
    name: 'XML',
    description: 'Format, validate, and transform XML documents',
    icon: '</>',
    color: 'green',
  },
  {
    id: 'yaml',
    slug: 'yaml',
    name: 'YAML',
    description: 'Format, validate, and convert YAML documents',
    icon: '---',
    color: 'orange',
  },
  {
    id: 'data',
    slug: 'data',
    name: 'Data Tools',
    description: 'CSV formatters, validators, and data transformation utilities',
    icon: '⊞',
    color: 'teal',
  },
  {
    id: 'text',
    slug: 'text',
    name: 'Text Tools',
    description: 'Case converters, line sorters, duplicate removers, and text utilities',
    icon: 'Aa',
    color: 'indigo',
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
    relatedTools: ['json-validator', 'json-minifier', 'json-diff', 'json-to-csv', 'json-to-yaml', 'json-to-xml'],
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

  // Regex
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'regex',
    description: 'Test and debug regular expressions with match highlighting and capture groups',
    longDescription:
      'Test JavaScript regular expressions interactively. Enter a pattern, choose flags (g, i, m, s, u, y), and see all matches, capture groups, named groups, and match positions — all browser-side, nothing sent to a server.',
    icon: '.*',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test', 'debug', 'regex tester', 'online regex', 'regular expression tester', 'regex checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'url-encoder', 'html-encoder'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Regex Tester — Test Regular Expressions Online',
    seoDescription:
      'Test and debug regular expressions in your browser. See all matches, capture groups, and named groups with position info. Flags: g, i, m, s, u, y. Free and 100% browser-based.',
  },

  // SQL
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    slug: 'sql-formatter',
    category: 'sql',
    description: 'Format and beautify SQL queries for readability',
    longDescription:
      'Paste any SQL query and get it formatted with consistent indentation and keyword casing. Supports SELECT, INSERT, UPDATE, DELETE, JOINs, subqueries, CASE, and more. Supports MySQL, PostgreSQL, SQL Server, SQLite, and generic SQL. Never executes queries — formatting is text-only, browser-side.',
    icon: '⊞',
    keywords: ['sql', 'format', 'beautify', 'sql formatter', 'sql pretty printer', 'format sql', 'sql beautifier', 'mysql', 'postgresql'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'xml-formatter', 'yaml-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'SQL Formatter — Beautify SQL Queries Online',
    seoDescription:
      'Format and beautify SQL queries online. Supports MySQL, PostgreSQL, SQL Server, SQLite. No query execution — browser-only text formatting. Free.',
  },

  // XML
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    slug: 'xml-formatter',
    category: 'xml',
    description: 'Format, pretty-print, and validate XML documents',
    longDescription:
      'Paste XML and get it beautifully formatted with proper indentation. Validates structure and reports parsing errors with line numbers. Preserves declarations, comments, CDATA, namespaces, and self-closing tags. Processes entirely in your browser.',
    icon: '</>',
    keywords: ['xml', 'format', 'beautify', 'pretty print', 'xml formatter', 'xml beautifier', 'format xml', 'xml validator', 'pretty print xml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'yaml-formatter', 'sql-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'XML Formatter — Pretty Print and Validate XML Online',
    seoDescription:
      'Format and validate XML documents online. Detects errors with line info, preserves comments and CDATA. Free and browser-based.',
  },

  // YAML
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    slug: 'yaml-formatter',
    category: 'yaml',
    description: 'Format and beautify YAML documents',
    longDescription:
      'Paste YAML and get it reformatted with consistent indentation. Validates syntax, reports errors with line/column info, and handles mappings, sequences, booleans, nulls, numbers, and multiline strings. Parsed locally — your data never leaves the browser.',
    icon: '---',
    keywords: ['yaml', 'format', 'beautify', 'yaml formatter', 'yaml beautifier', 'format yaml', 'yaml pretty printer', 'yaml validator', 'yaml linter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-to-json', 'json-formatter', 'xml-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'YAML Formatter — Beautify and Validate YAML Online',
    seoDescription:
      'Format and validate YAML documents online. Reports errors with line/column info. Handles all standard YAML types. Free and browser-based.',
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    slug: 'yaml-to-json',
    category: 'yaml',
    description: 'Convert YAML to JSON — safely parsed, browser-only',
    longDescription:
      'Convert YAML documents to formatted JSON. Handles nested mappings, sequences, booleans, numbers, null, Unicode, and multiline strings. Uses safe YAML parsing — no arbitrary code execution. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['yaml', 'json', 'convert', 'yaml to json', 'yaml converter', 'convert yaml to json', 'yaml json converter', 'yaml parser'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'json-formatter', 'xml-formatter'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'YAML to JSON Converter — Convert YAML Online',
    seoDescription:
      'Convert YAML to JSON online. Safely parses YAML using js-yaml — no code execution. Handles nested structures, types, and Unicode. Free and browser-based.',
  },

  // JSON Conversion Tools
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    slug: 'json-to-csv',
    category: 'json',
    description: 'Convert a JSON array of objects to CSV — handles nested values, quotes, and Unicode',
    longDescription:
      'Convert a JSON array of objects into a properly-escaped CSV file. Headers are derived from object keys. Nested objects and arrays are serialized as JSON strings. Supports comma, semicolon, tab, and pipe delimiters. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'csv', 'convert', 'json to csv', 'export csv', 'spreadsheet', 'json converter', 'csv exporter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-to-json', 'json-formatter', 'json-to-yaml', 'json-to-xml'],
    popular: false,
    isNew: true,
    order: 5,
    seoTitle: 'JSON to CSV Converter — Free Online Tool',
    seoDescription:
      'Convert JSON arrays to CSV online. Handles nested objects, Unicode, quoted commas, and missing fields. Supports comma, semicolon, tab, and pipe delimiters. Free and browser-only.',
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    slug: 'csv-to-json',
    category: 'json',
    description: 'Convert CSV data to a JSON array — handles quoted fields, multiline values, and Unicode',
    longDescription:
      'Parse CSV text into a JSON array of objects (or arrays when no headers). Handles RFC 4180 quoted fields, embedded commas and newlines, and all common delimiters. Processing is 100% browser-side.',
    icon: '⇐',
    keywords: ['csv', 'json', 'convert', 'csv to json', 'csv parser', 'import json', 'spreadsheet', 'csv converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-csv', 'json-formatter', 'json-to-yaml'],
    popular: false,
    isNew: true,
    order: 6,
    seoTitle: 'CSV to JSON Converter — Free Online Tool',
    seoDescription:
      'Convert CSV data to JSON online. Handles quoted fields, embedded commas, multiline values, and all common delimiters. Free and browser-only.',
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    slug: 'json-to-yaml',
    category: 'json',
    description: 'Convert JSON to YAML — browser-side, no code execution',
    longDescription:
      'Convert any JSON object or array to YAML. Handles nested structures, booleans, numbers, null, arrays, and Unicode strings. Uses the same safe YAML library as the YAML Formatter. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'yaml', 'convert', 'json to yaml', 'json converter', 'yaml converter', 'convert json to yaml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-to-json', 'yaml-formatter', 'json-formatter', 'json-to-csv'],
    popular: false,
    isNew: true,
    order: 7,
    seoTitle: 'JSON to YAML Converter — Free Online Tool',
    seoDescription:
      'Convert JSON to YAML online. Handles all JSON types including nested objects, arrays, booleans, and null. Uses safe YAML serialization. Free and browser-only.',
  },
  {
    id: 'json-to-xml',
    name: 'JSON to XML',
    slug: 'json-to-xml',
    category: 'json',
    description: 'Convert JSON to well-formed XML — safe escaping, configurable root element',
    longDescription:
      'Convert JSON to valid, well-formed XML. Objects become nested elements, arrays become repeated sibling elements, primitives become text nodes, and null becomes an xsi:nil element. XML names are sanitized automatically. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'xml', 'convert', 'json to xml', 'json converter', 'xml converter', 'convert json to xml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'json-formatter', 'json-to-yaml', 'json-to-csv'],
    popular: false,
    isNew: true,
    order: 8,
    seoTitle: 'JSON to XML Converter — Free Online Tool',
    seoDescription:
      'Convert JSON to well-formed XML online. Handles nested objects, arrays, booleans, null, and Unicode. Configurable root element with safe XML escaping. Free and browser-only.',
  },

  // Data & Code
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

  // JSON Utilities
  {
    id: 'jsonpath-tester',
    name: 'JSONPath Tester',
    slug: 'jsonpath-tester',
    category: 'json',
    description: 'Test and evaluate JSONPath expressions against JSON data',
    longDescription:
      'Evaluate JSONPath expressions against JSON input and see matched values. Supports dot notation, bracket notation, wildcards (*), recursive descent (..), array slicing, and filters. Uses the JSONPath-Plus library.',
    icon: '$..',
    keywords: ['jsonpath', 'json path', 'query', 'extract', 'filter', 'json query', 'jsonpath expression', 'json selector'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-schema-validator', 'json-sorter'],
    popular: true,
    isNew: true,
    order: 7,
    seoTitle: 'JSONPath Tester — Test JSONPath Expressions Online',
    seoDescription:
      'Test and evaluate JSONPath expressions against JSON data. Supports wildcards, recursive descent, filters, and array slices. Free and browser-based.',
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    slug: 'json-schema-validator',
    category: 'json',
    description: 'Validate JSON against a JSON Schema (draft-07)',
    longDescription:
      'Validate JSON data against a JSON Schema. Supports JSON Schema draft-07 including required properties, types, arrays, enums, string patterns, numeric constraints, nested objects, and anyOf/oneOf/allOf combiners. Uses the Ajv library.',
    icon: '✓{}',
    keywords: ['json schema', 'validate', 'ajv', 'draft-07', 'schema', 'validation', 'json validator', 'json schema validator'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'jsonpath-tester'],
    popular: true,
    isNew: true,
    order: 8,
    seoTitle: 'JSON Schema Validator — Validate JSON Against a Schema',
    seoDescription:
      'Validate JSON data against JSON Schema (draft-07). Detailed error messages with paths. Free, browser-based, uses Ajv.',
  },
  {
    id: 'json-escape',
    name: 'JSON Escape / Unescape',
    slug: 'json-escape',
    category: 'json',
    description: 'Escape or unescape JSON strings — quotes, backslashes, newlines, and Unicode',
    longDescription:
      'Escape a raw string so it is safe to embed inside a JSON string value, or unescape a JSON-encoded string back to its original form. Handles backslashes, double quotes, newlines (\\n), tabs (\\t), carriage returns (\\r), and Unicode escapes (\\uXXXX).',
    icon: '"\\n"',
    keywords: ['json escape', 'unescape', 'string escape', 'json string', 'backslash', 'newline', 'unicode escape', 'json encode'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'url-encoder', 'html-encoder'],
    isNew: true,
    order: 9,
    seoTitle: 'JSON Escape / Unescape — Escape JSON Strings Online',
    seoDescription:
      'Escape or unescape JSON strings. Handles quotes, backslashes, newlines, tabs, and Unicode escapes. Free, browser-based.',
  },
  {
    id: 'json-sorter',
    name: 'JSON Sorter',
    slug: 'json-sorter',
    category: 'json',
    description: 'Sort JSON object keys alphabetically, recursively',
    longDescription:
      'Sort the keys of a JSON object alphabetically. Recursive mode sorts keys at every nesting level. Array order is never modified. Configurable ascending or descending key order.',
    icon: 'A→Z',
    keywords: ['json sort', 'sort keys', 'alphabetical', 'json organizer', 'json order', 'json key sort'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-diff', 'jsonpath-tester'],
    isNew: true,
    order: 10,
    seoTitle: 'JSON Sorter — Sort JSON Object Keys Alphabetically',
    seoDescription:
      'Sort JSON object keys alphabetically. Recursive sorting for nested objects. Preserves array order. Free and browser-based.',
  },

  // Data Tools (CSV)
  {
    id: 'csv-formatter',
    name: 'CSV Formatter',
    slug: 'csv-formatter',
    category: 'data',
    description: 'Format and normalize CSV files — headers, quoting, delimiters',
    longDescription:
      'Parse and reformat CSV data consistently. Handles quoted fields, commas inside fields, multiline values, and Unicode. Configurable delimiter. Outputs clean, consistently quoted CSV.',
    icon: ',_,',
    keywords: ['csv', 'format', 'formatter', 'comma', 'delimiter', 'tsv', 'normalize', 'csv formatter', 'csv beautifier'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-to-json', 'json-to-csv', 'csv-validator'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'CSV Formatter — Format & Normalize CSV Online',
    seoDescription:
      'Format and normalize CSV files. Handles quoted fields, multiline values, and custom delimiters. Free online CSV formatter.',
  },
  {
    id: 'csv-validator',
    name: 'CSV Validator',
    slug: 'csv-validator',
    category: 'data',
    description: 'Validate CSV for structural errors — mismatched columns, broken quotes',
    longDescription:
      'Validates CSV structure and reports errors with row and column context. Detects mismatched column counts, broken quotes, malformed multiline fields, and empty inputs. Reports errors like "Row 12: expected 5 columns but found 6."',
    icon: 'CSV✓',
    keywords: ['csv', 'validate', 'validator', 'lint', 'check', 'csv error', 'csv parser', 'csv checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-formatter', 'csv-to-json', 'json-to-csv'],
    isNew: true,
    order: 2,
    seoTitle: 'CSV Validator — Validate and Check CSV Files Online',
    seoDescription:
      'Validate CSV files for errors: mismatched columns, broken quotes, malformed rows. Row-level error reporting. Free, browser-based.',
  },

  // XML Utilities
  {
    id: 'xml-validator',
    name: 'XML Validator',
    slug: 'xml-validator',
    category: 'xml',
    description: 'Validate XML for syntax errors — malformed tags, mismatched elements',
    longDescription:
      'Validates XML using the browser DOMParser. Detects malformed tags, mismatched closing tags, invalid nesting, and declaration errors. Reports the error with context from the browser XML parser.',
    icon: 'XML✓',
    keywords: ['xml', 'validate', 'validator', 'lint', 'check', 'xml error', 'xml syntax', 'xml checker', 'well-formed'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'xml-minifier', 'xml-to-json', 'xml-escape'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'XML Validator — Validate XML Syntax Online',
    seoDescription:
      'Validate XML syntax and detect errors. Checks for malformed tags, mismatched elements, and invalid nesting. Free, browser-based.',
  },
  {
    id: 'xml-minifier',
    name: 'XML Minifier',
    slug: 'xml-minifier',
    category: 'xml',
    description: 'Remove whitespace from XML while preserving document meaning',
    longDescription:
      'Minifies XML by removing unnecessary whitespace between elements while preserving meaningful text content, CDATA sections, and document structure. Configurable comment preservation.',
    icon: 'XML↓',
    keywords: ['xml', 'minify', 'minifier', 'compress', 'whitespace', 'optimize', 'xml compress'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'xml-validator', 'xml-to-json'],
    isNew: true,
    order: 3,
    seoTitle: 'XML Minifier — Minify XML Online',
    seoDescription:
      'Minify XML by removing unnecessary whitespace. Preserves meaningful text nodes, CDATA, and document structure. Free online XML minifier.',
  },
  {
    id: 'xml-to-json',
    name: 'XML → JSON',
    slug: 'xml-to-json',
    category: 'xml',
    description: 'Convert XML documents to JSON — elements, attributes, text nodes',
    longDescription:
      'Converts XML to JSON using a structured mapping: elements become objects, attributes are prefixed with @, text content uses a #text key, repeated sibling elements become arrays. Handles namespaces, CDATA, and nested structures.',
    icon: 'XML→{}',
    keywords: ['xml to json', 'convert', 'xml json', 'xml2json', 'transform', 'parse xml', 'xml converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-xml', 'xml-formatter', 'xml-validator', 'json-formatter'],
    popular: true,
    isNew: true,
    order: 4,
    seoTitle: 'XML to JSON Converter — Convert XML to JSON Online',
    seoDescription:
      'Convert XML documents to JSON. Handles elements, attributes, nested structures, and repeated elements. Free, browser-based XML to JSON converter.',
  },
  {
    id: 'xml-escape',
    name: 'XML Escape / Unescape',
    slug: 'xml-escape',
    category: 'xml',
    description: 'Escape or unescape XML special characters — &amp; &lt; &gt; &quot;',
    longDescription:
      'Escape plain text for safe embedding in XML content or attributes, or unescape XML entity references back to raw characters. Handles the 5 predefined XML entities: &amp; &lt; &gt; &quot; &apos;.',
    icon: '&amp;',
    keywords: ['xml escape', 'unescape', 'entities', 'ampersand', 'html entities', 'xml encoding', 'escape xml', 'special characters'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'html-encoder', 'html-decoder', 'json-escape'],
    isNew: true,
    order: 5,
    seoTitle: 'XML Escape / Unescape — Escape XML Special Characters',
    seoDescription:
      'Escape or unescape XML special characters. Handles &amp; &lt; &gt; &quot; &apos; entities. Free online XML escaper.',
  },

  // YAML Utilities
  {
    id: 'yaml-validator',
    name: 'YAML Validator',
    slug: 'yaml-validator',
    category: 'yaml',
    description: 'Validate YAML syntax and detect parse errors',
    longDescription:
      'Validates YAML syntax using js-yaml. Reports syntax errors with line and column context. Supports YAML 1.2 including nested mappings, sequences, anchors, aliases, and multiline scalars.',
    icon: 'YAML✓',
    keywords: ['yaml', 'validate', 'validator', 'lint', 'check', 'yaml syntax', 'yaml error', 'yaml checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'yaml-to-json', 'yaml-minifier', 'json-validator'],
    popular: true,
    isNew: true,
    order: 3,
    seoTitle: 'YAML Validator — Validate YAML Syntax Online',
    seoDescription:
      'Validate YAML syntax and detect errors. Supports YAML 1.2, nested structures, anchors, and aliases. Free, browser-based.',
  },
  {
    id: 'yaml-minifier',
    name: 'YAML Minifier',
    slug: 'yaml-minifier',
    category: 'yaml',
    description: 'Minify YAML — produce compact single-line representation',
    longDescription:
      'Parses YAML and serializes it in the most compact valid YAML format using flow style. Preserves all data types including strings, numbers, booleans, null, arrays, and nested mappings.',
    icon: 'YAML↓',
    keywords: ['yaml', 'minify', 'minifier', 'compact', 'flow', 'yaml compress', 'yaml optimize'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'yaml-validator', 'yaml-to-json'],
    isNew: true,
    order: 4,
    seoTitle: 'YAML Minifier — Minify YAML Online',
    seoDescription:
      'Minify YAML to compact flow style. Preserves all data types and structure. Free online YAML minifier.',
  },

  // Text Tools
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    slug: 'text-case-converter',
    category: 'text',
    description: 'Convert text case — camelCase, snake_case, kebab-case, UPPER, Title, and more',
    longDescription:
      'Convert between 9 text case formats: lowercase, UPPERCASE, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Handles Unicode, multiple spaces, and punctuation.',
    icon: 'Aa',
    keywords: ['case converter', 'camelcase', 'snake case', 'kebab case', 'pascal case', 'title case', 'uppercase', 'lowercase', 'text converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['word-counter', 'remove-duplicate-lines', 'sort-lines'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Text Case Converter — camelCase, snake_case, kebab-case & More',
    seoDescription:
      'Convert text between camelCase, PascalCase, snake_case, kebab-case, UPPER, lower, Title, Sentence, and CONSTANT_CASE. Free online case converter.',
  },
  {
    id: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines',
    slug: 'remove-duplicate-lines',
    category: 'text',
    description: 'Remove duplicate lines from text, keeping only the first occurrence',
    longDescription:
      'Removes duplicate lines from any text input. Keeps the first occurrence, optionally case-insensitive. Preserves original line order. Reports how many duplicates were removed.',
    icon: '≡×',
    keywords: ['duplicate lines', 'remove duplicates', 'unique lines', 'deduplicate', 'text cleaner', 'line deduplication'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['sort-lines', 'text-case-converter', 'word-counter'],
    isNew: true,
    order: 2,
    seoTitle: 'Remove Duplicate Lines — Deduplicate Text Online',
    seoDescription:
      'Remove duplicate lines from text, keeping first occurrences. Optional case-insensitive mode. Free online duplicate line remover.',
  },
  {
    id: 'sort-lines',
    name: 'Sort Lines',
    slug: 'sort-lines',
    category: 'text',
    description: 'Sort lines alphabetically or numerically, ascending or descending',
    longDescription:
      'Sort lines of text alphabetically or numerically, ascending or descending. Optional case-insensitive mode and unique-only filter. Preserves blank lines or removes them as configured.',
    icon: 'A↕Z',
    keywords: ['sort lines', 'alphabetical sort', 'numeric sort', 'line sort', 'text sort', 'arrange lines'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['remove-duplicate-lines', 'text-case-converter', 'word-counter'],
    isNew: true,
    order: 3,
    seoTitle: 'Sort Lines — Sort Text Lines Online',
    seoDescription:
      'Sort text lines alphabetically or numerically, ascending or descending. Case-insensitive and unique-only options. Free online line sorter.',
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
