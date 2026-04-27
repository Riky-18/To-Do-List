const CACHE_NAME = "bloom-shell-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest?v=20260427-round",
  "./assets/logo-title.png?v=20260427-round",
  "./icons/logo-mark.png",
  "./icons/icon-192.png?v=20260427-round",
  "./icons/icon-512.png?v=20260427-round",
  "./icons/apple-touch-icon.png?v=20260427-round",
  "./icons/favicon-32.png?v=20260427-round",
  "./icons/favicon-16.png?v=20260427-round"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
