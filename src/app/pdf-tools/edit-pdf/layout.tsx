import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Editor — Add Text, Images, Shapes, Drawing & Whiteout | DevToolsHub',
  description:
    'Edit PDFs directly in your browser. Add text, images, rectangles, ellipses, lines, arrows, highlights, underlines, strikethroughs, freehand drawing, and whiteout covers. Your PDF is never uploaded — 100% private.',
  keywords: [
    'edit PDF online',
    'add text to PDF',
    'add image to PDF',
    'highlight PDF',
    'underline PDF',
    'annotate PDF',
    'draw on PDF',
    'PDF editor',
    'free PDF editor browser',
    'PDF shapes',
    'PDF arrows',
    'whiteout PDF',
    'cover text PDF',
    'freehand PDF',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/edit-pdf'),
  },
  openGraph: {
    title: 'PDF Editor — Add Text, Images, Shapes, Drawing & Whiteout | DevToolsHub',
    description:
      'Edit PDFs in your browser. Add text, images, shapes, freehand drawing, and whiteout. 100% private — your PDF never leaves your device.',
    url: siteUrl('/pdf-tools/edit-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Editor — Add Text, Images, Shapes, Drawing & Whiteout | DevToolsHub',
    description:
      'Edit PDFs entirely in your browser. Never uploaded. Highlight, annotate, draw, cover content with whiteout.',
  },
};

export default function EditPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
