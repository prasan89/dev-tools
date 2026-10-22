import type { Metadata } from 'next';
import BlurClient from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Blur Image Online Free | DevToolsHub',
  description: 'Blur images online with adjustable intensity. Preview and download locally without uploading your photo.',
  alternates: { canonical: siteUrl('/image-tools/blur') },
};

export default function BlurPage() { return <BlurClient />; }
