import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Splits a string into words for case conversion.
// Handles camelCase, PascalCase, snake_case, kebab-case, spaces, punctuation.
function splitWords(text: string): string[] {
  return text
    // Insert space before uppercase letters following lowercase (camelCase / PascalCase)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Replace underscores, hyphens, dots with spaces
    .replace(/[_\-./\\]+/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function toTitleCase(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function toSentenceCase(words: string[]): string {
  if (words.length === 0) return '';
  return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() +
    (words.length > 1 ? ' ' + words.slice(1).map((w) => w.toLowerCase()).join(' ') : '');
}

function toCamelCase(words: string[]): string {
  return words
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toPascalCase(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

type ConversionMode =
  | 'lowercase' | 'uppercase' | 'titlecase' | 'sentencecase'
  | 'camelcase' | 'pascalcase' | 'snakecase' | 'kebabcase' | 'constantcase';

function convertLine(line: string, mode: ConversionMode): string {
  const words = splitWords(line);
  if (words.length === 0) return line; // preserve blank/punctuation-only lines

  switch (mode) {
    case 'lowercase':    return line.toLowerCase();
    case 'uppercase':    return line.toUpperCase();
    case 'titlecase':    return toTitleCase(words);
    case 'sentencecase': return toSentenceCase(words);
    case 'camelcase':    return toCamelCase(words);
    case 'pascalcase':   return toPascalCase(words);
    case 'snakecase':    return words.map((w) => w.toLowerCase()).join('_');
    case 'kebabcase':    return words.map((w) => w.toLowerCase()).join('-');
    case 'constantcase': return words.map((w) => w.toUpperCase()).join('_');
    default:             return line;
  }
}

const MODE_LABELS: Record<string, string> = {
  lowercase:    'lowercase',
  uppercase:    'UPPERCASE',
  titlecase:    'Title Case',
  sentencecase: 'Sentence case',
  camelcase:    'camelCase',
  pascalcase:   'PascalCase',
  snakecase:    'snake_case',
  kebabcase:    'kebab-case',
  constantcase: 'CONSTANT_CASE',
};

export const textCaseConverterProcessor: ToolProcessor = {
  inputLabel: 'Input Text',
  inputPlaceholder: 'Enter text to convert…',
  autoProcess: true,
  exampleInput: 'hello world example text',

  optionControls: [
    {
      key: 'mode',
      type: 'select',
      label: 'Target case',
      defaultValue: 'titlecase',
      options: [
        { value: 'lowercase',    label: 'lowercase' },
        { value: 'uppercase',    label: 'UPPERCASE' },
        { value: 'titlecase',    label: 'Title Case' },
        { value: 'sentencecase', label: 'Sentence case' },
        { value: 'camelcase',    label: 'camelCase' },
        { value: 'pascalcase',   label: 'PascalCase' },
        { value: 'snakecase',    label: 'snake_case' },
        { value: 'kebabcase',    label: 'kebab-case' },
        { value: 'constantcase', label: 'CONSTANT_CASE' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to convert.' };

    const mode = (String(input.options?.['mode'] ?? 'titlecase')) as ConversionMode;
    const lines = raw.split('\n');
    const converted = lines.map((line) => convertLine(line, mode)).join('\n');

    return {
      output: {
        value: converted,
        type: 'text',
        label: `${MODE_LABELS[mode] ?? mode} Output`,
        copyable: true,
        downloadFilename: 'converted.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'target case': MODE_LABELS[mode] ?? mode,
        'input length': raw.length,
        'output length': converted.length,
      },
    };
  },
};
