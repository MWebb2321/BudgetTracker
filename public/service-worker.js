const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "/index.js",
  "db.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

// Install
self.addEventListener("install", function (evt) {
  // Pre-Cache Transaction Data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
  );

  // Pre-Cache All Static Assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // Tell Browser to activate service worker once install is done
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.included("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If response is good, clone and store in cache
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // Network request failed, try to get from cache
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});
