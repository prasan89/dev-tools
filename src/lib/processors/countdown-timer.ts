import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { countdown } from '../datetime/durations';
import { getUTCOffset } from '../datetime/timezone';

function parseTargetDate(input: string): Date {
  const trimmed = input.trim();
  // Try YYYY-MM-DD HH:MM
  const withTime = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (withTime) {
    const d = new Date(`${withTime[1]}T${withTime[2]}:00`);
    if (!isNaN(d.getTime())) return d;
  }
  // Try YYYY-MM-DD HH:MM:SS
  const withSeconds = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (withSeconds) {
    const d = new Date(`${withSeconds[1]}T${withSeconds[2]}`);
    if (!isNaN(d.getTime())) return d;
  }
  // Try YYYY-MM-DD (treat as midnight)
  const dateOnly = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateOnly) {
    const d = new Date(`${dateOnly[1]}T00:00:00`);
    if (!isNaN(d.getTime())) return d;
  }
  throw new Error('Invalid date/time format. Use YYYY-MM-DD HH:MM or YYYY-MM-DD.');
}

function formatInTimezone(date: Date, timezone: string): string {
  try {
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
    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    return `${map['year']}-${map['month']}-${map['day']} ${map['hour']}:${map['minute']}:${map['second']}`;
  } catch {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }
}

export const countdownTimerProcessor: ToolProcessor = {
  inputLabel: 'Target Date & Time (YYYY-MM-DD HH:MM or YYYY-MM-DD)',
  inputPlaceholder: '2027-01-01 00:00',
  autoProcess: true,
  exampleInput: '2027-01-01 00:00',

  optionControls: [
    {
      key: 'timezone',
      type: 'text',
      label: 'Timezone (IANA, e.g. Asia/Kolkata)',
      defaultValue: 'UTC',
      placeholder: 'UTC',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a target date/time.' };

    const timezone = (input.options?.timezone as string) || 'UTC';

    let target: Date;
    try {
      target = parseTargetDate(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }

    // Validate timezone
    let validTz = timezone;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      validTz = 'UTC';
    }

    const result = countdown(target);
    const offset = getUTCOffset(validTz);

    const targetInTz = formatInTimezone(target, validTz);

    let countdownText: string;
    if (result.isPast) {
      const { days, hours, minutes, seconds } = result;
      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      countdownText = `${parts.join(', ')} ago`;
    } else {
      countdownText = `${result.days} days, ${result.hours} hours, ${result.minutes} minutes, ${result.seconds} seconds remaining`;
    }

    const lines: string[] = [
      result.isPast ? 'Status: Past date' : 'Status: Future date',
      '',
      result.isPast ? 'Time elapsed:' : 'Time remaining:',
      `  Days:    ${result.days}`,
      `  Hours:   ${result.hours}`,
      `  Minutes: ${result.minutes}`,
      `  Seconds: ${result.seconds}`,
      '',
      countdownText,
      '',
      `Target date (${validTz}): ${targetInTz} (UTC${offset})`,
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: result.isPast ? 'Time Elapsed' : 'Countdown',
        copyable: true,
      },
      meta: {
        days: result.days,
        hours: result.hours,
        minutes: result.minutes,
        seconds: result.seconds,
        status: result.isPast ? 'past' : 'future',
      },
    };
  },
};
