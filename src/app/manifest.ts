import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevToolsHub — Free PDF & Developer Tools',
    short_name: 'DevToolsHub',
    description:
      'Fast, free and private PDF tools. Process files directly in your browser — no uploads required.',
    start_url: '/pdf-tools',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#2563eb',
    orientation: 'any',
    icons: [
      {
        src: '/next.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['productivity', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    scope: '/',
    prefer_related_applications: false,
  };
}
