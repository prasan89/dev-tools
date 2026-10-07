import { Metadata } from 'next';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, siteUrl } from './seo/site-config';
import type { ToolDefinition, Category } from '@/types/tool';
import type { DatasetMeta } from '@/types/dataset';

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION, siteUrl };

export function buildMetadata({
  title,
  description,
  path = '',
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Developer Tools That Just Work`;
  const pageDescription = description || SITE_DESCRIPTION;
  const canonical = siteUrl(path);
  const ogImage = image || siteUrl('/og-image.png');

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildToolMetadata(tool: ToolDefinition): Metadata {
  const canonical = siteUrl(`/tools/${tool.slug}`);
  // seoTitle is already the full title — do not append site suffix again
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
    keywords: tool.keywords,
  };
}

export function buildCategoryMetadata(category: Category): Metadata {
  const canonical = siteUrl(`/tools/category/${category.slug}`);
  const title = `${category.name} — ${SITE_NAME}`;
  const description = `Free online ${category.name.toLowerCase()}. ${category.description}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function buildDatasetMetadata(dataset: DatasetMeta): Metadata {
  const canonical = siteUrl(`/datasets/${dataset.slug}`);
  // seoTitle is already the full title — do not append site suffix again
  return {
    title: dataset.seoTitle,
    description: dataset.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: dataset.seoTitle,
      description: dataset.seoDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dataset.seoTitle,
      description: dataset.seoDescription,
    },
    keywords: dataset.tags,
  };
}
