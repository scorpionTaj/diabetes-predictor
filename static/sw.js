// static/sw.js

// Cache version and assets to cache
const CACHE_NAME = "diabetes-predictor-cache-v1";
const urlsToCache = [
  "/",
  "/about",
  "/static/manifest.json",
  "/static/gen/packed.css",
  "/static/gen/packed.js",
  // Cache additional assets: images, fonts, etc.
];

// Install event - cache necessary assets
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when available
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
