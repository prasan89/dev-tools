import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Compare PDF Files — PDF Diff Tool Online Free | DevToolsHub',
  description:
    'Compare two PDF files side by side and find text differences. Browser-based PDF comparison — no uploads, no servers, complete privacy.',
  keywords: [
    'compare PDF files',
    'PDF diff tool',
    'PDF comparison',
    'compare PDF online',
    'PDF text diff',
    'find differences in PDF',
    'PDF compare free',
    'PDF side by side comparison',
    'PDF changes finder',
    'compare PDF no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/compare-pdf'),
  },
  openGraph: {
    title: 'Compare PDF Files — PDF Diff Tool | DevToolsHub',
    description:
      'Find text differences between two PDFs in your browser. Side-by-side comparison, never uploaded.',
    url: siteUrl('/pdf-tools/compare-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Compare PDF Files Online Free | DevToolsHub',
    description: 'Compare two PDFs and find text differences. Browser-based, no upload.',
  },
};

export default function ComparePdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
