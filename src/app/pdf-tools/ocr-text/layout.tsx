import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'OCR to Text — Extract Text from Scanned PDF with OCR | DevToolsHub',
  description:
    'Use OCR to extract text from scanned PDFs and images directly in your browser. Powered by Tesseract.js. 100% private — no uploads.',
  keywords: ['OCR to text', 'extract text scanned PDF', 'OCR text extraction', 'Tesseract OCR online', 'scan to text PDF'],
  alternates: { canonical: siteUrl('/pdf-tools/ocr-text') },
  openGraph: {
    title: 'OCR to Text — Extract Text from Scanned PDF | DevToolsHub',
    description: 'Extract text from scanned PDFs using OCR in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/ocr-text'),
    type: 'website',
  },
};

export default function OcrTextLayout({ children }: { children: React.ReactNode }) {
  return children;
}
