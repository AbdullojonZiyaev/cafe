// Caching intentionally removed: every request should hit the network each time.
// This still purges any caches left behind by previous versions of this worker.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
  );
  self.clients.claim();
});
