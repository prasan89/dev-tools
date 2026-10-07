import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Compress PDF — Reduce PDF File Size Free | DevToolsHub',
  description:
    'Reduce your PDF file size directly in your browser. No upload required — your PDF is processed locally and never sent to any server. Free, private, instant.',
  alternates: {
    canonical: siteUrl('/pdf-tools/compress-pdf'),
  },
  openGraph: {
    title: 'Compress PDF — Reduce PDF File Size Free | DevToolsHub',
    description:
      'Reduce your PDF file size directly in your browser. No upload required — your PDF is processed locally and never sent to any server.',
    url: siteUrl('/pdf-tools/compress-pdf'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

export default function CompressPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
