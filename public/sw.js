/* Rhett's Cookbook service worker.
   Built assets are injected into BUILT_ASSETS by scripts/inject-precache.mjs.
   Paths are relative to this file so the worker follows the /CookBook/ base. */
const CACHE = 'rhetts-cookbook-v1';
const SCOPE_URL = new URL('./', self.location);

const BUILT_ASSETS = [];

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
].concat(BUILT_ASSETS);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        PRECACHE.map(async (path) => {
          try {
            await cache.add(new Request(new URL(path, SCOPE_URL), { cache: 'reload' }));
          } catch {
            // Skip a single missing file so one bad URL cannot block install.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'CACHE_URLS' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        data.urls.map(async (url) => {
          if (typeof url !== 'string') return;
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch {
            // Ignore a URL the browser will not cache.
          }
        }),
      );
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_URL.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  const shell = new URL('./index.html', SCOPE_URL);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(shell, response.clone());
    }
    return response;
  } catch {
    const cached = (await cache.match(shell)) || (await cache.match(new URL('./', SCOPE_URL)));
    if (cached) return cached;
    return new Response('Rhett\'s Cookbook is offline. Connect once, then try again.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok && (response.type === 'basic' || response.type === 'default')) {
        void cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const fresh = await network;
  if (fresh) return fresh;
  return new Response('', { status: 504, statusText: 'Offline' });
}
