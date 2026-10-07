import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { convertTimezone, formatInTimezone, getUTCOffset, isValidTimezone } from '../datetime/timezone';

export const meetingTimePlannerProcessor: ToolProcessor = {
  hasSecondaryInput: true,
  inputLabel: 'Date & Start/End Time (YYYY-MM-DD HH:MM-HH:MM)',
  inputPlaceholder: '2026-10-15 09:00-10:00',
  exampleInput: '2026-10-15 09:00-10:00',
  secondaryInputLabel: 'Participant Timezones (IANA, one per line)',
  exampleSecondary: 'Asia/Kolkata\nAmerica/New_York\nEurope/London\nAsia/Tokyo',
  autoProcess: true,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date and time range (e.g. 2026-10-15 09:00-10:00).' };

    const secondaryRaw = (input.secondary || '').trim();
    if (!secondaryRaw) return { error: 'Enter participant timezones (one per line).' };

    // Parse date + time range: "YYYY-MM-DD HH:MM-HH:MM"
    const rangeMatch = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!rangeMatch) {
      return { error: 'Invalid format. Use YYYY-MM-DD HH:MM-HH:MM (e.g. 2026-10-15 09:00-10:00).' };
    }

    const [, datePart, startTime, endTime] = rangeMatch;
    const [year, month, day] = datePart.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Parse participant timezones
    const tzList = secondaryRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (tzList.length === 0) return { error: 'Enter at least one participant timezone.' };

    const invalidTzs = tzList.filter(tz => !isValidTimezone(tz));
    if (invalidTzs.length > 0) {
      return { error: `Invalid timezone(s): ${invalidTzs.join(', ')}` };
    }

    // The input times are interpreted as UTC for simplicity in cross-timezone planning
    // (The first participant's timezone would be the "host" timezone)
    // Treat the input as UTC-based start/end
    const startDateUTC = new Date(Date.UTC(year, month - 1, day, startHour, startMinute));
    const endDateUTC = new Date(Date.UTC(year, month - 1, day, endHour, endMinute));

    const lines: string[] = [];
    lines.push('Meeting Time Planner');
    lines.push('═'.repeat(72));
    lines.push(`Meeting: ${datePart}  ${startTime} – ${endTime}  (UTC)`);
    lines.push('');
    lines.push(
      `${'Timezone'.padEnd(28)} ${'Local Start'.padEnd(12)} ${'Local End'.padEnd(12)} ${'Offset'.padEnd(8)} Status`
    );
    lines.push('─'.repeat(72));

    for (const tz of tzList) {
      const localStart = formatInTimezone(startDateUTC, tz, { includeDate: false, includeTime: true });
      const localEnd = formatInTimezone(endDateUTC, tz, { includeDate: false, includeTime: true });
      const offset = getUTCOffset(tz, startDateUTC);

      // Parse local start hour for working hours check
      const localStartConverted = convertTimezone(startDateUTC, 'UTC', tz);
      const startHourLocal = localStartConverted.getUTCHours();
      const endHourLocal = convertTimezone(endDateUTC, 'UTC', tz).getUTCHours();

      let status: string;
      if (startHourLocal < 8 || endHourLocal < 8) {
        status = '⚠ Outside working hours (before 08:00)';
      } else if (startHourLocal >= 20 || endHourLocal > 20) {
        status = '⚠ Outside working hours (after 20:00)';
      } else if (startHourLocal >= 8 && endHourLocal <= 18) {
        status = '✓ Working hours';
      } else {
        status = '~ Partially outside core hours';
      }

      const tzLabel = tz.length > 27 ? tz.substring(0, 27) : tz;
      lines.push(
        `${tzLabel.padEnd(28)} ${localStart.padEnd(12)} ${localEnd.padEnd(12)} ${`UTC${offset}`.padEnd(8)} ${status}`
      );
    }

    lines.push('─'.repeat(72));
    lines.push('');
    lines.push('Note: Input times are interpreted as UTC. Working hours: 08:00–18:00 local.');

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'Meeting Time Plan',
        copyable: true,
      },
      meta: {
        'participants': tzList.length,
        'meeting date (UTC)': datePart,
        'time range': `${startTime} – ${endTime}`,
      },
    };
  },
};
