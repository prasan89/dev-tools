import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Create PDF Form Fields — Add AcroForm Fields to PDF | DevToolsHub',
  description:
    'Add interactive form fields to any PDF directly in your browser — text boxes, checkboxes, radio buttons, dropdowns, and signature fields. Export an interactive AcroForm PDF. 100% private, never uploaded.',
  keywords: [
    'create PDF form fields',
    'add form fields to PDF',
    'PDF form builder',
    'AcroForm PDF creator',
    'add text field to PDF',
    'add checkbox to PDF',
    'add radio button to PDF',
    'add dropdown to PDF',
    'interactive PDF form',
    'PDF form editor browser',
    'create fillable PDF',
    'PDF form no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/create-pdf-form'),
  },
  openGraph: {
    title: 'Create PDF Form Fields — Add AcroForm Fields to PDF | DevToolsHub',
    description:
      'Add text boxes, checkboxes, radio buttons, and dropdowns to any PDF in your browser. Export an interactive fillable PDF. Never uploaded.',
    url: siteUrl('/pdf-tools/create-pdf-form'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Create PDF Form Fields Online Free | DevToolsHub',
    description:
      'Build interactive PDF forms in your browser. Add text, checkboxes, radios, dropdowns. Export as AcroForm PDF. Never uploaded.',
  },
};

export default function CreatePdfFormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
