/**
 * Timezone utilities using Intl API — no external dependencies
 */

/**
 * Get current UTC offset for a timezone (e.g. "Asia/Kolkata" → "+05:30")
 */
export function getUTCOffset(timezone: string, date?: Date): string {
  const d = date || new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(d);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';
  // tzName format: "GMT+5:30", "GMT-4", "GMT"
  const match = tzName.match(/GMT([+-]\d+(?::\d+)?)?/);
  if (!match || !match[1]) return '+00:00';

  const raw = match[1];
  if (raw.includes(':')) {
    const [h, m] = raw.split(':');
    const sign = h.startsWith('-') ? '-' : '+';
    const absH = Math.abs(parseInt(h)).toString().padStart(2, '0');
    const absM = m.padStart(2, '0');
    return `${sign}${absH}:${absM}`;
  } else {
    const h = parseInt(raw);
    const sign = h >= 0 ? '+' : '-';
    return `${sign}${Math.abs(h).toString().padStart(2, '0')}:00`;
  }
}

/**
 * Convert a date from one timezone to another
 * Returns a Date representing the same instant in time (UTC-based)
 * The returned Date's UTC fields reflect the target timezone's local time
 */
export function convertTimezone(date: Date, _fromTz: string, toTz: string): Date {
  // Date objects are timezone-agnostic (UTC internally),
  // so the "conversion" is formatting in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: toTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  // Return a new Date whose UTC values equal the target timezone's local values
  return new Date(Date.UTC(
    parseInt(map['year']),
    parseInt(map['month']) - 1,
    parseInt(map['day']),
    parseInt(map['hour']),
    parseInt(map['minute']),
    parseInt(map['second'])
  ));
}

/**
 * Format a Date in a specific IANA timezone
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  opts?: { includeDate?: boolean; includeTime?: boolean; includeOffset?: boolean }
): string {
  const { includeDate = true, includeTime = true, includeOffset = false } = opts || {};

  const formatOpts: Intl.DateTimeFormatOptions = { timeZone: timezone };
  if (includeDate) {
    formatOpts.year = 'numeric';
    formatOpts.month = '2-digit';
    formatOpts.day = '2-digit';
  }
  if (includeTime) {
    formatOpts.hour = '2-digit';
    formatOpts.minute = '2-digit';
    formatOpts.second = '2-digit';
    formatOpts.hour12 = false;
  }
  if (includeOffset) {
    formatOpts.timeZoneName = 'shortOffset';
  }

  const formatter = new Intl.DateTimeFormat('en-CA', formatOpts);
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  const datePart = includeDate ? `${map['year']}-${map['month']}-${map['day']}` : '';
  const timePart = includeTime ? `${map['hour']}:${map['minute']}:${map['second']}` : '';
  const offsetPart = includeOffset ? ` ${map['timeZoneName'] || ''}` : '';

  if (includeDate && includeTime) return `${datePart} ${timePart}${offsetPart}`;
  if (includeDate) return `${datePart}${offsetPart}`;
  if (includeTime) return `${timePart}${offsetPart}`;
  return '';
}

/** Get list of popular IANA timezones with display info */
export function getPopularTimezones(): Array<{ id: string; city: string; offset: string; abbr: string }> {
  const zones = [
    { id: 'UTC', city: 'UTC' },
    { id: 'America/New_York', city: 'New York' },
    { id: 'America/Chicago', city: 'Chicago' },
    { id: 'America/Denver', city: 'Denver' },
    { id: 'America/Los_Angeles', city: 'Los Angeles' },
    { id: 'America/Toronto', city: 'Toronto' },
    { id: 'America/Vancouver', city: 'Vancouver' },
    { id: 'America/Sao_Paulo', city: 'São Paulo' },
    { id: 'Europe/London', city: 'London' },
    { id: 'Europe/Paris', city: 'Paris' },
    { id: 'Europe/Berlin', city: 'Berlin' },
    { id: 'Europe/Amsterdam', city: 'Amsterdam' },
    { id: 'Europe/Moscow', city: 'Moscow' },
    { id: 'Asia/Dubai', city: 'Dubai' },
    { id: 'Asia/Kolkata', city: 'Kolkata' },
    { id: 'Asia/Colombo', city: 'Colombo' },
    { id: 'Asia/Dhaka', city: 'Dhaka' },
    { id: 'Asia/Bangkok', city: 'Bangkok' },
    { id: 'Asia/Singapore', city: 'Singapore' },
    { id: 'Asia/Shanghai', city: 'Shanghai' },
    { id: 'Asia/Tokyo', city: 'Tokyo' },
    { id: 'Asia/Seoul', city: 'Seoul' },
    { id: 'Australia/Sydney', city: 'Sydney' },
    { id: 'Australia/Melbourne', city: 'Melbourne' },
    { id: 'Pacific/Auckland', city: 'Auckland' },
    { id: 'Africa/Cairo', city: 'Cairo' },
    { id: 'Africa/Lagos', city: 'Lagos' },
    { id: 'Africa/Johannesburg', city: 'Johannesburg' },
    { id: 'Pacific/Honolulu', city: 'Honolulu' },
    { id: 'America/Anchorage', city: 'Anchorage' },
  ];

  const now = new Date();
  return zones.map(({ id, city }) => {
    const offset = getUTCOffset(id, now);

    // Get abbreviation using timeZoneName: 'short'
    let abbr = id.split('/').pop() || id;
    try {
      const abbrFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: id,
        timeZoneName: 'short',
      });
      const abbrParts = abbrFormatter.formatToParts(now);
      const tzAbbr = abbrParts.find(p => p.type === 'timeZoneName')?.value;
      if (tzAbbr) abbr = tzAbbr;
    } catch {
      // fallback to id suffix
    }

    return { id, city, offset, abbr };
  });
}

/** Check if a timezone string is valid IANA */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Determine if a timezone is currently in DST */
export function isInDST(timezone: string, date?: Date): boolean {
  const d = date || new Date();
  // Compare offset in winter (Jan) vs summer (Jul) to find standard offset
  const jan = new Date(d.getFullYear(), 0, 1);
  const jul = new Date(d.getFullYear(), 6, 1);

  function getOffsetMinutes(dt: Date, tz: string): number {
    // Use Intl to get local time in zone, then compute offset from UTC
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(dt);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    const localTime = new Date(
      parseInt(map['year']),
      parseInt(map['month']) - 1,
      parseInt(map['day']),
      parseInt(map['hour']),
      parseInt(map['minute']),
      parseInt(map['second'])
    );
    return (dt.getTime() - localTime.getTime()) / 60000;
  }

  const janOffset = getOffsetMinutes(jan, timezone);
  const julOffset = getOffsetMinutes(jul, timezone);
  const nowOffset = getOffsetMinutes(d, timezone);

  // Standard offset is the larger of the two (less negative = more positive = standard in north hemisphere)
  // DST reduces the offset (moves clocks forward)
  const stdOffset = Math.max(janOffset, julOffset);
  return nowOffset !== stdOffset;
}
