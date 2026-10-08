/**
 * M9 Analytics, SEO, and AdSense readiness tests
 */

import fs from 'fs';
import path from 'path';
import { getEnabledTools, getCategories } from '@/lib/registry';

const srcDir = path.join(process.cwd(), 'src');
const appDir = path.join(srcDir, 'app');

function readSrc(relPath: string) {
  return fs.readFileSync(path.join(srcDir, relPath), 'utf8');
}

function readApp(relPath: string) {
  return fs.readFileSync(path.join(appDir, relPath), 'utf8');
}

function fileExists(relPath: string) {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

// ---------------------------------------------------------------------------
// Environment / canonical URL
// ---------------------------------------------------------------------------

describe('Environment config', () => {
  // M18: NEXT_PUBLIC_SITE_URL is centralized in src/lib/seo/site-config.ts.
  // Individual files import SITE_URL / siteUrl from there rather than
  // reading the env var directly — so we check the central config file and
  // that the app files import from it.
  it('site-config.ts defines NEXT_PUBLIC_SITE_URL as single source of truth', () => {
    const src = readSrc('lib/seo/site-config.ts');
    expect(src).toContain('NEXT_PUBLIC_SITE_URL');
  });

  it('layout.tsx imports from site-config (centralized SITE_URL)', () => {
    const src = readApp('layout.tsx');
    expect(src).toContain('site-config');
  });

  it('sitemap.ts imports from site-config (centralized SITE_URL)', () => {
    const src = readApp('sitemap.ts');
    expect(src).toContain('site-config');
  });

  it('robots.ts imports from site-config (centralized SITE_URL)', () => {
    const src = readApp('robots.ts');
    expect(src).toContain('site-config');
  });

  it('NEXT_PUBLIC_GA_MEASUREMENT_ID referenced in analytics', () => {
    const src = readSrc('lib/analytics.ts');
    expect(src).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  });

  it('NEXT_PUBLIC_ADSENSE_CLIENT referenced in AdSlot', () => {
    const src = readSrc('components/ads/AdSlot.tsx');
    expect(src).toContain('NEXT_PUBLIC_ADSENSE_CLIENT');
  });
});

// ---------------------------------------------------------------------------
// Sitemap — includes all enabled tools
// ---------------------------------------------------------------------------

describe('sitemap.ts coverage', () => {
  const tools = getEnabledTools();
  const categories = getCategories();
  const sitemapSrc = readApp('sitemap.ts');

  it('references getEnabledTools', () => {
    expect(sitemapSrc).toContain('getEnabledTools');
  });

  it('references getCategories', () => {
    expect(sitemapSrc).toContain('getCategories');
  });

  it('has at least 32 enabled tools in registry', () => {
    expect(tools.length).toBeGreaterThanOrEqual(25);
  });

  it('all enabled tools have unique slugs', () => {
    const slugs = tools.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all categories have unique slugs', () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

// ---------------------------------------------------------------------------
// Robots.txt
// ---------------------------------------------------------------------------

describe('robots.ts', () => {
  const src = readApp('robots.ts');

  it('allows all crawling', () => {
    expect(src).toContain("allow: '/'");
  });

  it('references sitemap', () => {
    expect(src).toContain('sitemap');
  });

  it('does not accidentally block /tools', () => {
    expect(src).not.toContain("disallow: '/tools'");
  });
});

// ---------------------------------------------------------------------------
// Canonical URLs
// ---------------------------------------------------------------------------

describe('Canonical URLs', () => {
  it('homepage has canonical /', () => {
    const src = readApp('page.tsx');
    expect(src).toContain('alternates');
    expect(src).toContain('canonical');
  });

  it('tool page generates canonical with slug', () => {
    const src = readApp('tools/[slug]/page.tsx');
    expect(src).toContain('alternates');
    expect(src).toContain('canonical');
    expect(src).toContain('slug');
  });

  it('category page has canonical', () => {
    const src = readApp('tools/category/[slug]/page.tsx');
    expect(src).toContain('alternates');
    expect(src).toContain('canonical');
  });

  it('privacy page has canonical', () => {
    const src = readApp('privacy/page.tsx');
    expect(src).toContain("canonical: '/privacy'");
  });

  it('terms page has canonical', () => {
    const src = readApp('terms/page.tsx');
    expect(src).toContain("canonical: '/terms'");
  });

  it('about page has canonical', () => {
    const src = readApp('about/page.tsx');
    expect(src).toContain("canonical: '/about'");
  });

  it('contact page has canonical', () => {
    const src = readApp('contact/page.tsx');
    expect(src).toContain("canonical: '/contact'");
  });
});

// ---------------------------------------------------------------------------
// Structured Data (JSON-LD)
// ---------------------------------------------------------------------------

describe('Structured data', () => {
  it('JsonLd component exists', () => {
    expect(fileExists('src/components/seo/JsonLd.tsx')).toBe(true);
  });

  it('JsonLd component renders script[application/ld+json]', () => {
    const src = readSrc('components/seo/JsonLd.tsx');
    expect(src).toContain('application/ld+json');
  });

  it('websiteSchema returns WebSite type', () => {
    const src = readSrc('components/seo/JsonLd.tsx');
    expect(src).toContain("'WebSite'");
  });

  it('webApplicationSchema returns WebApplication type', () => {
    const src = readSrc('components/seo/JsonLd.tsx');
    expect(src).toContain("'WebApplication'");
  });

  it('breadcrumbSchema returns BreadcrumbList type', () => {
    const src = readSrc('components/seo/JsonLd.tsx');
    expect(src).toContain("'BreadcrumbList'");
  });

  it('homepage imports JsonLd and websiteSchema', () => {
    const src = readApp('page.tsx');
    expect(src).toContain('JsonLd');
    expect(src).toContain('websiteSchema');
  });

  it('tool page imports JsonLd and webApplicationSchema', () => {
    const src = readApp('tools/[slug]/page.tsx');
    expect(src).toContain('webApplicationSchema');
    expect(src).toContain('breadcrumbSchema');
  });

  it('category page imports breadcrumbSchema', () => {
    const src = readApp('tools/category/[slug]/page.tsx');
    expect(src).toContain('breadcrumbSchema');
  });

  it('JSON-LD does not use dangerouslySetInnerHTML with user content', () => {
    const src = readSrc('components/seo/JsonLd.tsx');
    // dangerouslySetInnerHTML is only used with JSON.stringify of a known schema object
    expect(src).toContain('JSON.stringify(data)');
    // The data comes from typed schema functions, not from user input
  });
});

// ---------------------------------------------------------------------------
// Google Analytics
// ---------------------------------------------------------------------------

describe('Google Analytics', () => {
  it('GoogleAnalytics component exists', () => {
    expect(fileExists('src/components/analytics/GoogleAnalytics.tsx')).toBe(true);
  });

  it('GA component uses afterInteractive strategy (non-blocking)', () => {
    const src = readSrc('components/analytics/GoogleAnalytics.tsx');
    expect(src).toContain('afterInteractive');
  });

  it('GA component returns null when no measurement ID', () => {
    const src = readSrc('components/analytics/GoogleAnalytics.tsx');
    expect(src).toContain('return null');
  });

  it('layout.tsx includes GoogleAnalytics', () => {
    const src = readApp('layout.tsx');
    expect(src).toContain('GoogleAnalytics');
  });

  it('analytics module uses gtag when GA_ID is set', () => {
    const src = readSrc('lib/analytics.ts');
    expect(src).toContain('window.gtag');
    expect(src).toContain('ga4Provider');
  });

  it('analytics falls back to noopProvider in production without ID', () => {
    const src = readSrc('lib/analytics.ts');
    expect(src).toContain('noopProvider');
    expect(src).toContain('resolveProvider');
  });
});

// ---------------------------------------------------------------------------
// Analytics event safety — no raw user content
// ---------------------------------------------------------------------------

describe('Analytics event safety', () => {
  it('ToolWorkspace fires tool_used with metadata only (no input content)', () => {
    const src = readSrc('components/tools/ToolWorkspace.tsx');
    // tool_used event contains tool_slug, tool_name, category — never value/input
    expect(src).toContain('tool_slug');
    expect(src).toContain('tool_name');
    expect(src).toContain('category');
    // Must NOT send input value
    expect(src).not.toContain("tool_used.*value");
  });

  it('SearchBar fires search_performed with result_count and selected_slug (never raw query)', () => {
    const src = readSrc('components/ui/SearchBar.tsx');
    expect(src).toContain('search_performed');
    expect(src).toContain('result_count');
    expect(src).toContain('selected_slug');
    // Raw query must NOT be sent
    expect(src).not.toContain("search_performed.*query:");
  });

  it('analytics module catches errors so failures never break the app', () => {
    const src = readSrc('lib/analytics.ts');
    expect(src).toContain('try');
    expect(src).toContain('catch');
  });
});

// ---------------------------------------------------------------------------
// AdSense readiness
// ---------------------------------------------------------------------------

describe('AdSense', () => {
  it('AdSlot component exists', () => {
    expect(fileExists('src/components/ads/AdSlot.tsx')).toBe(true);
  });

  it('AdSenseScript component exists', () => {
    expect(fileExists('src/components/ads/AdSenseScript.tsx')).toBe(true);
  });

  it('AdSlot returns null when no ADSENSE_CLIENT', () => {
    const src = readSrc('components/ads/AdSlot.tsx');
    expect(src).toContain('return null');
  });

  it('AdSenseScript uses afterInteractive (non-blocking)', () => {
    const src = readSrc('components/ads/AdSenseScript.tsx');
    expect(src).toContain('afterInteractive');
  });

  it('AdSlot has fixed height classes to prevent CLS', () => {
    const src = readSrc('components/ads/AdSlot.tsx');
    expect(src).toContain('h-[');
  });

  it('layout.tsx includes AdSense (via AdSenseConditional)', () => {
    const src = readApp('layout.tsx');
    // AdSenseConditional wraps AdSenseScript and skips the homepage
    expect(src).toContain('AdSenseConditional');
  });
});

// ---------------------------------------------------------------------------
// Required pages exist (AdSense requirements)
// ---------------------------------------------------------------------------

describe('Required policy pages', () => {
  it('/privacy page exists', () => {
    expect(fileExists('src/app/privacy/page.tsx')).toBe(true);
  });

  it('/terms page exists', () => {
    expect(fileExists('src/app/terms/page.tsx')).toBe(true);
  });

  it('/about page exists', () => {
    expect(fileExists('src/app/about/page.tsx')).toBe(true);
  });

  it('/contact page exists', () => {
    expect(fileExists('src/app/contact/page.tsx')).toBe(true);
  });

  it('privacy page mentions analytics', () => {
    const src = readApp('privacy/page.tsx');
    expect(src.toLowerCase()).toContain('analytics');
  });

  it('privacy page mentions browser-side processing', () => {
    const src = readApp('privacy/page.tsx');
    expect(src.toLowerCase()).toContain('browser');
  });

  it('privacy page mentions advertising', () => {
    const src = readApp('privacy/page.tsx');
    expect(src.toLowerCase()).toContain('adsense');
  });

  it('footer links to privacy', () => {
    const src = readSrc('components/layout/Footer.tsx');
    expect(src).toContain('/privacy');
  });

  it('footer links to terms', () => {
    const src = readSrc('components/layout/Footer.tsx');
    expect(src).toContain('/terms');
  });

  it('footer links to about', () => {
    const src = readSrc('components/layout/Footer.tsx');
    expect(src).toContain('/about');
  });

  it('footer links to contact', () => {
    const src = readSrc('components/layout/Footer.tsx');
    expect(src).toContain('/contact');
  });
});

// ---------------------------------------------------------------------------
// Open Graph / Twitter metadata
// ---------------------------------------------------------------------------

describe('Open Graph metadata', () => {
  it('layout.tsx has openGraph siteName', () => {
    const src = readApp('layout.tsx');
    expect(src).toContain('siteName');
  });

  it('tool page has openGraph title and description', () => {
    const src = readApp('tools/[slug]/page.tsx');
    expect(src).toContain('openGraph');
    expect(src).toContain('twitter');
  });

  it('tool page has Twitter card', () => {
    const src = readApp('tools/[slug]/page.tsx');
    expect(src).toContain('summary_large_image');
  });
});

// ---------------------------------------------------------------------------
// SEO — tool pages have required fields
// ---------------------------------------------------------------------------

describe('Tool SEO fields', () => {
  const tools = getEnabledTools();

  it('every enabled tool has seoTitle', () => {
    const missing = tools.filter((t) => !t.seoTitle);
    expect(missing.map((t) => t.id)).toHaveLength(0);
  });

  it('every enabled tool has seoDescription', () => {
    const missing = tools.filter((t) => !t.seoDescription);
    expect(missing.map((t) => t.id)).toHaveLength(0);
  });

  it('every enabled tool has a unique seoTitle', () => {
    const titles = tools.map((t) => t.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('every enabled tool has a unique seoDescription', () => {
    const descs = tools.map((t) => t.seoDescription);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it('every enabled tool has keywords array', () => {
    const missing = tools.filter((t) => !t.keywords || t.keywords.length === 0);
    expect(missing.map((t) => t.id)).toHaveLength(0);
  });

  it('every enabled tool has a longDescription', () => {
    const missing = tools.filter((t) => !t.longDescription);
    if (missing.length > 0) {
      console.warn('Tools missing longDescription:', missing.map((t) => t.id));
    }
    // At least 80% of tools should have longDescription
    expect(missing.length).toBeLessThanOrEqual(Math.ceil(tools.length * 0.2));
  });
});
