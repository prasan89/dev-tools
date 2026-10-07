import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PowerPoint to PDF — Convert PPTX to PDF Free Online | DevToolsHub',
  description:
    'Convert PowerPoint PPTX files to PDF locally in your browser. Text-based conversion with no upload required. Fast, free and private.',
  keywords: [
    'PowerPoint to PDF',
    'PPTX to PDF',
    'convert PowerPoint to PDF',
    'free PowerPoint to PDF',
    'PPTX PDF converter',
    'online PPTX to PDF',
    'PowerPoint PDF no upload',
    'convert presentation to PDF',
    'PPTX to PDF free',
    'PowerPoint PDF browser',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/powerpoint-to-pdf'),
  },
  openGraph: {
    title: 'PowerPoint to PDF — Convert PPTX to PDF | DevToolsHub',
    description:
      'Convert PowerPoint presentations to PDF directly in your browser. No upload, no server — text content extracted locally.',
    url: siteUrl('/pdf-tools/powerpoint-to-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PowerPoint to PDF Free | DevToolsHub',
    description:
      'Convert PPTX to PDF in your browser. No upload required, 100% private.',
  },
};

export default function PowerpointToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
