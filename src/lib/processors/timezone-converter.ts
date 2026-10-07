import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { convertTimezone, formatInTimezone, getUTCOffset, isInDST, isValidTimezone } from '../datetime/timezone';

export const timezoneConverterProcessor: ToolProcessor = {
  inputLabel: 'Date & Time (YYYY-MM-DD HH:MM)',
  inputPlaceholder: '2026-10-07 09:00',
  exampleInput: '2026-10-07 09:00',
  autoProcess: true,

  optionControls: [
    {
      key: 'fromTimezone',
      type: 'text',
      label: 'From Timezone (IANA)',
      defaultValue: 'Asia/Kolkata',
      placeholder: 'e.g. Asia/Kolkata',
    },
    {
      key: 'toTimezones',
      type: 'text',
      label: 'To Timezones (comma-separated IANA, up to 6)',
      defaultValue: 'UTC,America/New_York,Europe/London,Asia/Tokyo,Australia/Sydney',
      placeholder: 'UTC,America/New_York,Europe/London',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date and time to convert.' };

    const fromTz = String(input.options?.fromTimezone || 'Asia/Kolkata').trim();
    const toTzsRaw = String(input.options?.toTimezones || 'UTC,America/New_York,Europe/London,Asia/Tokyo,Australia/Sydney');

    // Parse input date/time
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/);
    if (!match) {
      return { error: 'Invalid format. Use YYYY-MM-DD HH:MM (e.g. 2026-10-07 09:00)' };
    }

    const [, datePart, timePart] = match;

    if (!isValidTimezone(fromTz)) {
      return { error: `Invalid source timezone: "${fromTz}". Use an IANA timezone (e.g. Asia/Kolkata).` };
    }

    // Parse toTimezones (max 6)
    const toTzList = toTzsRaw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (toTzList.length === 0) {
      return { error: 'Enter at least one destination timezone.' };
    }

    const invalidTzs = toTzList.filter(tz => !isValidTimezone(tz));
    if (invalidTzs.length > 0) {
      return { error: `Invalid destination timezone(s): ${invalidTzs.join(', ')}` };
    }

    // Build a Date in the source timezone by constructing the string and interpreting it in UTC
    // then adjusting for the fromTz offset
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Create a Date by treating the input as local time in fromTz
    // We use the Intl trick: format a known UTC date and find the offset
    // Simpler approach: use Date.UTC and adjust
    // Find the UTC offset for fromTz at approximate time
    const approxDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const fromOffset = getUTCOffset(fromTz, approxDate);

    // Parse offset to minutes
    const offsetMatch = fromOffset.match(/^([+-])(\d{2}):(\d{2})$/);
    let offsetMinutes = 0;
    if (offsetMatch) {
      const sign = offsetMatch[1] === '+' ? 1 : -1;
      offsetMinutes = sign * (parseInt(offsetMatch[2]) * 60 + parseInt(offsetMatch[3]));
    }

    // Adjust: the date in fromTz means UTC = local - offset
    const sourceDate = new Date(Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60000);

    const fromOffset2 = getUTCOffset(fromTz, sourceDate);
    const fromDST = isInDST(fromTz, sourceDate);
    const fromFormatted = formatInTimezone(sourceDate, fromTz);

    const lines: string[] = [];
    lines.push('Timezone Conversion Results');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`Source: ${fromTz}`);
    lines.push(`Input:  ${fromFormatted}  (UTC${fromOffset2}${fromDST ? '  DST' : ''})`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push(
      `${'Timezone'.padEnd(28)} ${'Local Time'.padEnd(20)} ${'Offset'.padEnd(8)} DST`
    );
    lines.push('─'.repeat(60));

    for (const tz of toTzList) {
      const localFormatted = formatInTimezone(sourceDate, tz);
      const offset = getUTCOffset(tz, sourceDate);
      const dst = isInDST(tz, sourceDate);
      lines.push(
        `${tz.padEnd(28)} ${localFormatted.padEnd(20)} ${`UTC${offset}`.padEnd(8)} ${dst ? 'Yes' : 'No'}`
      );
    }

    lines.push('─'.repeat(60));

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'Timezone Conversion',
        copyable: true,
      },
      meta: {
        'source timezone': fromTz,
        'destinations': toTzList.length,
      },
    };
  },
};
