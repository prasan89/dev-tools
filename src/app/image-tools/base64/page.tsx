import type { Metadata } from 'next';
import Base64Client from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Image to Base64 Converter Online | DevToolsHub',
  description: 'Convert images to Base64 data URLs in your browser. Copy the result for HTML, CSS, or JSON without uploading files.',
  alternates: { canonical: siteUrl('/image-tools/base64') },
};

export default function ImageBase64Page() { return <Base64Client />; }
