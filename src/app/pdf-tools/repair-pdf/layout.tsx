import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Repair PDF — Fix Corrupted PDF Online Free | DevToolsHub',
  description:
    'Repair and fix corrupted PDF files by re-serializing them in your browser. May fix structural issues, cross-reference errors. No uploads — complete privacy.',
  keywords: [
    'repair PDF',
    'fix corrupt PDF',
    'PDF repair tool',
    'fix broken PDF',
    'repair corrupted PDF',
    'PDF fix online',
    'recover PDF',
    'PDF structure repair',
    'fix PDF errors',
    'repair PDF no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/repair-pdf'),
  },
  openGraph: {
    title: 'Repair PDF — Fix Corrupted PDF Online | DevToolsHub',
    description: 'Fix corrupted PDFs by re-serializing in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/repair-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Repair PDF Online Free | DevToolsHub',
    description: 'Fix corrupted PDF files in your browser. No upload, complete privacy.',
  },
};

export default function RepairPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
