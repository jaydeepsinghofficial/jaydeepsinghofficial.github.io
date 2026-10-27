
const CACHE_NAME = "jaydeep-singh-app-v4";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install the new service worker and cache essential files.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Remove old versions of this app's cache.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith("jaydeep-singh-app-") &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch updated pages from the network whenever possible.
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle only GET requests from this website.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // For page navigation, prefer the latest network response.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy))
              .catch(() => {});

          }
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request)
          ) || (
            await caches.match("./index.html")
          ) || Response.error();
        })
    );

    return;
  }

  // For other same-origin resources, use cache first.
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;

        return fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy))
              .catch(() => {});
          }

          return response;
        });
      })
  );
});
