export const PDF_ERRORS = {
  PASSWORD_REQUIRED: 'PDF_PASSWORD_REQUIRED',
  PASSWORD_INCORRECT: 'PDF_PASSWORD_INCORRECT',
  PASSWORD_CANCELLED: 'PDF_PASSWORD_CANCELLED',
  ENCRYPTED_UNSUPPORTED: 'PDF_ENCRYPTED_UNSUPPORTED',
  INVALID: 'PDF_INVALID',
  CORRUPTED: 'PDF_CORRUPTED',
} as const;

export type PdfErrorCode = typeof PDF_ERRORS[keyof typeof PDF_ERRORS];

export class PdfError extends Error {
  constructor(public readonly code: PdfErrorCode, message: string) {
    super(message);
    this.name = 'PdfError';
  }
}
