import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

type InputFormat =
  | 'Auto-detect'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY/MM/DD'
  | 'Unix timestamp';

type OutputFormat =
  | 'All formats'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY/MM/DD'
  | 'Long date (e.g. 7 October 2026)'
  | 'Short date (e.g. Oct 7, 2026)'
  | 'ISO 8601'
  | 'DD MMM YYYY';

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}

/** Try to parse with a specific format. Returns null if format doesn't match. */
function parseWithFormat(value: string, format: InputFormat): ParsedDate | ParsedDate[] | null {
  const v = value.trim();

  if (format === 'Unix timestamp') {
    if (!/^-?\d+$/.test(v)) return null;
    const ts = parseInt(v, 10);
    const d = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    if (isNaN(d.getTime())) return null;
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }

  // YYYY-MM-DD
  if (format === 'YYYY-MM-DD') {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const [, y, mo, d] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  // DD-MM-YYYY
  if (format === 'DD-MM-YYYY') {
    const m = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!m) return null;
    const [, d, mo, y] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  // MM-DD-YYYY
  if (format === 'MM-DD-YYYY') {
    const m = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!m) return null;
    const [, mo, d, y] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  // DD/MM/YYYY
  if (format === 'DD/MM/YYYY') {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const [, d, mo, y] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  // MM/DD/YYYY
  if (format === 'MM/DD/YYYY') {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const [, mo, d, y] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  // YYYY/MM/DD
  if (format === 'YYYY/MM/DD') {
    const m = v.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!m) return null;
    const [, y, mo, d] = m.map(Number);
    if (!isValidDate(y, mo, d)) return null;
    return { year: y, month: mo, day: d };
  }

  return null;
}

/**
 * Auto-detect parsing. Returns a single ParsedDate or an array of two if ambiguous.
 */
function autoDetect(value: string): ParsedDate | ParsedDate[] {
  const v = value.trim();

  // Unix timestamp: all digits, length suggests epoch
  if (/^-?\d{8,13}$/.test(v)) {
    const ts = parseInt(v, 10);
    const d = ts > 1e10 ? new Date(ts) : new Date(ts * 1000);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
      };
    }
  }

  // YYYY-MM-DD (unambiguous)
  const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, mo, d] = isoMatch.map(Number);
    if (isValidDate(y, mo, d)) return { year: y, month: mo, day: d };
  }

  // YYYY/MM/DD (unambiguous)
  const ymdSlash = v.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (ymdSlash) {
    const [, y, mo, d] = ymdSlash.map(Number);
    if (isValidDate(y, mo, d)) return { year: y, month: mo, day: d };
  }

  // DD-MM-YYYY or MM-DD-YYYY with dash (potentially ambiguous)
  const dashMatch = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, a, b, y] = dashMatch.map(Number);
    const ddmm = isValidDate(y, b, a); // a=DD, b=MM
    const mmdd = isValidDate(y, a, b); // a=MM, b=DD
    if (ddmm && mmdd && a !== b) {
      // Ambiguous: return both interpretations
      return [
        { year: y, month: b, day: a }, // DD-MM-YYYY interpretation
        { year: y, month: a, day: b }, // MM-DD-YYYY interpretation
      ];
    }
    if (ddmm) return { year: y, month: b, day: a };
    if (mmdd) return { year: y, month: a, day: b };
  }

  // DD/MM/YYYY or MM/DD/YYYY (potentially ambiguous)
  const slashMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch.map(Number);
    const ddmm = isValidDate(y, b, a); // a=DD, b=MM
    const mmdd = isValidDate(y, a, b); // a=MM, b=DD
    if (ddmm && mmdd && a !== b) {
      // Ambiguous: return both interpretations
      return [
        { year: y, month: b, day: a }, // DD/MM/YYYY interpretation
        { year: y, month: a, day: b }, // MM/DD/YYYY interpretation
      ];
    }
    if (ddmm) return { year: y, month: b, day: a };
    if (mmdd) return { year: y, month: a, day: b };
  }

  throw new Error('Could not auto-detect date format. Please specify the input format.');
}

