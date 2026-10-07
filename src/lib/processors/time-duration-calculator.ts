import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { timeDuration } from '../datetime/durations';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isValidTimeString(s: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(s);
}

export const timeDurationCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Start Time (HH:MM or HH:MM:SS)',
  secondaryInputLabel: 'End Time (HH:MM or HH:MM:SS)',
  inputPlaceholder: 'e.g. 09:00',
  hasSecondaryInput: true,
  autoProcess: true,
  exampleInput: '09:00',
  exampleSecondary: '17:30',

  process(input: ToolInput): ToolResult {
    const startRaw = input.value.trim();
    const endRaw = (input.secondary ?? '').trim();

    if (!startRaw) return { error: 'Enter a start time (HH:MM or HH:MM:SS).' };
    if (!endRaw) return { error: 'Enter an end time (HH:MM or HH:MM:SS).' };

    if (!isValidTimeString(startRaw)) {
      return { error: `Invalid start time: "${startRaw}". Expected HH:MM or HH:MM:SS.` };
    }
    if (!isValidTimeString(endRaw)) {
      return { error: `Invalid end time: "${endRaw}". Expected HH:MM or HH:MM:SS.` };
    }

    let result: ReturnType<typeof timeDuration>;
    try {
      result = timeDuration(startRaw, endRaw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Time parse error: ${msg}` };
    }

    const { hours, minutes, seconds, totalSeconds, totalMinutes, totalHours, crossesMidnight } = result;

    const hh = pad2(hours);
    const mm = pad2(minutes);
    const ss = pad2(seconds);

    const lines = [
      `Start time:       ${startRaw}`,
      `End time:         ${endRaw}`,
      ...(crossesMidnight ? [`Note:             Duration crosses midnight.`] : []),
      ``,
      `Duration`,
      `  Hours:          ${hours}`,
      `  Minutes:        ${minutes}`,
      `  Seconds:        ${seconds}`,
      `  HH:MM:SS:       ${hh}:${mm}:${ss}`,
      ``,
      `Total`,
      `  Total hours:    ${totalHours.toLocaleString()}`,
      `  Total minutes:  ${totalMinutes.toLocaleString()}`,
      `  Total seconds:  ${totalSeconds.toLocaleString()}`,
    ];

    const labelParts: string[] = [];
    if (hours > 0)   labelParts.push(`${hours}h`);
    if (minutes > 0) labelParts.push(`${minutes}m`);
    if (seconds > 0) labelParts.push(`${seconds}s`);
    const label = labelParts.length > 0 ? labelParts.join(' ') : '0s';

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Duration: ${label}${crossesMidnight ? ' (crosses midnight)' : ''}`,
        copyable: true,
      },
      meta: {
        hours,
        minutes,
        seconds,
        'total seconds': totalSeconds,
        'crosses midnight': crossesMidnight ? 'yes' : 'no',
      },
    };
  },
};
