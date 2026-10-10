import { MetadataRoute } from 'next';
import { getEnabledTools, getCategories } from '@/lib/registry';
import { getDatasets } from '@/lib/datasets';
import { getAllIndexablePdfToolPaths } from '@/lib/seo/pdf-tools';
import { SITE_URL } from '@/lib/seo/site-config';
import { CALCULATORS } from '@/lib/calculators/catalog';

const BUILD_DATE = new Date();

// PDF tools with higher search interest get a small priority boost
const HIGH_PRIORITY_PDF_TOOLS = new Set([
  '/pdf-tools/merge-pdf',
  '/pdf-tools/split-pdf',
  '/pdf-tools/compress-pdf',
  '/pdf-tools/pdf-to-jpg',
  '/pdf-tools/jpg-png-to-pdf',
  '/pdf-tools/pdf-to-word',
  '/pdf-tools/word-to-pdf',
  '/pdf-tools/ocr',
  '/pdf-tools/ocr-searchable-pdf',
  '/pdf-tools/protect-pdf',
  '/pdf-tools/unlock-pdf',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getEnabledTools();
  const categories = getCategories();
  const datasets = getDatasets();
  const indexablePdfPaths = getAllIndexablePdfToolPaths();
  const calculatorEntries: MetadataRoute.Sitemap = CALCULATORS.map((calculator) => ({
    url: `${SITE_URL}/calculators/${calculator.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

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

  // All indexable PDF tool pages — driven by the SEO registry so they stay in sync
  const pdfToolEntries: MetadataRoute.Sitemap = indexablePdfPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: HIGH_PRIORITY_PDF_TOOLS.has(path) ? 0.85 : 0.75,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/datasets`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/pdf-tools`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/calculators`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/donate`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...pdfToolEntries,
    ...calculatorEntries,
    ...categoryEntries,
    ...toolEntries,
    ...datasetEntries,
  ];
}
