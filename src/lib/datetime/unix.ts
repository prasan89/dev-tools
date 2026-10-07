/**
 * Unix timestamp utilities — no external dependencies
 */

/** Date → unix timestamp (seconds and milliseconds) */
export function dateToUnix(date: Date): { seconds: number; milliseconds: number } {
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  };
}

/** Unix seconds → Date */
export function unixToDate(seconds: number): Date {
  return new Date(seconds * 1000);
}

/** Unix milliseconds → Date */
export function unixMsToDate(ms: number): Date {
  return new Date(ms);
}

/**
 * Format a Date in multiple representations
 * timezone: IANA timezone string (optional, defaults to local)
 */
export function formatDateMultiple(
  d: Date,
  timezone?: string
): {
  local: string;
  utc: string;
  iso: string;
  human: string;
  unixSeconds: number;
  unixMs: number;
} {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const localFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
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

  const humanFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const localParts = localFormatter.formatToParts(d);
  const utcParts = utcFormatter.formatToParts(d);

  function partsToString(parts: Intl.DateTimeFormatPart[]): string {
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    return `${map['year']}-${map['month']}-${map['day']} ${map['hour']}:${map['minute']}:${map['second']}`;
  }

  const unixMs = d.getTime();
  return {
    local: partsToString(localParts),
    utc: partsToString(utcParts),
    iso: d.toISOString(),
    human: humanFormatter.format(d),
    unixSeconds: Math.floor(unixMs / 1000),
    unixMs,
  };
}
