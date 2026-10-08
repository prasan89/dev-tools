// PDFTools Service Worker
// Caches app shell and static assets for offline use.
// User documents are NEVER cached here — they stay in the browser session only.
//
// Cache versioning: bump CACHE_VERSION when deploying breaking changes to the SW
// so old caches are cleaned up on activation.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `devtoolshub-${CACHE_VERSION}`;

// App shell routes to precache on install
const APP_SHELL = [
  '/',
  '/pdf-tools',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache or intercept non-GET requests
  if (request.method !== 'GET') return;

  // Never intercept requests to external origins (analytics, ads, fonts)
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML navigation (ensures fresh page versions)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r ?? Response.error()))
    );
    return;
  }

  // Cache-first for _next/static assets (they are content-hashed and immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Cache-first for the PDF.js worker and WASM assets in /public
  if (
    url.pathname === '/pdf.worker.min.mjs' ||
    url.pathname.startsWith('/wasm/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network only (no caching for API routes, unknown assets)
});
