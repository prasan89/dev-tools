import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Split PDF — Extract Pages & Split PDF Files Free | DevToolsHub',
  description:
    'Split a PDF into individual pages, extract page ranges, or divide it into multiple parts — all directly in your browser. No upload required, completely private.',
  alternates: {
    canonical: siteUrl('/pdf-tools/split-pdf'),
  },
  openGraph: {
    title: 'Split PDF — Extract Pages & Split PDF Files Free | DevToolsHub',
    description:
      'Split a PDF into individual pages, extract page ranges, or divide it into multiple parts — all directly in your browser. No upload required.',
    url: siteUrl('/pdf-tools/split-pdf'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

export default function SplitPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
