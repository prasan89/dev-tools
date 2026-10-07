import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'HTML to PDF — Convert HTML to PDF Online Free | DevToolsHub',
  description:
    'Convert HTML content to a PDF document in your browser. Paste or type HTML — headings, paragraphs, and lists are preserved. No uploads, 100% private.',
  keywords: [
    'HTML to PDF',
    'convert HTML to PDF',
    'HTML PDF converter',
    'HTML to PDF online',
    'HTML to PDF free',
    'convert webpage to PDF',
    'HTML PDF generator',
    'HTML to PDF browser',
    'HTML to PDF no upload',
    'online HTML PDF converter',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/html-to-pdf') },
  openGraph: {
    title: 'HTML to PDF — Convert HTML to PDF Online | DevToolsHub',
    description: 'Convert HTML to PDF in your browser. No uploads, complete privacy.',
    url: siteUrl('/pdf-tools/html-to-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'HTML to PDF Online Free | DevToolsHub',
    description: 'Convert HTML to PDF. Browser-based, no upload.',
  },
};

export default function HtmlToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
