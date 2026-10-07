import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolEntries,
  ];
}
