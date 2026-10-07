import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF — Number PDF Pages Online Free | DevToolsHub',
  description:
    'Add page numbers to any PDF directly in your browser. Choose position, format, font, size, and which pages to number. 100% private — your PDF never leaves your device.',
  keywords: [
    'add page numbers to PDF',
    'number PDF pages',
    'PDF page numbering',
    'PDF page numbers online',
    'add page numbers PDF free',
    'PDF page number tool',
    'PDF numbering browser',
    'insert page numbers PDF',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/page-numbers'),
  },
  openGraph: {
    title: 'Add Page Numbers to PDF | DevToolsHub',
    description:
      'Add page numbers to PDF pages in your browser. Choose format, position, font, and page selection. Never uploaded.',
    url: siteUrl('/pdf-tools/page-numbers'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Add Page Numbers to PDF Online Free | DevToolsHub',
    description: 'Number PDF pages in your browser. Choose position, format, and font. Export locally — never uploaded.',
  },
};

export default function PageNumbersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
