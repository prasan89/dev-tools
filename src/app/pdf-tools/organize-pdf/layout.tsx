import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Organize PDF — Rotate, Delete & Reorder Pages | DevToolsHub',
  description:
    'Rotate, delete, and reorder PDF pages entirely in your browser. Drag and drop to rearrange, rotate individual or all pages, remove unwanted pages. Your PDF is never uploaded — 100% private.',
  keywords: [
    'organize PDF',
    'rotate PDF pages',
    'delete PDF pages',
    'reorder PDF pages',
    'rearrange PDF pages',
    'PDF page organizer',
    'PDF editor online',
    'free PDF organizer',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/organize-pdf'),
  },
  openGraph: {
    title: 'Organize PDF — Rotate, Delete & Reorder Pages | DevToolsHub',
    description:
      'Rotate, delete, and reorder PDF pages entirely in your browser. 100% private — your PDF stays on your device.',
    url: siteUrl('/pdf-tools/organize-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Organize PDF — Rotate, Delete & Reorder Pages | DevToolsHub',
    description:
      'Rotate, delete, and reorder PDF pages entirely in your browser. Your PDF is never uploaded.',
  },
};

export default function OrganizePdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
