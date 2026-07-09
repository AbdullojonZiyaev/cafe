const CACHE_NAME = "cafe-menu-v2";
const ASSETS_TO_CACHE = [
  "/manifest.json",
  "/media/story-1-mobile.mp4",
  "/media/story-2-mobile.mp4",
  "/media/story-3-mobile.mp4",
  "/media/story-1.jpg",
  "/media/story-2.jpg",
  "/media/story-3.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("Cache.addAll error (some assets may not be available):", err);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  // Do not intercept Next.js internals (HMR/chunks/data) or cross-origin requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/_next/")) {
    return;
  }

  // Use network-first for document requests to avoid stale HTML -> missing chunk errors.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => cached || caches.match("/"));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          return new Response("Offline: Resource not available", {
            status: 503,
          });
        });
    })
  );
});
