import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Web Page to PDF — Save Website as PDF Online Free | DevToolsHub',
  description:
    'Convert a web page or HTML source to PDF in your browser. Paste a URL for print instructions or convert HTML source directly. No uploads, complete privacy.',
  keywords: [
    'web page to PDF',
    'URL to PDF',
    'save webpage as PDF',
    'HTML to PDF',
    'website to PDF',
    'convert URL to PDF',
    'save web page PDF',
    'webpage PDF converter',
    'browser PDF',
    'HTML source to PDF',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/webpage-to-pdf'),
  },
  openGraph: {
    title: 'Web Page to PDF — Save Website as PDF | DevToolsHub',
    description:
      'Convert a web page or HTML source to PDF in your browser. Browser-based, no uploads.',
    url: siteUrl('/pdf-tools/webpage-to-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Web Page to PDF Online Free | DevToolsHub',
    description: 'Save a web page as PDF. URL guide or HTML source conversion. Browser-based.',
  },
};

export default function WebPageToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
