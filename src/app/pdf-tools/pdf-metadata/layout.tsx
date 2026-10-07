import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Metadata Editor — Edit & Remove PDF Properties Online Free | DevToolsHub',
  description:
    'View, edit, or remove PDF document metadata — title, author, subject, keywords, creator, producer, and dates — entirely in your browser. No uploads, 100% private.',
  keywords: [
    'edit PDF metadata',
    'remove PDF metadata',
    'PDF metadata remover',
    'PDF metadata editor',
    'PDF document properties',
    'edit PDF author title',
    'remove PDF author',
    'clear PDF metadata',
    'PDF info editor online',
    'PDF properties editor free',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/pdf-metadata'),
  },
  openGraph: {
    title: 'PDF Metadata Editor — Edit & Remove PDF Properties | DevToolsHub',
    description:
      'Edit or clear PDF document metadata (title, author, subject, keywords, dates) in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-metadata'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Metadata Editor Online Free | DevToolsHub',
    description: 'Edit or remove PDF title, author, subject, keywords and dates. Works in your browser — never uploaded.',
  },
};

export default function PdfMetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}
