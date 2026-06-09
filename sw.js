const VERSION = 'triplog-v3.11.9b';
const ASSETS = [
  '/TripLog/',
  '/TripLog/index.html',
  '/TripLog/manifest.json',
  '/TripLog/icon-192.png',
  '/TripLog/icon-512.png'
];

// Install — cache all assets under new version key
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(ASSETS))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// Activate — delete all old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch — network first, fall back to cache
// Network-first ensures users always get fresh content when online
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Update cache with fresh response
        const copy = response.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
