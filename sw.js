const CACHE = 'flightpay-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './pdf.min.mjs',
  './pdf.worker.min.mjs'
];

self.addEventListener('install', (event) => {
  // cache each asset independently - addAll() is all-or-nothing, so one missing/renamed
  // file (e.g. after a GitHub upload that flattens folders) would otherwise fail the
  // whole install and leave everyone stuck on the previous cached version forever
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url).catch((err) => console.warn('sw: could not cache', url, err))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === 'GET' && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
