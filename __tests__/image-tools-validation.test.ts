/**
 * Tests for image-tools validation module.
 */

import {
  validateImageFile,
  validateDimension,
  sanitizeFilename,
  changeExtension,
  detectFormatFromBytes,
  formatFromMime,
  MAX_FILE_SIZE,
  ACCEPTED_EXTENSIONS,
} from '@/lib/image-tools/validation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size).fill(0);
  return new File([content], name, { type });
}

function makeJpegFile(name = 'test.jpg', size = 1000): File {
  return makeFile(name, size, 'image/jpeg');
}

function makePngFile(name = 'test.png', size = 1000): File {
  return makeFile(name, size, 'image/png');
}

function makeWebPFile(name = 'test.webp', size = 1000): File {
  return makeFile(name, size, 'image/webp');
}

// ─── validateImageFile ────────────────────────────────────────────────────────

describe('validateImageFile', () => {
  it('accepts a valid JPEG by MIME type', () => {
    expect(validateImageFile(makeJpegFile()).valid).toBe(true);
  });

  it('accepts a valid PNG by MIME type', () => {
    expect(validateImageFile(makePngFile()).valid).toBe(true);
  });

  it('accepts a valid WebP by MIME type', () => {
    expect(validateImageFile(makeWebPFile()).valid).toBe(true);
  });

  it('accepts a JPEG by extension when MIME is empty', () => {
    const f = makeFile('photo.jpg', 100, '');
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('accepts a PNG by extension when MIME is empty', () => {
    const f = makeFile('photo.png', 100, '');
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('accepts .jpeg extension', () => {
    const f = makeFile('photo.jpeg', 100, '');
    expect(validateImageFile(f).valid).toBe(true);
  });

  it('rejects empty files', () => {
    const f = makeFile('empty.jpg', 0, 'image/jpeg');
    const result = validateImageFile(f);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('empty-file');
  });

  it('rejects files exceeding MAX_FILE_SIZE', () => {
    const f = makeFile('big.jpg', MAX_FILE_SIZE + 1, 'image/jpeg');
    const result = validateImageFile(f);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('file-too-large');
  });

  it('rejects unsupported MIME types with unsupported extension', () => {
    const f = makeFile('doc.pdf', 100, 'application/pdf');
    const result = validateImageFile(f);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('unsupported-format');
  });

  it('rejects a GIF file', () => {
    const f = makeFile('anim.gif', 200, 'image/gif');
    const result = validateImageFile(f);
    expect(result.valid).toBe(false);
  });

  it('rejects a BMP file', () => {
    const f = makeFile('photo.bmp', 200, 'image/bmp');
    const result = validateImageFile(f);
    expect(result.valid).toBe(false);
  });
});

// ─── validateDimension ────────────────────────────────────────────────────────

describe('validateDimension', () => {
  it('returns null for valid dimensions', () => {
    expect(validateDimension(1)).toBeNull();
    expect(validateDimension(100)).toBeNull();
    expect(validateDimension(16384)).toBeNull();
  });

  it('returns error for 0', () => {
    expect(validateDimension(0)).not.toBeNull();
  });

  it('returns error for negative values', () => {
    expect(validateDimension(-1)).not.toBeNull();
  });

  it('returns error for values exceeding MAX_DIMENSION', () => {
    expect(validateDimension(16385)).not.toBeNull();
  });

  it('returns error for NaN', () => {
    expect(validateDimension(NaN)).not.toBeNull();
  });

  it('returns error for Infinity', () => {
    expect(validateDimension(Infinity)).not.toBeNull();
  });
});

// ─── sanitizeFilename ─────────────────────────────────────────────────────────

describe('sanitizeFilename', () => {
  it('strips path separators', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
  });

  it('strips backslash paths', () => {
    expect(sanitizeFilename('C:\\Users\\test\\photo.jpg')).toBe('photo.jpg');
  });

  it('returns fallback for empty string', () => {
    expect(sanitizeFilename('')).toBe('image');
  });

  it('strips null bytes', () => {
    expect(sanitizeFilename('file\x00name.jpg')).toBe('filename.jpg');
  });

  it('preserves normal filenames', () => {
    expect(sanitizeFilename('photo.jpg')).toBe('photo.jpg');
  });
});

// ─── changeExtension ──────────────────────────────────────────────────────────

describe('changeExtension', () => {
  it('replaces JPEG extension with PNG', () => {
    expect(changeExtension('photo.jpg', '.png')).toBe('photo.png');
  });

  it('replaces PNG extension with WebP', () => {
    expect(changeExtension('image.png', '.webp')).toBe('image.webp');
  });

  it('handles filenames without extension', () => {
    expect(changeExtension('noext', '.jpg')).toBe('noext.jpg');
  });
});

// ─── formatFromMime ───────────────────────────────────────────────────────────

describe('formatFromMime', () => {
  it('maps image/jpeg to jpeg', () => expect(formatFromMime('image/jpeg')).toBe('jpeg'));
  it('maps image/png to png', () => expect(formatFromMime('image/png')).toBe('png'));
  it('maps image/webp to webp', () => expect(formatFromMime('image/webp')).toBe('webp'));
  it('returns null for unknown MIME', () => expect(formatFromMime('image/gif')).toBeNull());
});

// ─── detectFormatFromBytes ────────────────────────────────────────────────────

describe('detectFormatFromBytes', () => {
  function makeBufferFile(magic: number[], name: string, type: string): File {
    const rest = new Array(20).fill(0);
    const bytes = new Uint8Array([...magic, ...rest]);
    return new File([bytes], name, { type });
  }

  // jsdom Blob.arrayBuffer is not implemented in all versions;
  // polyfill it for these tests via FileReader
  beforeAll(() => {
    if (!Blob.prototype.arrayBuffer) {
      Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(this);
        });
      };
    }
  });

  it('detects JPEG from magic bytes', async () => {
    const f = makeBufferFile([0xff, 0xd8, 0xff, 0xe0], 'test.jpg', 'image/jpeg');
    expect(await detectFormatFromBytes(f)).toBe('jpeg');
  });

  it('detects PNG from magic bytes', async () => {
    const f = makeBufferFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'test.png', 'image/png');
    expect(await detectFormatFromBytes(f)).toBe('png');
  });

  it('returns null for unrecognized bytes', async () => {
    const f = makeBufferFile([0x00, 0x01, 0x02, 0x03], 'unknown.bin', '');
    expect(await detectFormatFromBytes(f)).toBeNull();
  });
});

// ─── ACCEPTED_EXTENSIONS constant ────────────────────────────────────────────

describe('ACCEPTED_EXTENSIONS', () => {
  it('includes jpg, jpeg, png, webp', () => {
    expect(ACCEPTED_EXTENSIONS).toContain('.jpg');
    expect(ACCEPTED_EXTENSIONS).toContain('.jpeg');
    expect(ACCEPTED_EXTENSIONS).toContain('.png');
    expect(ACCEPTED_EXTENSIONS).toContain('.webp');
  });
});
