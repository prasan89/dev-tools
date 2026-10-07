import { Tool, Category } from '@/types/tool';

export const CATEGORIES: Category[] = [
  {
    id: 'json',
    name: 'JSON Tools',
    description: 'Format, validate, transform, and query JSON data',
    icon: '{ }',
    color: 'blue',
  },
  {
    id: 'encoding',
    name: 'Encoding Tools',
    description: 'Base64, URL encode/decode, hash, and cipher utilities',
    icon: '⇄',
    color: 'purple',
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Code formatters, linters, diff tools, and generators',
    icon: '</> ',
    color: 'green',
  },
  {
    id: 'data-code',
    name: 'Data & Code',
    description: 'CSV, regex, SQL, and data transformation tools',
    icon: '⊞',
    color: 'orange',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'Text tools, unit converters, color pickers, and more',
    icon: '⚙',
    color: 'gray',
  },
];

export const TOOLS: Tool[] = [
  {
    name: 'JSON Formatter',
    slug: 'json-formatter',
    category: 'json',
    description: 'Format and beautify JSON with syntax highlighting',
    longDescription:
      'Paste your JSON data and get it formatted with proper indentation, syntax highlighting, and error detection. Supports minification and validation.',
    icon: '{ }',
    keywords: ['json', 'format', 'beautify', 'pretty print', 'indent'],
    relatedTools: ['json-validator', 'json-minifier'],
    popular: true,
    seo: {
      title: 'JSON Formatter & Beautifier — DevToolsHub',
      description:
        'Free online JSON formatter. Format, beautify, and validate JSON with syntax highlighting.',
    },
  },
  {
    name: 'JSON Validator',
    slug: 'json-validator',
    category: 'json',
    description: 'Validate JSON syntax and check for errors',
    icon: '✓',
    keywords: ['json', 'validate', 'lint', 'check', 'syntax'],
    relatedTools: ['json-formatter', 'json-minifier'],
    popular: true,
    seo: {
      title: 'JSON Validator — DevToolsHub',
      description: 'Validate your JSON syntax instantly. Free and privacy-friendly.',
    },
  },
  {
    name: 'JSON Minifier',
    slug: 'json-minifier',
    category: 'json',
    description: 'Minify JSON to reduce file size',
    icon: '⊞',
    keywords: ['json', 'minify', 'compress', 'shrink'],
    relatedTools: ['json-formatter'],
    seo: {
      title: 'JSON Minifier — DevToolsHub',
      description: 'Minify and compress JSON data. Free online tool.',
    },
  },
  {
    name: 'Base64 Encoder/Decoder',
    slug: 'base64',
    category: 'encoding',
    description: 'Encode or decode Base64 strings instantly',
    icon: '⇄',
    keywords: ['base64', 'encode', 'decode', 'binary', 'text'],
    popular: true,
    seo: {
      title: 'Base64 Encoder/Decoder — DevToolsHub',
      description: 'Encode and decode Base64 strings online. Free and instant.',
    },
  },
  {
    name: 'URL Encoder/Decoder',
    slug: 'url-encode',
    category: 'encoding',
    description: 'Encode or decode URL/percent-encoded strings',
    icon: '🔗',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri'],
    popular: true,
    seo: {
      title: 'URL Encoder/Decoder — DevToolsHub',
      description: 'Encode and decode URL strings. Percent-encoding support.',
    },
  },
  {
    name: 'Hash Generator',
    slug: 'hash-generator',
    category: 'encoding',
    description: 'Generate MD5, SHA-1, SHA-256 and other hashes',
    icon: '#',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'sha1', 'checksum'],
    seo: {
      title: 'Hash Generator — DevToolsHub',
      description: 'Generate cryptographic hashes: MD5, SHA-1, SHA-256, SHA-512.',
    },
  },
  {
    name: 'HTML Formatter',
    slug: 'html-formatter',
    category: 'developer',
    description: 'Format and beautify HTML markup',
    icon: '</>',
    keywords: ['html', 'format', 'beautify', 'indent', 'markup'],
    seo: {
      title: 'HTML Formatter — DevToolsHub',
      description: 'Format and beautify HTML markup with proper indentation.',
    },
  },
  {
    name: 'CSS Formatter',
    slug: 'css-formatter',
    category: 'developer',
    description: 'Format and beautify CSS stylesheets',
    icon: '#{}',
    keywords: ['css', 'format', 'beautify', 'style'],
    seo: {
      title: 'CSS Formatter — DevToolsHub',
      description: 'Format and beautify CSS stylesheets online.',
    },
  },
  {
    name: 'Diff Checker',
    slug: 'diff-checker',
    category: 'developer',
    description: 'Compare two text blocks and highlight differences',
    icon: '±',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes'],
    popular: true,
    seo: {
      title: 'Diff Checker — DevToolsHub',
      description: 'Compare two text blocks side by side. See all differences.',
    },
  },
  {
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'developer',
    description: 'Generate random UUIDs (v4) instantly',
    icon: '⊛',
    keywords: ['uuid', 'guid', 'random', 'generate', 'id'],
    popular: true,
    seo: {
      title: 'UUID Generator — DevToolsHub',
      description: 'Generate random UUID v4 strings. Bulk generation supported.',
    },
  },
  {
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'data-code',
    description: 'Test and debug regular expressions in real-time',
    icon: '.*',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match'],
    popular: true,
    seo: {
      title: 'Regex Tester — DevToolsHub',
      description: 'Test regular expressions with real-time matching and highlighting.',
    },
  },
  {
    name: 'CSV to JSON',
    slug: 'csv-to-json',
    category: 'data-code',
    description: 'Convert CSV data to JSON format',
    icon: '⇒',
    keywords: ['csv', 'json', 'convert', 'transform', 'data'],
    seo: {
      title: 'CSV to JSON Converter — DevToolsHub',
      description: 'Convert CSV files and text to JSON format online.',
    },
  },
  {
    name: 'Markdown Preview',
    slug: 'markdown-preview',
    category: 'data-code',
    description: 'Preview and render Markdown in real-time',
    icon: 'Md',
    keywords: ['markdown', 'preview', 'render', 'md', 'text'],
    seo: {
      title: 'Markdown Preview — DevToolsHub',
      description: 'Live Markdown preview and rendering. Write and see the result.',
    },
  },
  {
    name: 'Word Counter',
    slug: 'word-counter',
    category: 'utilities',
    description: 'Count words, characters, lines, and sentences',
    icon: 'W',
    keywords: ['word', 'count', 'character', 'text', 'words'],
    popular: true,
    seo: {
      title: 'Word Counter — DevToolsHub',
      description: 'Count words, characters, paragraphs, and more.',
    },
  },
  {
    name: 'Color Picker',
    slug: 'color-picker',
    category: 'utilities',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: '◉',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'picker', 'converter'],
    seo: {
      title: 'Color Picker & Converter — DevToolsHub',
      description: 'Pick colors and convert between HEX, RGB, HSL, and more.',
    },
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getPopularTools(): Tool[] {
  return TOOLS.filter((t) => t.popular);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}
