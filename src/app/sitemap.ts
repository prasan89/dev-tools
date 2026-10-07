import { MetadataRoute } from 'next';
import { getEnabledTools, getCategories } from '@/lib/registry';
import { getDatasets } from '@/lib/datasets';
import { SITE_URL } from '@/lib/seo/site-config';

const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getEnabledTools();
  const categories = getCategories();
  const datasets = getDatasets();

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly',
    priority: tool.popular ? 0.9 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/tools/category/${cat.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const datasetEntries: MetadataRoute.Sitemap = datasets.map((d) => ({
    url: `${SITE_URL}/datasets/${d.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: d.popular ? 0.8 : 0.6,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/datasets`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/donate`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...categoryEntries,
    ...toolEntries,
    ...datasetEntries,
  ];
}