function formatDate(pd: ParsedDate, format: OutputFormat): string {
  const { year, month, day } = pd;
  const y = year.toString();
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  const m1 = month.toString();
  const d1 = day.toString();

  switch (format) {
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
    case 'DD-MM-YYYY': return `${d}-${m}-${y}`;
    case 'MM-DD-YYYY': return `${m}-${d}-${y}`;
    case 'DD/MM/YYYY': return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY': return `${m}/${d}/${y}`;
    case 'YYYY/MM/DD': return `${y}/${m}/${d}`;
    case 'Long date (e.g. 7 October 2026)': return `${day} ${MONTH_NAMES_LONG[month - 1]} ${year}`;
    case 'Short date (e.g. Oct 7, 2026)': return `${MONTH_NAMES_SHORT[month - 1]} ${d1}, ${year}`;
    case 'DD MMM YYYY': return `${d1} ${MONTH_NAMES_SHORT[month - 1]} ${year}`;
    case 'ISO 8601': {
      const dateUTC = new Date(Date.UTC(year, month - 1, day));
      return dateUTC.toISOString().split('T')[0];
    }
    default: return `${y}-${m}-${d}`;
  }
}

const ALL_OUTPUT_FORMATS: OutputFormat[] = [
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'MM-DD-YYYY',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
  'Long date (e.g. 7 October 2026)',
  'Short date (e.g. Oct 7, 2026)',
  'DD MMM YYYY',
  'ISO 8601',
];

function buildOutputForDate(pd: ParsedDate, outputFormat: OutputFormat): string {
  if (outputFormat === 'All formats') {
    const lines: string[] = [];
    for (const fmt of ALL_OUTPUT_FORMATS) {
      const fmtName = fmt.padEnd(35);
      lines.push(`${fmtName} ${formatDate(pd, fmt)}`);
    }
    return lines.join('\n');
  }
  return `${outputFormat.padEnd(35)} ${formatDate(pd, outputFormat)}`;
}

export const dateFormatConverterProcessor: ToolProcessor = {
  inputLabel: 'Date to convert',
  inputPlaceholder: '2026-10-07',
  autoProcess: true,
  exampleInput: '2026-10-07',

  optionControls: [
    {
      key: 'inputFormat',
      type: 'select',
      label: 'Input format',
      defaultValue: 'Auto-detect',
      options: [
        { value: 'Auto-detect', label: 'Auto-detect' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
        { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
        { value: 'Unix timestamp', label: 'Unix timestamp' },
      ],
    },
    {
      key: 'outputFormat',
      type: 'select',
      label: 'Output format',
      defaultValue: 'All formats',
      options: [
        { value: 'All formats', label: 'All formats' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
        { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
        { value: 'Long date (e.g. 7 October 2026)', label: 'Long date (e.g. 7 October 2026)' },
        { value: 'Short date (e.g. Oct 7, 2026)', label: 'Short date (e.g. Oct 7, 2026)' },
        { value: 'ISO 8601', label: 'ISO 8601' },
        { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date to convert.' };

    const inputFormat = ((input.options?.inputFormat as string) || 'Auto-detect') as InputFormat;
    const outputFormat = ((input.options?.outputFormat as string) || 'All formats') as OutputFormat;

    let parsed: ParsedDate | ParsedDate[];

    if (inputFormat === 'Auto-detect') {
      try {
        parsed = autoDetect(raw);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { error: msg };
      }
    } else {
      const result = parseWithFormat(raw, inputFormat);
      if (result === null) {
        return { error: `Could not parse "${raw}" as ${inputFormat}. Check the format and try again.` };
      }
      parsed = result;
    }

    // Handle ambiguous result (array of two)
    if (Array.isArray(parsed)) {
      const [interp1, interp2] = parsed;
      const fmt1Label = 'DD/MM/YYYY interpretation';
      const fmt2Label = 'MM/DD/YYYY interpretation';

      const lines: string[] = [
        'Ambiguous date — showing both interpretations:',
        '',
        `${fmt1Label}: ${MONTH_NAMES_LONG[interp1.month - 1]} ${interp1.day}, ${interp1.year}`,
        buildOutputForDate(interp1, outputFormat),
        '',
        `${fmt2Label}: ${MONTH_NAMES_LONG[interp2.month - 1]} ${interp2.day}, ${interp2.year}`,
        buildOutputForDate(interp2, outputFormat),
        '',
        'Tip: Use the "Input format" selector to disambiguate.',
      ];

      return {
        output: {
          value: lines.join('\n'),
          type: 'text',
          label: 'Ambiguous Date — Both Interpretations',
          copyable: true,
        },
      };
    }

    // Single unambiguous result
    const pd = parsed as ParsedDate;
    const outputLines = buildOutputForDate(pd, outputFormat);

    return {
      output: {
        value: outputLines,
        type: 'text',
        label: outputFormat === 'All formats' ? 'All Date Formats' : `${inputFormat} → ${outputFormat}`,
        copyable: true,
      },
      meta: {
        year: pd.year,
        month: pd.month,
        day: pd.day,
        'input format': inputFormat,
        'output format': outputFormat,
      },
    };
  },
};
