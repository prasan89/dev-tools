'use client';

import { useCallback, useState } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import type { PdfFile } from '@/types/pdf';

export default function PdfViewerPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);

  const handleFilesSelected = useCallback((files: PdfFile[]) => {
    if (files.length > 0) setPdfFile(files[0]);
  }, []);

  const handleClose = useCallback(() => setPdfFile(null), []);

  return (
    <PdfToolLayout
      title="PDF Viewer"
      description="View and navigate PDF files directly in your browser. No upload required — your file never leaves your device."
    >
      {!pdfFile ? (
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          multiple={false}
          className="mt-2"
        />
      ) : (
        <PdfViewer
          pdfFile={pdfFile}
          onClose={handleClose}
          className="min-h-[600px]"
        />
      )}
    </PdfToolLayout>
  );
}
