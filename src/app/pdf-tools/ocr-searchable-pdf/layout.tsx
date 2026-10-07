import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'OCR to Searchable PDF — Make Scanned PDF Searchable Online Free | DevToolsHub',
  description:
    'Add a searchable text layer to scanned PDFs using OCR directly in your browser. Powered by Tesseract.js and pdf-lib. 100% private — no uploads.',
  keywords: ['OCR searchable PDF', 'make PDF searchable', 'add text layer PDF', 'scanned PDF searchable', 'OCR PDF online'],
  alternates: { canonical: siteUrl('/pdf-tools/ocr-searchable-pdf') },
  openGraph: {
    title: 'OCR to Searchable PDF | DevToolsHub',
    description: 'Make scanned PDFs searchable in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/ocr-searchable-pdf'),
    type: 'website',
  },
};

export default function OcrSearchablePdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
