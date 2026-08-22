const VERSION = 'triplog-v3.14.23';
const STATIC = [
  '/TripLog/manifest.json',
  '/TripLog/icon-192.png',
  '/TripLog/icon-512.png'
];

// Install — cache only static assets, NOT index.html
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

// Activate — delete all old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// index.html → ALWAYS network, never cache
// everything else → network first, fall back to cache
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = url.pathname === '/TripLog/' || 
                 url.pathname === '/TripLog/index.html' ||
                 url.pathname.endsWith('/TripLog');

  if (isHTML) {
    // Never serve index.html from cache — always fresh
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Static assets: network first, cache fallback
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const copy = response.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
