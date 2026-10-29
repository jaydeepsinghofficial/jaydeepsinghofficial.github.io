const CACHE = 'jaydeep-singh-app-v6';

const CORE = [
  './',
  './index.html',
  './manifest.json'
];

const OPTIONAL = [
  './data/syllabus-data.js',
  './data/question-bank.js',
  './profile.jpg',
  './book-cover.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    await cache.addAll(CORE);

    await Promise.all(
      OPTIONAL.map(async path => {
        try {
          const response = await fetch(path);

          if (response.ok) {
            await cache.put(path, response);
          }
        } catch (error) {
          console.warn('Optional file skipped:', path);
        }
      })
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith('jaydeep-singh-app-') &&
          key !== CACHE
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);

    if (cached) return cached;

    try {
      const response = await fetch(event.request);

      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return (await caches.match('./index.html')) ||
          new Response('Offline: page unavailable', {
            status: 503
          });
      }

      return new Response('Offline', { status: 503 });
    }
  })());
});
