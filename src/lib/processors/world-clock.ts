import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { formatInTimezone, getUTCOffset, isInDST, isValidTimezone } from '../datetime/timezone';

const DEFAULT_TIMEZONES = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Los_Angeles',
  'Europe/Berlin',
  'America/Toronto',
  'Pacific/Auckland',
];

function getCityName(tz: string): string {
  const cityMap: Record<string, string> = {
    'UTC': 'UTC / Universal',
    'America/New_York': 'New York',
    'America/Los_Angeles': 'Los Angeles',
    'America/Chicago': 'Chicago',
    'America/Denver': 'Denver',
    'America/Toronto': 'Toronto',
    'America/Vancouver': 'Vancouver',
    'America/Sao_Paulo': 'São Paulo',
    'America/Anchorage': 'Anchorage',
    'Pacific/Honolulu': 'Honolulu',
    'Europe/London': 'London',
    'Europe/Paris': 'Paris',
    'Europe/Berlin': 'Berlin',
    'Europe/Amsterdam': 'Amsterdam',
    'Europe/Moscow': 'Moscow',
    'Asia/Dubai': 'Dubai',
    'Asia/Kolkata': 'Kolkata',
    'Asia/Singapore': 'Singapore',
    'Asia/Tokyo': 'Tokyo',
    'Asia/Seoul': 'Seoul',
    'Asia/Shanghai': 'Shanghai',
    'Asia/Bangkok': 'Bangkok',
    'Asia/Colombo': 'Colombo',
    'Asia/Dhaka': 'Dhaka',
    'Australia/Sydney': 'Sydney',
    'Australia/Melbourne': 'Melbourne',
    'Pacific/Auckland': 'Auckland',
    'Africa/Cairo': 'Cairo',
    'Africa/Lagos': 'Lagos',
    'Africa/Johannesburg': 'Johannesburg',
  };
  return cityMap[tz] || tz.split('/').pop()?.replace('_', ' ') || tz;
}

export const worldClockProcessor: ToolProcessor = {
  inputLabel: 'Custom locations (IANA timezones, one per line, leave blank for defaults)',
  inputPlaceholder: 'America/New_York\nEurope/London\nAsia/Tokyo',
  exampleInput: '',
  autoProcess: true,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();

    let tzList: string[];
    if (!raw) {
      tzList = DEFAULT_TIMEZONES;
    } else {
      tzList = raw
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    }

    if (tzList.length === 0) {
      tzList = DEFAULT_TIMEZONES;
    }

    const invalidTzs = tzList.filter(tz => !isValidTimezone(tz));
    if (invalidTzs.length > 0) {
      return { error: `Invalid timezone(s): ${invalidTzs.join(', ')}\nUse IANA format, e.g. America/New_York` };
    }

    const now = new Date();

    const lines: string[] = [];
    lines.push(`World Clock — ${now.toUTCString()}`);
    lines.push('═'.repeat(72));
    lines.push(
      `${'City / Timezone'.padEnd(28)} ${'Current Time'.padEnd(10)} ${'Current Date'.padEnd(13)} ${'Offset'.padEnd(8)} DST`
    );
    lines.push('─'.repeat(72));

    for (const tz of tzList) {
      const city = getCityName(tz);
      const timeStr = formatInTimezone(now, tz, { includeDate: false, includeTime: true });
      const dateStr = formatInTimezone(now, tz, { includeDate: true, includeTime: false });
      const offset = getUTCOffset(tz, now);
      const dst = isInDST(tz, now);
      const label = city.length > 27 ? city.substring(0, 27) : city;
      lines.push(
        `${label.padEnd(28)} ${timeStr.padEnd(10)} ${dateStr.padEnd(13)} ${`UTC${offset}`.padEnd(8)} ${dst ? 'Yes' : 'No'}`
      );
    }

    lines.push('─'.repeat(72));
    lines.push('');
    lines.push(`Showing ${tzList.length} timezone(s). Press Run again to refresh.`);

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'World Clock',
        copyable: true,
      },
      meta: {
        'timezones': tzList.length,
        'as of (UTC)': now.toUTCString(),
      },
    };
  },
};
