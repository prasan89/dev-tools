import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to SVG — Convert PDF Pages to SVG Online Free | DevToolsHub',
  description:
    'Convert PDF pages to SVG vector format directly in your browser. 100% private — your PDF never leaves your device.',
  keywords: ['PDF to SVG', 'convert PDF to SVG', 'PDF SVG export', 'PDF vector export'],
  alternates: { canonical: siteUrl('/pdf-tools/pdf-to-svg') },
  openGraph: {
    title: 'PDF to SVG | DevToolsHub',
    description: 'Convert PDF pages to SVG in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-svg'),
    type: 'website',
  },
};

export default function PdfToSvgLayout({ children }: { children: React.ReactNode }) {
  return children;
}
