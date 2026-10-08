import type { PdfFile, PdfToolResult } from '@/types/pdf';

export interface ProtectConfig {
  userPassword: string;
  ownerPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifying: boolean;
}

export function defaultProtectConfig(): ProtectConfig {
  return {
    userPassword: '',
    ownerPassword: '',
    allowPrinting: true,
    allowCopying: false,
    allowModifying: false,
  };
}

export function generateOwnerPassword(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// pdf-lib v1.17.1 does not implement PDF encryption.
// Passing userPassword/ownerPassword to pdfDoc.save() is silently ignored.
// This function returns an honest error rather than producing a fake "protected" PDF.
export async function buildProtectedPdf(
  _pdfFile: PdfFile,
  _config: ProtectConfig,
): Promise<PdfToolResult> {
  return {
    success: false,
    error:
      'PDF encryption is not supported in this browser-based tool. The pdf-lib library (v1.17.1) does not implement PDF encryption. This feature requires an updated library.',
  };
}
