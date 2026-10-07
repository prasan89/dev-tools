import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Editor — Annotate, Add Text, Images, Shapes, Drawing & Whiteout | DevToolsHub',
  description:
    'Edit and annotate PDFs directly in your browser. Add text, images, rectangles, ellipses, lines, arrows, highlights, underlines, sticky notes, callouts, freehand drawing, and whiteout covers. Your PDF is never uploaded — 100% private.',
  keywords: [
    'edit PDF online',
    'annotate PDF',
    'add comments to PDF',
    'add notes to PDF',
    'PDF annotation tool',
    'sticky note PDF',
    'callout PDF',
    'add text to PDF',
    'add image to PDF',
    'highlight PDF',
    'underline PDF',
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
    title: 'PDF Editor — Annotate, Add Text, Images, Shapes, Drawing & Whiteout | DevToolsHub',
    description:
      'Edit and annotate PDFs in your browser. Add text, images, shapes, sticky notes, callouts, freehand drawing, and whiteout. 100% private — your PDF never leaves your device.',
    url: siteUrl('/pdf-tools/edit-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Editor & Annotator — Add Notes, Shapes, Drawing & Whiteout | DevToolsHub',
    description:
      'Annotate and edit PDFs entirely in your browser. Add sticky notes, callouts, highlights, draw, and cover content. Never uploaded.',
  },
};

export default function EditPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
