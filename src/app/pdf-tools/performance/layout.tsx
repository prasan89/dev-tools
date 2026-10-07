import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Performance & Speed — Fast, Free & Private PDF Tools | DevToolsHub',
  description:
    'How DevToolsHub keeps PDF tools fast: lazy loading, Web Workers, WebAssembly and efficient memory management. All processing stays in your browser.',
  keywords: [
    'fast PDF tools',
    'browser PDF performance',
    'PDF tools without uploading',
    'private PDF tools',
    'offline PDF tools',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/performance'),
  },
  openGraph: {
    title: 'Fast, Free & Private PDF Tools | DevToolsHub',
    description: 'How we keep PDF processing fast and private in the browser.',
    url: siteUrl('/pdf-tools/performance'),
    type: 'website',
  },
};

export default function PerformanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
