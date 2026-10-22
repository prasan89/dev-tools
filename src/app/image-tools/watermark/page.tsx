import type { Metadata } from 'next';
import WatermarkClient from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Add Watermark to Image Online Free | DevToolsHub',
  description: 'Add customizable text watermarks to images locally in your browser. Adjust position, size, and opacity without uploading files.',
  alternates: { canonical: siteUrl('/image-tools/watermark') },
};

export default function WatermarkPage() { return <WatermarkClient />; }
