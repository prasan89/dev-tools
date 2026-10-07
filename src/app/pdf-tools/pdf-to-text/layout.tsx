import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to Text — Extract Text from PDF Online Free | DevToolsHub',
  description:
    'Extract all text from a PDF file instantly in your browser. Copy or download the extracted text. No uploads, complete privacy.',
  keywords: [
    'PDF to text',
    'extract text from PDF',
    'PDF text extractor',
    'PDF to TXT',
    'copy text from PDF',
    'PDF text extraction online',
    'extract PDF content',
    'PDF to plain text',
    'PDF text converter',
    'PDF text no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/pdf-to-text'),
  },
  openGraph: {
    title: 'PDF to Text — Extract Text from PDF | DevToolsHub',
    description:
      'Extract all text from a PDF in your browser. Copy or download as .txt. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-text'),
    type: 'website',
  },
};

export default function PdfToTextLayout({ children }: { children: React.ReactNode }) {
  return children;
}
