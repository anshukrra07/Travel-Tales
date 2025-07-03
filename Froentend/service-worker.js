const CACHE_NAME = "travel-tales-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/account.html",
  "/login.html",
  "/admin.html",
  "/css/style.css",
  "/js/account.js",
  "/js/config.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});