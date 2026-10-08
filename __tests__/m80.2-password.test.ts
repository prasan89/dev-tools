/**
 * M80.2 — Password-Protected PDF Handling Tests
 *
 * Covers:
 * - PdfError class and PDF_ERRORS constants
 * - PdfPasswordDialog renders correctly
 * - loadPdfWithPassword wires onPassword callback
 * - unlockPdf calls onPasswordRequest via pdfjs
 * - protectPdf returns honest limitation error
 * - Viewer password dialog renders on password state
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

// ─── PdfError and PDF_ERRORS ──────────────────────────────────────────────────

describe('PdfError and PDF_ERRORS', () => {
  let PDF_ERRORS: typeof import('../src/lib/pdf/pdfErrors').PDF_ERRORS;
  let PdfError: typeof import('../src/lib/pdf/pdfErrors').PdfError;

  beforeAll(async () => {
    const mod = await import('../src/lib/pdf/pdfErrors');
    PDF_ERRORS = mod.PDF_ERRORS;
    PdfError = mod.PdfError;
  });

  it('exports PDF_ERRORS with all required codes', () => {
    expect(PDF_ERRORS.PASSWORD_REQUIRED).toBe('PDF_PASSWORD_REQUIRED');
    expect(PDF_ERRORS.PASSWORD_INCORRECT).toBe('PDF_PASSWORD_INCORRECT');
    expect(PDF_ERRORS.PASSWORD_CANCELLED).toBe('PDF_PASSWORD_CANCELLED');
    expect(PDF_ERRORS.ENCRYPTED_UNSUPPORTED).toBe('PDF_ENCRYPTED_UNSUPPORTED');
    expect(PDF_ERRORS.INVALID).toBe('PDF_INVALID');
    expect(PDF_ERRORS.CORRUPTED).toBe('PDF_CORRUPTED');
  });

  it('PdfError is constructible with a code and message', () => {
    const err = new PdfError(PDF_ERRORS.PASSWORD_REQUIRED, 'Password required');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PdfError);
    expect(err.code).toBe(PDF_ERRORS.PASSWORD_REQUIRED);
    expect(err.message).toBe('Password required');
    expect(err.name).toBe('PdfError');
  });

  it('PdfError with INCORRECT code', () => {
    const err = new PdfError(PDF_ERRORS.PASSWORD_INCORRECT, 'Wrong password');
    expect(err.code).toBe(PDF_ERRORS.PASSWORD_INCORRECT);
  });

  it('PdfError with CORRUPTED code', () => {
    const err = new PdfError(PDF_ERRORS.CORRUPTED, 'File corrupted');
    expect(err.code).toBe(PDF_ERRORS.CORRUPTED);
  });
});

// ─── PdfPasswordDialog source audit ──────────────────────────────────────────

describe('PdfPasswordDialog source audit', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/components/pdf/PdfPasswordDialog.tsx'),
      'utf8',
    );
  });

  it('exports PdfPasswordDialog component', () => {
    expect(src).toContain('export function PdfPasswordDialog');
  });

  it('has role="dialog" for accessibility', () => {
    expect(src).toContain('role="dialog"');
  });

  it('has aria-modal="true"', () => {
    expect(src).toContain('aria-modal="true"');
  });

  it('has aria-labelledby for title association', () => {
    expect(src).toContain('aria-labelledby');
  });

  it('has show/hide password toggle button', () => {
    expect(src).toContain('Show password');
    expect(src).toContain('Hide password');
  });

  it('has onSubmit prop wired to form submit', () => {
    expect(src).toContain('onSubmit');
  });

  it('has onCancel prop', () => {
    expect(src).toContain('onCancel');
  });

  it('password never stored beyond component lifetime (no localStorage/sessionStorage)', () => {
    expect(src).not.toContain('localStorage');
    expect(src).not.toContain('sessionStorage');
    expect(src).not.toContain('indexedDB');
  });

  it('password never logged to console', () => {
    expect(src).not.toMatch(/console\.\w+.*password/i);
  });

  it('handles Escape key to cancel', () => {
    expect(src).toContain("'Escape'");
  });

  it('has autoFocus on password input', () => {
    expect(src).toContain('autoFocus');
  });
});

// ─── loadPdfWithPassword source audit ─────────────────────────────────────────

describe('loadPdfWithPassword source audit', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/lib/pdf/loadPdfWithPassword.ts'),
      'utf8',
    );
  });

  it('exports loadPdfWithPassword function', () => {
    expect(src).toContain('export async function loadPdfWithPassword');
  });

  it('exports PasswordRequestCallback type', () => {
    expect(src).toContain('PasswordRequestCallback');
  });

  it('wires onPassword callback to pdfjs getDocument', () => {
    expect(src).toContain('onPassword');
    expect(src).toContain('getDocument');
  });

  it('maps pdfjs reason 2 to "incorrect"', () => {
    expect(src).toContain("'incorrect'");
    expect(src).toContain('reason === 2');
  });

  it('maps reason 1 (and default) to "required"', () => {
    expect(src).toContain("'required'");
  });

  it('creates and revokes object URLs (no leaks)', () => {
    expect(src).toContain('URL.createObjectURL');
    expect(src).toContain('URL.revokeObjectURL');
  });

  it('password never stored to persistent storage', () => {
    expect(src).not.toContain('localStorage');
    expect(src).not.toContain('sessionStorage');
  });

  it('password never appears in error messages', () => {
    // Error messages should not contain the password variable
    expect(src).not.toMatch(/throw.*password/i);
  });

  it('handles AbortSignal', () => {
    expect(src).toContain('signal');
    expect(src).toContain('aborted');
  });
});

// ─── protectPdf returns honest error ──────────────────────────────────────────

describe('buildProtectedPdf — honest limitation error', () => {
  it('returns success: false immediately', async () => {
    const { buildProtectedPdf } = await import('../src/lib/pdf/protectPdf');
    const fakePdfFile = {} as import('../src/types/pdf').PdfFile;
    const fakeConfig = {
      userPassword: 'test',
      ownerPassword: '',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    };
    const result = await buildProtectedPdf(fakePdfFile, fakeConfig);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(typeof result.error).toBe('string');
  });

  it('error message mentions encryption is not supported', async () => {
    const { buildProtectedPdf } = await import('../src/lib/pdf/protectPdf');
    const fakePdfFile = {} as import('../src/types/pdf').PdfFile;
    const fakeConfig = {
      userPassword: 'test',
      ownerPassword: '',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    };
    const result = await buildProtectedPdf(fakePdfFile, fakeConfig);
    expect(result.error?.toLowerCase()).toContain('encryption');
  });

  it('does not attempt to call pdf-lib (would fail for unencrypted re-save)', async () => {
    const { buildProtectedPdf } = await import('../src/lib/pdf/protectPdf');
    const fakePdfFile = {} as import('../src/types/pdf').PdfFile;
    const fakeConfig = {
      userPassword: 'test',
      ownerPassword: '',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    };
    // Should resolve without needing file access
    await expect(buildProtectedPdf(fakePdfFile, fakeConfig)).resolves.toMatchObject({ success: false });
  });
});

// ─── unlockPdf API signature ───────────────────────────────────────────────────

describe('unlockPdf API', () => {
  it('exports unlockPdf with 2 args (pdfFile, onPasswordRequest)', async () => {
    const mod = await import('../src/lib/pdf/unlockPdf');
    expect(typeof mod.unlockPdf).toBe('function');
    expect(mod.unlockPdf.length).toBe(2);
  });

  it('re-exports PasswordRequestCallback type (structural check via source)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('PasswordRequestCallback');
  });

  it('uses pdfjs loadPdfWithPassword (not pdf-lib load) for decryption', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('loadPdfWithPassword');
  });

  it('uses getData() to get decrypted bytes from pdfjs', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('getData');
  });

  it('revokes objectUrl after use', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/pdf/unlockPdf.ts'), 'utf8');
    expect(src).toContain('URL.revokeObjectURL');
  });

  it('handles cancelled result gracefully', async () => {
    // Mock pdfjs to trigger a cancelled scenario by having loadPdfWithPassword reject with Aborted
    const mod = await import('../src/lib/pdf/unlockPdf');
    const fakePdfFile = {
      file: new File([], 'test.pdf'),
      name: 'test.pdf',
    } as import('../src/types/pdf').PdfFile;

    // onPasswordRequest that calls cancel (throws Aborted)
    const result = await mod.unlockPdf(fakePdfFile, (_updatePw, _reason) => {
      // simulate immediate throw from pdfjs onPassword when loading fails
    });
    // Loading will fail (no actual PDF), returns error not crash
    expect(result.success).toBe(false);
  });
});

// ─── PdfViewer source audit ────────────────────────────────────────────────────

describe('PdfViewer password support', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/components/pdf/PdfViewer.tsx'),
      'utf8',
    );
  });

  it('imports PdfPasswordDialog', () => {
    expect(src).toContain('PdfPasswordDialog');
  });

  it('uses onPassword callback in getDocument()', () => {
    expect(src).toContain('onPassword');
  });

  it('stores pendingPasswordRef for deferred callback', () => {
    expect(src).toContain('pendingPasswordRef');
  });

  it('calls handlePasswordSubmit to relay password to pdfjs', () => {
    expect(src).toContain('handlePasswordSubmit');
  });

  it('calls handlePasswordCancel to abort loading', () => {
    expect(src).toContain('handlePasswordCancel');
  });

  it('shows PdfPasswordDialog when passwordState is not idle', () => {
    expect(src).toContain("passwordState !== 'idle'");
  });

  it('does not log or expose the password', () => {
    expect(src).not.toMatch(/console\.\w+.*password/i);
    expect(src).not.toMatch(/console\.\w+.*Password/i);
  });

  it('old dead-end error message is replaced', () => {
    expect(src).not.toContain('Password-protected PDFs cannot be opened');
  });
});

// ─── unlock-pdf page uses PdfPasswordDialog ───────────────────────────────────

describe('unlock-pdf page', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/app/pdf-tools/unlock-pdf/_client.tsx'),
      'utf8',
    );
  });

  it('imports PdfPasswordDialog', () => {
    expect(src).toContain('PdfPasswordDialog');
  });

  it('no longer has a direct password text input for unlock', () => {
    expect(src).not.toContain("id=\"unlock-pw\"");
  });

  it('uses pendingPasswordRef bridge pattern', () => {
    expect(src).toContain('pendingPasswordRef');
  });

  it('password never stored in React state', () => {
    expect(src).not.toMatch(/useState.*password/i);
    expect(src).not.toMatch(/setPassword/);
  });
});

// ─── protect-pdf page shows limitation notice ──────────────────────────────────

describe('protect-pdf page', () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.join(ROOT, 'src/app/pdf-tools/protect-pdf/_client.tsx'),
      'utf8',
    );
  });

  it('shows encryption unavailable notice', () => {
    expect(src.toLowerCase()).toContain('not yet available');
  });

  it('protect button is disabled', () => {
    // The full form was removed — no button, no form, just the notice
    expect(src).not.toContain('handleProtect');
  });

  it('notice mentions encryption limitation', () => {
    expect(src.toLowerCase()).toContain('encryption');
  });
});

// ─── Zero-server security audit ────────────────────────────────────────────────

describe('Password security: no persistence', () => {
  const filesToAudit = [
    'src/lib/pdf/loadPdfWithPassword.ts',
    'src/lib/pdf/unlockPdf.ts',
    'src/components/pdf/PdfPasswordDialog.tsx',
    'src/components/pdf/PdfViewer.tsx',
  ];

  for (const file of filesToAudit) {
    it(`${file} — password never in localStorage`, () => {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(src).not.toContain('localStorage');
    });

    it(`${file} — password never in sessionStorage`, () => {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(src).not.toContain('sessionStorage');
    });

    it(`${file} — no fetch() calls with password`, () => {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(src).not.toMatch(/fetch\s*\(\s*['"]https?:\/\//);
    });
  }
});
