/**
 * Duration and time utilities — no external dependencies
 */

/** Parse time string HH:MM or HH:MM:SS → total seconds */
export function parseTimeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 2) {
    const [h, m] = parts;
    return h * 3600 + m * 60;
  } else if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  throw new Error(`Invalid time string: ${time}`);
}

/** Format seconds → { hours, minutes, seconds, totalSeconds, totalMinutes, totalHours } */
export function secondsToComponents(totalSec: number): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
} {
  const abs = Math.abs(totalSec);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return {
    hours,
    minutes,
    seconds,
    totalSeconds: totalSec,
    totalMinutes: Math.floor(totalSec / 60),
    totalHours: Math.floor(totalSec / 3600),
  };
}

/**
 * Duration between two time strings (supports crossing midnight if end < start)
 */
export function timeDuration(
  start: string,
  end: string
): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  crossesMidnight: boolean;
} {
  const startSec = parseTimeToSeconds(start);
  const endSec = parseTimeToSeconds(end);
  let totalSeconds: number;
  let crossesMidnight = false;

  if (endSec >= startSec) {
    totalSeconds = endSec - startSec;
  } else {
    // Crosses midnight
    totalSeconds = 86400 - startSec + endSec;
    crossesMidnight = true;
  }

  const components = secondsToComponents(totalSeconds);
  return { ...components, crossesMidnight };
}

/** Format a duration object as human-readable: "2 hours 30 minutes 15 seconds" */
export function formatDuration(h: number, m: number, s: number): string {
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

/** Countdown from now to a target Date → remaining { days, hours, minutes, seconds, totalSeconds, isPast } */
export function countdown(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
} {
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const totalSeconds = Math.floor(absDiff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds, isPast };
}
