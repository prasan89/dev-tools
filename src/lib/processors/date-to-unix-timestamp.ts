import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { dateToUnix } from '../datetime/unix';
import { getUTCOffset } from '../datetime/timezone';

/**
 * Parse a date string (YYYY-MM-DD HH:MM:SS) in a given IANA timezone,
 * returning the corresponding UTC Date.
 */
function parseDateInTimezone(dateStr: string, timezone: string): Date {
  // Normalize the input: accept "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD HH:MM" or "YYYY-MM-DD"
  const trimmed = dateStr.trim();

  const withSeconds = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  const withMinutes = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  let year: number, month: number, day: number, hour: number, minute: number, second: number;

  if (withSeconds) {
    [, year, month, day, hour, minute, second] = withSeconds.map(Number) as [string, number, number, number, number, number, number];
  } else if (withMinutes) {
    [, year, month, day, hour, minute] = withMinutes.map(Number) as [string, number, number, number, number, number];
    second = 0;
  } else if (dateOnly) {
    [, year, month, day] = dateOnly.map(Number) as [string, number, number, number];
    hour = 0; minute = 0; second = 0;
  } else {
    throw new Error('Invalid date/time format. Use YYYY-MM-DD HH:MM:SS');
  }

  // Use Intl to determine the UTC offset for the timezone at this approximate date
  // Build a Date first in UTC, then adjust by offset
  const approxUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Get offset for this timezone at this approximate time
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const offsetStr = offsetFormatter.formatToParts(approxUTC).find(p => p.type === 'timeZoneName')?.value || 'GMT';
  const offsetMatch = offsetStr.match(/GMT([+-]\d+(?::\d+)?)/);

  let offsetMinutes = 0;
  if (offsetMatch) {
    const raw = offsetMatch[1];
    if (raw.includes(':')) {
      const [h, m] = raw.split(':').map(Number);
      offsetMinutes = h * 60 + (h >= 0 ? m : -m);
    } else {
      offsetMinutes = parseInt(raw) * 60;
    }
  }

  // Local time in the zone = UTC + offset, so UTC = Local - offset
  const utcMs = approxUTC.getTime() - offsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

function formatUTCDatetime(d: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
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
  return `${map['year']}-${map['month']}-${map['day']} ${map['hour']}:${map['minute']}:${map['second']}`;
}

export const dateToUnixTimestampProcessor: ToolProcessor = {
  inputLabel: 'Date & Time (YYYY-MM-DD HH:MM:SS)',
  inputPlaceholder: '2026-01-01 00:00:00',
  autoProcess: true,
  exampleInput: '2026-01-01 00:00:00',

  optionControls: [
    {
      key: 'timezone',
      type: 'text',
      label: 'Timezone (IANA, e.g. America/New_York)',
      defaultValue: 'UTC',
      placeholder: 'UTC',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date and time.' };

    const timezone = (input.options?.timezone as string) || 'UTC';

    let validTz = timezone;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      return { error: `Invalid timezone: "${timezone}". Use an IANA timezone name (e.g. UTC, America/New_York).` };
    }

    let date: Date;
    try {
      date = parseDateInTimezone(raw, validTz);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }

    if (isNaN(date.getTime())) {
      return { error: 'Could not parse the date/time. Use YYYY-MM-DD HH:MM:SS.' };
    }

    const { seconds, milliseconds } = dateToUnix(date);
    const iso = date.toISOString();
    const utcStr = formatUTCDatetime(date);
    const offset = getUTCOffset(validTz, date);

    const lines: string[] = [
      `Unix seconds:      ${seconds}`,
      `Unix milliseconds: ${milliseconds}`,
      `ISO 8601:          ${iso}`,
      `UTC:               ${utcStr}`,
      `Timezone:          ${validTz} (UTC${offset})`,
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Unix: ${seconds}`,
        copyable: true,
      },
      meta: {
        'unix seconds': seconds,
        'unix ms': milliseconds,
        timezone: validTz,
      },
    };
  },
};
