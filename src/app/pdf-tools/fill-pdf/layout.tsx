import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Fill PDF Form — Fill AcroForm Fields Online Free | DevToolsHub',
  description:
    'Fill PDF form fields directly in your browser — text fields, checkboxes, radio buttons, and dropdowns. Export your completed form as a PDF. 100% private, never uploaded.',
  keywords: [
    'fill PDF form online',
    'fill PDF form free',
    'fill AcroForm PDF',
    'fill PDF fields browser',
    'PDF form filler',
    'complete PDF form',
    'fill text fields PDF',
    'PDF checkbox',
    'PDF radio button',
    'PDF dropdown',
    'interactive PDF form',
    'fill PDF no upload',
    'PDF form fill browser',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/fill-pdf'),
  },
  openGraph: {
    title: 'Fill PDF Form — Fill AcroForm Fields Online Free | DevToolsHub',
    description:
      'Fill PDF forms in your browser. Text fields, checkboxes, radio buttons, dropdowns — then export. 100% private, never uploaded.',
    url: siteUrl('/pdf-tools/fill-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fill PDF Form Online Free | DevToolsHub',
    description:
      'Fill PDF form fields in your browser — text, checkboxes, radio buttons, dropdowns. Export filled PDF. Never uploaded.',
  },
};

export default function FillPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
