// Single source of truth for site-wide SEO configuration.
// Set NEXT_PUBLIC_SITE_URL in your environment to use a real domain.
// If unset, defaults to a safe localhost URL — never a hardcoded production domain.

export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const SITE_NAME = 'DevToolsHub';

export const SITE_DESCRIPTION =
  'Free online developer tools for JSON, encoding, date & time, regex, SQL, XML, YAML, text and more. All processing happens in your browser.';

export function siteUrl(path: string = ''): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
