import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { formatInTimezone, convertTimezone, getUTCOffset, isValidTimezone } from '../datetime/timezone';
import { dateToUnix, unixToDate } from '../datetime/unix';

export const utcConverterProcessor: ToolProcessor = {
  inputLabel: 'Date & Time',
  inputPlaceholder: '2026-10-07 09:00',
  exampleInput: '2026-10-07 09:00',
  autoProcess: true,

  optionControls: [
    {
      key: 'mode',
      type: 'select',
      label: 'Conversion Mode',
      defaultValue: 'Local → UTC',
      options: [
        { value: 'Local → UTC', label: 'Local → UTC' },
        { value: 'UTC → Local', label: 'UTC → Local' },
        { value: 'UTC → Unix', label: 'UTC → Unix' },
        { value: 'Unix → UTC', label: 'Unix → UTC' },
      ],
    },
    {
      key: 'timezone',
      type: 'text',
      label: 'Local Timezone (IANA)',
      defaultValue: 'Asia/Kolkata',
      placeholder: 'e.g. Asia/Kolkata',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date/time or Unix timestamp to convert.' };

    const mode = String(input.options?.mode || 'Local → UTC');
    const timezone = String(input.options?.timezone || 'Asia/Kolkata').trim();

    if ((mode === 'Local → UTC' || mode === 'UTC → Local') && !isValidTimezone(timezone)) {
      return { error: `Invalid timezone: "${timezone}". Use an IANA timezone (e.g. Asia/Kolkata).` };
    }

    const lines: string[] = [];

    if (mode === 'Local → UTC') {
      const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/);
      if (!match) {
        return { error: 'Invalid format. Use YYYY-MM-DD HH:MM (e.g. 2026-10-07 09:00)' };
      }
      const [, datePart, timePart] = match;
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const approxDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const fromOffset = getUTCOffset(timezone, approxDate);
      const offsetMatch = fromOffset.match(/^([+-])(\d{2}):(\d{2})$/);
      let offsetMinutes = 0;
      if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        offsetMinutes = sign * (parseInt(offsetMatch[2]) * 60 + parseInt(offsetMatch[3]));
      }
      const sourceDate = new Date(Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60000);

      const offset = getUTCOffset(timezone, sourceDate);
      const utcFormatted = formatInTimezone(sourceDate, 'UTC');

      lines.push('Local → UTC Conversion');
      lines.push('═'.repeat(50));
      lines.push(`Mode:          Local → UTC`);
      lines.push(`Local Timezone: ${timezone} (UTC${offset})`);
      lines.push('');
      lines.push(`Input (local):  ${datePart} ${timePart}  [${timezone}]`);
      lines.push(`Output (UTC):   ${utcFormatted}  [UTC]`);
      lines.push('');
      lines.push(`Unix Timestamp: ${dateToUnix(sourceDate).seconds} seconds`);

      return {
        output: { value: lines.join('\n'), type: 'text', label: 'UTC Conversion Result', copyable: true },
        meta: {
          'timezone': timezone,
          'UTC offset': `UTC${offset}`,
          'unix seconds': dateToUnix(sourceDate).seconds,
        },
      };
    }

    if (mode === 'UTC → Local') {
      const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/);
      if (!match) {
        return { error: 'Invalid format. Use YYYY-MM-DD HH:MM (e.g. 2026-10-07 09:00 as UTC)' };
      }
      const [, datePart, timePart] = match;
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const localFormatted = formatInTimezone(utcDate, timezone);
      const offset = getUTCOffset(timezone, utcDate);

      lines.push('UTC → Local Conversion');
      lines.push('═'.repeat(50));
      lines.push(`Mode:           UTC → Local`);
      lines.push(`Local Timezone: ${timezone} (UTC${offset})`);
      lines.push('');
      lines.push(`Input (UTC):    ${datePart} ${timePart}  [UTC]`);
      lines.push(`Output (local): ${localFormatted}  [${timezone}]`);
      lines.push('');
      lines.push(`Unix Timestamp: ${dateToUnix(utcDate).seconds} seconds`);

      return {
        output: { value: lines.join('\n'), type: 'text', label: 'Local Time Result', copyable: true },
        meta: {
          'timezone': timezone,
          'UTC offset': `UTC${offset}`,
          'unix seconds': dateToUnix(utcDate).seconds,
        },
      };
    }

    if (mode === 'UTC → Unix') {
      const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/);
      if (!match) {
        return { error: 'Invalid format. Use YYYY-MM-DD HH:MM (e.g. 2026-10-07 09:00 as UTC)' };
      }
      const [, datePart, timePart] = match;
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const { seconds, milliseconds } = dateToUnix(utcDate);

      lines.push('UTC → Unix Timestamp');
      lines.push('═'.repeat(50));
      lines.push(`Mode:          UTC → Unix`);
      lines.push('');
      lines.push(`Input (UTC):   ${datePart} ${timePart}  [UTC]`);
      lines.push(`Unix (seconds): ${seconds}`);
      lines.push(`Unix (ms):      ${milliseconds}`);

      return {
        output: { value: lines.join('\n'), type: 'text', label: 'Unix Timestamp', copyable: true },
        meta: {
          'unix seconds': seconds,
          'unix milliseconds': milliseconds,
        },
      };
    }

    if (mode === 'Unix → UTC') {
      const num = Number(raw.replace(/[,_]/g, ''));
      if (isNaN(num) || !isFinite(num)) {
        return { error: 'Invalid Unix timestamp. Enter a number (seconds or milliseconds).' };
      }

      // Auto-detect seconds vs milliseconds: if > 1e10 treat as ms
      const date = num > 1e10 ? new Date(num) : unixToDate(num);
      const utcFormatted = formatInTimezone(date, 'UTC');
      const isoStr = date.toISOString();

      lines.push('Unix → UTC Conversion');
      lines.push('═'.repeat(50));
      lines.push(`Mode:           Unix → UTC`);
      lines.push('');
      lines.push(`Input:          ${num} ${num > 1e10 ? '(milliseconds)' : '(seconds)'}`);
      lines.push(`UTC:            ${utcFormatted}  [UTC]`);
      lines.push(`ISO 8601:       ${isoStr}`);

      return {
        output: { value: lines.join('\n'), type: 'text', label: 'UTC Date Result', copyable: true },
        meta: {
          'unix input': num,
          'UTC date': utcFormatted,
        },
      };
    }

    return { error: `Unknown mode: ${mode}` };
  },
};
