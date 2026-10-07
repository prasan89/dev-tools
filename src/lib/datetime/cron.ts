/**
 * Pure JS cron parser and description generator — no external dependencies
 */

export interface CronField {
  raw: string;
  type: 'every' | 'specific' | 'range' | 'step' | 'list';
  values: number[];
}

export interface CronParsed {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

interface FieldSpec {
  min: number;
  max: number;
  name: string;
}

const FIELD_SPECS: FieldSpec[] = [
  { min: 0, max: 59, name: 'minute' },
  { min: 0, max: 23, name: 'hour' },
  { min: 1, max: 31, name: 'dayOfMonth' },
  { min: 1, max: 12, name: 'month' },
  { min: 0, max: 6, name: 'dayOfWeek' },
];

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DOW_NAMES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function expandValues(part: string, spec: FieldSpec): number[] {
  const lower = part.toLowerCase();

  // Replace named months/days with numbers
  let normalized = lower;
  for (const [name, val] of Object.entries(MONTH_NAMES)) {
    normalized = normalized.replace(new RegExp(name, 'g'), String(val));
  }
  for (const [name, val] of Object.entries(DOW_NAMES)) {
    normalized = normalized.replace(new RegExp(name, 'g'), String(val));
  }

  // Wildcard step: */n
  if (/^\*\/\d+$/.test(normalized)) {
    const step = parseInt(normalized.split('/')[1]);
    const values: number[] = [];
    for (let i = spec.min; i <= spec.max; i += step) values.push(i);
    return values;
  }

  // Range with step: a-b/n
  if (/^\d+-\d+\/\d+$/.test(normalized)) {
    const [range, stepStr] = normalized.split('/');
    const [startStr, endStr] = range.split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    const step = parseInt(stepStr);
    const values: number[] = [];
    for (let i = start; i <= end; i += step) values.push(i);
    return values;
  }

  // Range: a-b
  if (/^\d+-\d+$/.test(normalized)) {
    const [startStr, endStr] = normalized.split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    const values: number[] = [];
    for (let i = start; i <= end; i++) values.push(i);
    return values;
  }

  // Wildcard
  if (normalized === '*') {
    const values: number[] = [];
    for (let i = spec.min; i <= spec.max; i++) values.push(i);
    return values;
  }

  // List: a,b,c
  if (normalized.includes(',')) {
    return normalized.split(',').map(v => parseInt(v.trim()));
  }

  // Single value
  return [parseInt(normalized)];
}

function parseField(part: string, spec: FieldSpec): CronField {
  const lower = part.toLowerCase();
  let normalized = lower;
  for (const [name, val] of Object.entries(MONTH_NAMES)) {
    normalized = normalized.replace(new RegExp(name, 'g'), String(val));
  }
  for (const [name, val] of Object.entries(DOW_NAMES)) {
    normalized = normalized.replace(new RegExp(name, 'g'), String(val));
  }

  let type: CronField['type'] = 'specific';
  if (normalized === '*') {
    type = 'every';
  } else if (/^\*\/\d+$/.test(normalized) || /^\d+-\d+\/\d+$/.test(normalized)) {
    type = 'step';
  } else if (/^\d+-\d+$/.test(normalized)) {
    type = 'range';
  } else if (normalized.includes(',')) {
    type = 'list';
  } else {
    type = 'specific';
  }

  return {
    raw: part,
    type,
    values: expandValues(part, spec),
  };
}

/** Parse a 5-field cron expression */
export function parseCron(expression: string): CronParsed {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Cron expression must have exactly 5 fields, got ${fields.length}: "${expression}"`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields.map((f, i) => parseField(f, FIELD_SPECS[i]));
  return { minute, hour, dayOfMonth, month, dayOfWeek };
}

/** Human-readable description of a cron expression */
export function describeCron(expression: string): string {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return 'Invalid cron expression';

  const [minF, hrF, domF, monF, dowF] = fields;

  // Common patterns
  if (expression === '* * * * *') return 'Every minute';
  if (expression === '0 * * * *') return 'Every hour';

  const parts: string[] = [];

  // Time part
  if (minF === '*' && hrF === '*') {
    parts.push('Every minute');
  } else if (minF === '0' && hrF === '*') {
    parts.push('Every hour');
  } else if (/^\*\/\d+$/.test(minF) && hrF === '*' && domF === '*' && monF === '*' && dowF === '*') {
    const step = minF.split('/')[1];
    return `Every ${step} minutes`;
  } else if (/^\d+$/.test(minF) && /^\d+$/.test(hrF)) {
    const h = hrF.padStart(2, '0');
    const m = minF.padStart(2, '0');
    parts.push(`At ${h}:${m}`);
  } else if (/^\d+$/.test(minF) && hrF === '*') {
    parts.push(`At minute ${minF} of every hour`);
  } else {
    const minDesc = minF === '*' ? 'every minute' : `minute ${minF}`;
    const hrDesc = hrF === '*' ? 'every hour' : `hour ${hrF}`;
    parts.push(`At ${minDesc} of ${hrDesc}`);
  }

  // Day of week
  if (dowF !== '*') {
    if (/^\d+$/.test(dowF)) {
      const dowNum = parseInt(dowF);
      parts.push(`every ${DOW_FULL[dowNum]}`);
    } else if (/^\d+-\d+$/.test(dowF)) {
      const [s, e] = dowF.split('-').map(Number);
      parts.push(`${DOW_FULL[s]} through ${DOW_FULL[e]}`);
    } else if (dowF.includes(',')) {
      const days = dowF.split(',').map(d => DOW_FULL[parseInt(d)]);
      parts.push(days.join(', '));
    }
  }

  // Day of month
  if (domF !== '*' && dowF === '*') {
    if (/^\d+$/.test(domF)) {
      parts.push(`on day ${domF} of every month`);
    }
  }

  // Month
  if (monF !== '*') {
    if (/^\d+$/.test(monF)) {
      parts.push(`in ${MONTH_FULL[parseInt(monF)]}`);
    }
  }

  if (parts.length === 0) return expression;

  return parts.join(', ');
}

/** Validate a cron expression, return { valid, error? } */
export function validateCron(expression: string): { valid: boolean; error?: string } {
  try {
    const parsed = parseCron(expression);
    // Validate ranges
    const checks = [
      { field: parsed.minute, spec: FIELD_SPECS[0] },
      { field: parsed.hour, spec: FIELD_SPECS[1] },
      { field: parsed.dayOfMonth, spec: FIELD_SPECS[2] },
      { field: parsed.month, spec: FIELD_SPECS[3] },
      { field: parsed.dayOfWeek, spec: FIELD_SPECS[4] },
    ];
    for (const { field, spec } of checks) {
      for (const v of field.values) {
        if (v < spec.min || v > spec.max) {
          return { valid: false, error: `Value ${v} out of range [${spec.min}-${spec.max}] for ${spec.name}` };
        }
      }
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Build a cron expression from parts */
export function buildCron(opts: {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}): string {
  return `${opts.minute} ${opts.hour} ${opts.dayOfMonth} ${opts.month} ${opts.dayOfWeek}`;
}

/**
 * Get next N execution times after a given date
 */
export function getNextExecutions(expression: string, after: Date, count: number): Date[] {
  const parsed = parseCron(expression);
  const results: Date[] = [];

  // Start from the next minute after 'after'
  const start = new Date(after);
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  const minuteSet = new Set(parsed.minute.values);
  const hourSet = new Set(parsed.hour.values);
  const domSet = new Set(parsed.dayOfMonth.values);
  const monthSet = new Set(parsed.month.values);
  const dowSet = new Set(parsed.dayOfWeek.values);

  const isEveryDoM = parsed.dayOfMonth.raw === '*';
  const isEveryDoW = parsed.dayOfWeek.raw === '*';

  // Safety limit: don't loop more than 4 years of minutes
  const maxIterations = 4 * 366 * 24 * 60;
  let iterations = 0;

  const cur = new Date(start);
  cur.setUTCSeconds(0, 0);

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    const month = cur.getUTCMonth() + 1; // 1-indexed
    const dom = cur.getUTCDate();
    const dow = cur.getUTCDay(); // 0=Sun
    const hour = cur.getUTCHours();
    const minute = cur.getUTCMinutes();

    if (!monthSet.has(month)) {
      // Skip to first day of next month in this set
      const nextMonth = [...monthSet].find(m => m > month);
      if (nextMonth !== undefined) {
        cur.setUTCMonth(nextMonth - 1, 1);
        cur.setUTCHours(0, 0, 0, 0);
      } else {
        cur.setUTCFullYear(cur.getUTCFullYear() + 1);
        const firstMonth = Math.min(...monthSet);
        cur.setUTCMonth(firstMonth - 1, 1);
        cur.setUTCHours(0, 0, 0, 0);
      }
      continue;
    }

    // Check day: if both dom and dow are restricted, either can match (OR logic per cron standard)
    const domMatch = isEveryDoM || domSet.has(dom);
    const dowMatch = isEveryDoW || dowSet.has(dow);
    const dayMatch = isEveryDoM && isEveryDoW ? true
      : (!isEveryDoM && !isEveryDoW) ? (domMatch || dowMatch)
      : (domMatch && dowMatch);

    if (!dayMatch) {
      cur.setUTCDate(cur.getUTCDate() + 1);
      cur.setUTCHours(0, 0, 0, 0);
      continue;
    }

    if (!hourSet.has(hour)) {
      const nextHour = [...hourSet].find(h => h > hour);
      if (nextHour !== undefined) {
        cur.setUTCHours(nextHour, 0, 0, 0);
      } else {
        cur.setUTCDate(cur.getUTCDate() + 1);
        cur.setUTCHours(0, 0, 0, 0);
      }
      continue;
    }

    if (!minuteSet.has(minute)) {
      const nextMinute = [...minuteSet].find(m => m > minute);
      if (nextMinute !== undefined) {
        cur.setUTCMinutes(nextMinute, 0, 0);
      } else {
        cur.setUTCHours(cur.getUTCHours() + 1, 0, 0, 0);
      }
      continue;
    }

    // All fields match
    results.push(new Date(cur));
    cur.setUTCMinutes(cur.getUTCMinutes() + 1, 0, 0);
  }

  return results;
}
