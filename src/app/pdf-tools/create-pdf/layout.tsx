import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Create Blank PDF — New PDF Document Online Free | DevToolsHub',
  description:
    'Create a new blank PDF document from scratch. Choose page size, orientation, number of pages, and background color. Runs entirely in your browser — no uploads.',
  keywords: [
    'create PDF',
    'create blank PDF',
    'new PDF document',
    'blank PDF generator',
    'create PDF online',
    'new PDF file',
    'PDF creator free',
    'generate blank PDF',
    'create empty PDF',
    'PDF document creator',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/create-pdf'),
  },
  openGraph: {
    title: 'Create Blank PDF Online Free | DevToolsHub',
    description: 'Generate a new blank PDF with your chosen page size and settings. Browser-based, no upload.',
    url: siteUrl('/pdf-tools/create-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Create Blank PDF Free | DevToolsHub',
    description: 'Create a new blank PDF document in your browser. Choose size, orientation, pages.',
  },
};

export default function CreatePdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
