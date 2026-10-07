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

export async function buildProtectedPdf(
  pdfFile: PdfFile,
  config: ProtectConfig,
): Promise<PdfToolResult> {
  if (!config.userPassword.trim()) {
    return { success: false, error: 'User password cannot be empty' };
  }

  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);

    const ownerPassword = config.ownerPassword.trim() || generateOwnerPassword();

    const saveOptions = {
      userPassword: config.userPassword,
      ownerPassword,
      permissions: {
        printing: config.allowPrinting ? 'highResolution' : 'notAllowed',
        copying: config.allowCopying,
        modifying: config.allowModifying,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    };
    const bytes = await pdfDoc.save(saveOptions as Parameters<typeof pdfDoc.save>[0]);

    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_protected.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to protect PDF' };
  }
}
