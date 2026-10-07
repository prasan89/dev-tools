import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to Word — Convert PDF to DOCX Free Online | DevToolsHub',
  description:
    'Convert PDF files to Word DOCX documents directly in your browser. Best-effort text and formatting extraction. No upload, no server — complete privacy.',
  keywords: [
    'PDF to Word',
    'PDF to DOCX',
    'convert PDF to Word',
    'free PDF to Word',
    'PDF Word converter online',
    'PDF to Word no upload',
    'convert PDF DOCX browser',
    'PDF to Word free',
    'extract text from PDF to Word',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/pdf-to-word'),
  },
  openGraph: {
    title: 'PDF to Word — Convert PDF to DOCX Free | DevToolsHub',
    description:
      'Convert PDF to Word DOCX in your browser. Text and basic formatting preserved. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-word'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF to Word Free Online | DevToolsHub',
    description: 'Convert PDF to DOCX in your browser. No upload, complete privacy.',
  },
};

export default function PdfToWordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
