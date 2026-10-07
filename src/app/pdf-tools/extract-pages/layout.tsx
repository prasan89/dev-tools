import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Extract PDF Pages — Save Specific Pages as New PDF | DevToolsHub',
  description:
    'Extract specific pages or page ranges from any PDF and save them as a new file. Select pages visually or enter ranges like 1-5,8,10-12. Your PDF is never uploaded — 100% private.',
  keywords: [
    'extract PDF pages',
    'PDF page extractor',
    'save pages from PDF',
    'PDF page range',
    'split PDF pages',
    'select PDF pages',
    'free PDF extractor',
    'browser PDF extract',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/extract-pages'),
  },
  openGraph: {
    title: 'Extract PDF Pages — Save Specific Pages as New PDF | DevToolsHub',
    description:
      'Extract specific pages or page ranges from any PDF. Select visually or enter ranges. 100% private.',
    url: siteUrl('/pdf-tools/extract-pages'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Extract PDF Pages — Save Specific Pages as New PDF | DevToolsHub',
    description:
      'Extract specific pages from a PDF entirely in your browser. Never uploaded.',
  },
};

export default function ExtractPagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
