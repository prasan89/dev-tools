'use client';

import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';

export default function ProtectPdfPage() {
  return (
    <PdfToolLayout
      title="Password Protect PDF"
      description="Encrypt your PDF with a password. Processed entirely in your browser — your file never leaves your device."
    >
      <div
        role="alert"
        className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1"
      >
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          PDF encryption not yet available
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          PDF password protection requires encryption support that is not yet available in the
          browser-based version of this tool. The underlying PDF library (pdf-lib v1.17.1) does not
          implement PDF encryption. We are working on adding this feature.
        </p>
      </div>
    </PdfToolLayout>
  );
}
