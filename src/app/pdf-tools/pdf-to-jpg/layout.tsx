import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG / PNG Converter — DevToolsHub',
  description:
    'Convert PDF pages to JPG or PNG images instantly in your browser. Choose resolution, quality, and which pages to export. No file upload — your PDF never leaves your device.',
  keywords: [
    'pdf to jpg',
    'pdf to png',
    'pdf to image',
    'convert pdf to jpeg',
    'pdf image export',
    'browser pdf converter',
    'offline pdf tool',
  ],
  openGraph: {
    title: 'PDF to JPG / PNG Converter — DevToolsHub',
    description:
      'Export PDF pages as high-quality JPG or PNG images. Runs entirely in your browser with no server upload.',
    type: 'website',
  },
};

export default function PdfToJpgLayout({ children }: { children: React.ReactNode }) {
  return children;
}
