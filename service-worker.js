CACHE_NAME = "jaydeep-singh-app-v2";
const APP_SHELL = [
"./",
"./index.html",
"./manifest.json",
"./assets/icon-192.png",
"./assets/icon-512.png"
];const

self.addEventListener("install", event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => cache.addAll(APP_SHELL).catch(() => {}))
.then(() => self.skipWaiting())
);
});

self.addEventListener("activate", event => {
event.waitUntil(
caches.keys()
.then(keys => Promise.all(
keys.filter(key => key.startsWith("jaydeep-singh-app-") && key !== CACHE_NAME)
.map(key => caches.delete(key))
))
.then(() => self.clients.claim())
);
});

self.addEventListener("message", event => {
if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
const request = event.request;
const url = new URL(request.url);

if (request.method !== "GET" || url.origin !== self.location.origin) return;

// Always check the latest HTML from the network first; use cache only offline.
if (request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")) {
event.respondWith(
fetch(request, { cache: "no-store" })
.then(response => {
if (response && response.ok) {
const copy = response.clone();
caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
}
return response;
})
.catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
);
return;
}

// Cache-first for local assets; refresh the cache when network is available.
event.respondWith(
caches.match(request).then(cached => {
const network = fetch(request).then(response => {
if (response && response.ok) {
const copy = response.clone();
caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
}
return response;
}).catch(() => cached);
return cached || network;
})
);
});
