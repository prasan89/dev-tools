import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/~';
const AMBIGUOUS = /[0O1Il]/g;

// Pick a random index in [0, max) using crypto.getRandomValues — no Math.random()
function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function pickRandom(charset: string): string {
  return charset[randomIndex(charset.length)];
}

function shuffle(arr: string[]): string[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const passwordGeneratorProcessor: ToolProcessor = {
  inputLabel: 'Length',
  inputPlaceholder: 'Password length (8–128)',
  autoProcess: false,
  exampleInput: '20',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    const length = raw === '' ? 16 : parseInt(raw, 10);

    if (isNaN(length) || length < 8 || length > 128) {
      return { error: 'Length must be between 8 and 128.' };
    }

    const opts = input.options ?? {};
    const useUpper   = opts['uppercase']         !== false;
    const useLower   = opts['lowercase']         !== false;
    const useDigits  = opts['digits']            !== false;
    const useSymbols = opts['symbols']           !== false;
    const noAmbig    = Boolean(opts['excludeAmbiguous']);

    // Build charset pools
    let upper   = useUpper   ? UPPER   : '';
    let lower   = useLower   ? LOWER   : '';
    let digits  = useDigits  ? DIGITS  : '';
    let symbols = useSymbols ? SYMBOLS : '';

    if (noAmbig) {
      upper   = upper.replace(AMBIGUOUS, '');
      lower   = lower.replace(AMBIGUOUS, '');
      digits  = digits.replace(AMBIGUOUS, '');
    }

    const activePools = [upper, lower, digits, symbols].filter((p) => p.length > 0);
    if (activePools.length === 0) {
      return { error: 'Select at least one character set.' };
    }

    const fullCharset = activePools.join('');

    // Guarantee at least one character from each active pool
    const required = activePools.map((pool) => pickRandom(pool));
    if (required.length > length) {
      return { error: 'Length is too short to satisfy all selected character sets.' };
    }

    const remaining = Array.from({ length: length - required.length }, () => pickRandom(fullCharset));
    const password = shuffle([...required, ...remaining]).join('');

    return {
      output: {
        value: password,
        type: 'text',
        label: 'Generated Password',
        copyable: true,
      },
      meta: {
        length: password.length,
        sets: activePools.length,
      },
    };
  },
};
