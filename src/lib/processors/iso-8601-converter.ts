import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseISO, describeISO, isoConvert } from '../datetime/iso';

export const iso8601ConverterProcessor: ToolProcessor = {
  inputLabel: 'ISO 8601 Date String',
  inputPlaceholder: '2026-10-07T14:30:00+05:30',
  autoProcess: true,
  exampleInput: '2026-10-07T14:30:00+05:30',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter an ISO 8601 date string.' };

    let description: ReturnType<typeof describeISO>;
    try {
      description = describeISO(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Parse error: ${msg}` };
    }

    if (!description.valid) {
      return {
        error: `"${raw}" is not a valid ISO 8601 date string.\n\nExamples of valid formats:\n  2026-10-07\n  2026-10-07T14:30:00\n  2026-10-07T14:30:00Z\n  2026-10-07T14:30:00+05:30`,
      };
    }

    let converted: ReturnType<typeof isoConvert>;
    try {
      converted = isoConvert(raw);
    } catch (err) {
      // Should not happen if describeISO succeeded, but guard anyway
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Conversion error: ${msg}` };
    }

    // Verify the date is actually parseable
    try {
      parseISO(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }

    const lines: string[] = [
      `Detected format: ${description.format}`,
      `Has time:        ${description.hasTime ? 'Yes' : 'No'}`,
      `Has timezone:    ${description.hasTimezone ? 'Yes' : 'No'}`,
      description.offset ? `Offset:          ${description.offset}` : '',
      '',
      `ISO 8601:        ${converted.iso}`,
      `Local time:      ${converted.local}`,
      `UTC:             ${converted.utc}`,
      `Unix seconds:    ${converted.unixSeconds}`,
      `Unix ms:         ${converted.unixMs}`,
    ].filter(line => line !== '');

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `ISO 8601 → ${converted.utc} UTC`,
        copyable: true,
      },
      meta: {
        format: description.format,
        'unix seconds': converted.unixSeconds,
        utc: converted.utc,
        offset: description.offset || converted.offset,
      },
    };
  },
};
