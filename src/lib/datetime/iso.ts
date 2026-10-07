/**
 * ISO 8601 utilities — no external dependencies
 */

/**
 * Parse any common ISO 8601 string → Date (throws on invalid)
 * Supports: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DDTHH:mm:ssZ,
 *           YYYY-MM-DDTHH:mm:ss+HH:MM, YYYYMMDD, etc.
 */
export function parseISO(input: string): Date {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: expected a string');
  }

  // Try native Date parsing first (handles most ISO 8601 formats)
  const d = new Date(input);
  if (!isNaN(d.getTime())) return d;

  // Try compact date format YYYYMMDD
  const compact = input.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    const [, y, m, day] = compact;
    const result = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(day)));
    if (!isNaN(result.getTime())) return result;
  }

  throw new Error(`Invalid ISO 8601 string: ${input}`);
}

/**
 * Convert a Date to ISO 8601 string with timezone offset
 * If timezone provided, formats in that timezone with offset
 */
export function toISO(d: Date, timezone?: string): string {
  if (!timezone || timezone === 'UTC') {
    return d.toISOString();
  }

  // Get offset for the timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  // Get UTC offset
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const offsetStr = offsetFormatter.formatToParts(d).find(p => p.type === 'timeZoneName')?.value || 'UTC';
  // offsetStr might be like "GMT+5:30" or "GMT-4"
  const offsetMatch = offsetStr.match(/GMT([+-]\d+(?::\d+)?)/);
  let offset = '+00:00';
  if (offsetMatch) {
    const raw = offsetMatch[1];
    if (raw.includes(':')) {
      const [h, m] = raw.split(':');
      offset = `${h.startsWith('-') ? '-' : '+'}${Math.abs(parseInt(h)).toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    } else {
      const h = parseInt(raw);
      offset = `${h >= 0 ? '+' : '-'}${Math.abs(h).toString().padStart(2, '0')}:00`;
    }
  }

  return `${map['year']}-${map['month']}-${map['day']}T${map['hour']}:${map['minute']}:${map['second']}${offset}`;
}

/**
 * Detect and describe an ISO 8601 string format
 */
export function describeISO(input: string): {
  valid: boolean;
  format: string;
  hasTime: boolean;
  hasTimezone: boolean;
  offset?: string;
} {
  if (!input) return { valid: false, format: 'unknown', hasTime: false, hasTimezone: false };

  let valid = false;
  let format = 'unknown';
  let hasTime = false;
  let hasTimezone = false;
  let offset: string | undefined;

  try {
    parseISO(input);
    valid = true;
  } catch {
    return { valid: false, format: 'unknown', hasTime: false, hasTimezone: false };
  }

  // Determine format
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    format = 'YYYY-MM-DD';
    hasTime = false;
    hasTimezone = false;
  } else if (/^\d{8}$/.test(input)) {
    format = 'YYYYMMDD';
    hasTime = false;
    hasTimezone = false;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(input)) {
    format = 'YYYY-MM-DDTHH:mm:ssZ';
    hasTime = true;
    hasTimezone = true;
    offset = 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/.test(input)) {
    format = 'YYYY-MM-DDTHH:mm:ss.sssZ';
    hasTime = true;
    hasTimezone = true;
    offset = 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(input)) {
    format = 'YYYY-MM-DDTHH:mm:ss±HH:MM';
    hasTime = true;
    hasTimezone = true;
    const match = input.match(/([+-]\d{2}:\d{2})$/);
    if (match) offset = match[1];
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)) {
    format = 'YYYY-MM-DDTHH:mm:ss';
    hasTime = true;
    hasTimezone = false;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    format = 'YYYY-MM-DDTHH:mm';
    hasTime = true;
    hasTimezone = false;
  } else {
    format = 'ISO 8601 variant';
    hasTime = input.includes('T') || input.includes(' ');
    hasTimezone = input.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(input);
  }

  return { valid, format, hasTime, hasTimezone, offset };
}

/**
 * Convert ISO string to various representations
 */
export function isoConvert(input: string): {
  iso: string;
  local: string;
  utc: string;
  unixSeconds: number;
  unixMs: number;
  offset: string;
} {
  const d = parseISO(input);

  const localFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const utcFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  function partsToString(parts: Intl.DateTimeFormatPart[]): string {
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    return `${map['year']}-${map['month']}-${map['day']} ${map['hour']}:${map['minute']}:${map['second']}`;
  }

  const localParts = localFormatter.formatToParts(d);
  const utcParts = utcFormatter.formatToParts(d);

  // Get local offset
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const oh = Math.floor(absMin / 60).toString().padStart(2, '0');
  const om = (absMin % 60).toString().padStart(2, '0');
  const offset = `${sign}${oh}:${om}`;

  const unixMs = d.getTime();

  return {
    iso: d.toISOString(),
    local: partsToString(localParts),
    utc: partsToString(utcParts),
    unixSeconds: Math.floor(unixMs / 1000),
    unixMs,
    offset,
  };
}
