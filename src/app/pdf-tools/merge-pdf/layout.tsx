import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Merge PDF — Combine PDF Files Online Free | DevToolsHub',
  description:
    'Merge multiple PDF files into one document directly in your browser. Free, private, no upload required. Drag to reorder pages before merging.',
  alternates: {
    canonical: siteUrl('/pdf-tools/merge-pdf'),
  },
  openGraph: {
    title: 'Merge PDF — Combine PDF Files Online Free | DevToolsHub',
    description:
      'Merge multiple PDF files into one document directly in your browser. Free, private, no upload required.',
    url: siteUrl('/pdf-tools/merge-pdf'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

export default function MergePdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
