import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function parseRgb(s: string): [number, number, number] | null {
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return null;
  const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  if ([r, g, b].some((v) => v < 0 || v > 255)) return null;
  return [r, g, b];
}

function parseHsl(s: string): [number, number, number] | null {
  const m = s.match(/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/i);
  if (!m) return null;
  const h = parseFloat(m[1]), sat = parseFloat(m[2]), l = parseFloat(m[3]);
  if (h < 0 || h > 360 || sat < 0 || sat > 100 || l < 0 || l > 100) return null;
  return [Math.round(h), Math.round(sat), Math.round(l)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export const colorPickerProcessor: ToolProcessor = {
  inputLabel: 'Color Value',
  inputPlaceholder: 'Enter #hex, rgb(r,g,b), or hsl(h,s%,l%)…',
  autoProcess: true,
  exampleInput: '#1a73e8',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a color value (#hex, rgb(), or hsl()).' };

    let rgb: [number, number, number] | null = null;

    if (raw.startsWith('#')) {
      rgb = hexToRgb(raw);
    } else if (/^rgba?/i.test(raw)) {
      rgb = parseRgb(raw);
    } else if (/^hsla?/i.test(raw)) {
      const hsl = parseHsl(raw);
      if (hsl) rgb = hslToRgb(...hsl);
    }

    if (!rgb) {
      return {
        error:
          'Could not parse color. Use #RRGGBB, #RGB, rgb(r, g, b), or hsl(h, s%, l%).',
      };
    }

    const [r, g, b] = rgb;
    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);

    const output = [
      `HEX:  ${hex}`,
      `RGB:  rgb(${r}, ${g}, ${b})`,
      `HSL:  hsl(${h}, ${s}%, ${l}%)`,
      `RGBA: rgba(${r}, ${g}, ${b}, 1)`,
      `HSLA: hsla(${h}, ${s}%, ${l}%, 1)`,
    ].join('\n');

    return {
      output: {
        value: output,
        type: 'text',
        label: 'Color Conversions',
        copyable: true,
      },
      meta: {
        HEX: hex,
        RGB: `rgb(${r}, ${g}, ${b})`,
        HSL: `hsl(${h}, ${s}%, ${l}%)`,
      },
    };
  },
};
