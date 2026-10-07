import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Web Worker Architecture — Browser-Based PDF Processing | DevToolsHub',
  description:
    'How DevToolsHub uses Web Workers to keep the UI responsive during heavy PDF operations. All processing stays in your browser.',
  keywords: [
    'PDF Web Workers',
    'browser PDF processing',
    'client-side PDF tools',
    'offline PDF processing',
    'PDF performance',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/workers'),
  },
  openGraph: {
    title: 'PDF Web Worker Architecture | DevToolsHub',
    description: 'How heavy PDF operations run off the main thread using Web Workers.',
    url: siteUrl('/pdf-tools/workers'),
    type: 'website',
  },
};

export default function WorkersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
