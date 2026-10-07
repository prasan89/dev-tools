import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF/A Converter — Convert PDF to PDF/A Online Free | DevToolsHub',
  description:
    'Convert PDF files to PDF/A format for long-term archiving. Re-serializes and adds conformance metadata. Runs entirely in your browser — no uploads.',
  keywords: [
    'PDF/A converter',
    'convert PDF to PDF/A',
    'PDF archiving',
    'PDF/A-1b',
    'PDF/A-2b',
    'PDF/A-3b',
    'long-term PDF archiving',
    'PDF ISO 19005',
    'PDF/A online free',
    'PDF archive format',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/pdf-a'),
  },
  openGraph: {
    title: 'PDF/A Converter — Convert PDF for Long-Term Archiving | DevToolsHub',
    description: 'Convert PDF to PDF/A-1b, -2b, or -3b in your browser. No uploads, complete privacy.',
    url: siteUrl('/pdf-tools/pdf-a'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF/A Converter Online Free | DevToolsHub',
    description: 'Convert PDF to PDF/A format for archiving. Browser-based, no upload.',
  },
};

export default function PdfALayout({ children }: { children: React.ReactNode }) {
  return children;
}
