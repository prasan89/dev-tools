import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Crop PDF — Remove Margins & Whitespace Online | DevToolsHub',
  description:
    'Visually crop PDF pages in your browser. Drag to set the crop area, choose a preset or custom region, and apply to one or all pages. Your PDF is never uploaded — 100% private.',
  keywords: [
    'crop PDF',
    'crop PDF pages',
    'remove PDF margins',
    'trim PDF whitespace',
    'PDF crop tool',
    'PDF crop online',
    'free PDF crop',
    'browser PDF crop',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/crop-pdf'),
  },
  openGraph: {
    title: 'Crop PDF — Remove Margins & Whitespace Online | DevToolsHub',
    description:
      'Visually crop PDF pages in your browser. Set a crop area, choose presets, and download. 100% private.',
    url: siteUrl('/pdf-tools/crop-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Crop PDF — Remove Margins & Whitespace Online | DevToolsHub',
    description:
      'Visually crop PDF pages in your browser. Your PDF is never uploaded.',
  },
};

export default function CropPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
