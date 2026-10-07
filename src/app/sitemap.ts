import { MetadataRoute } from 'next';
import { getEnabledTools, getCategories } from '@/lib/registry';
import { getDatasets } from '@/lib/datasets';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getEnabledTools();
  const categories = getCategories();
  const datasets = getDatasets();

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'monthly',
    priority: tool.popular ? 0.9 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/tools/category/${cat.slug}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const datasetHubEntry: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/datasets`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  };

  const datasetEntries: MetadataRoute.Sitemap = datasets.map((d) => ({
    url: `${SITE_URL}/datasets/${d.slug}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'monthly' as const,
    priority: d.popular ? 0.8 : 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    datasetHubEntry,
    ...categoryEntries,
    ...toolEntries,
    ...datasetEntries,
  ];
}
